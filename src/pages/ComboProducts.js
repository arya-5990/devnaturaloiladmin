import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadImage } from '../config/cloudinary';
import ImageUpload from '../components/ImageUpload';
import { toast } from 'react-toastify';
import { FaPlus, FaTimes, FaStar, FaEdit, FaTrash } from 'react-icons/fa';

const ComboProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    actualMRP: '',
    offeredMRP: '',
    rating: '',
    quantityValue: '',
    quantityUnit: 'ml',
    imageUrl: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Calculate discount percentage
  useEffect(() => {
    if (formData.actualMRP && formData.offeredMRP) {
      const actual = parseFloat(formData.actualMRP);
      const offered = parseFloat(formData.offeredMRP);
      if (actual > offered) {
        const discountPercent = ((actual - offered) / actual) * 100;
        setDiscount(discountPercent.toFixed(2));
      } else {
        setDiscount(0);
      }
    }
  }, [formData.actualMRP, formData.offeredMRP]);

  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, 'combo-products');
      const q = query(productsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching combo products:', error);
      toast.error('Error fetching combo products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (file) => {
    setSelectedImage(file);
  };

  const getNextProductId = async () => {
    try {
      const productsRef = collection(db, 'combo-products');
      const q = query(productsRef, orderBy('productId', 'desc'));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return 1;
      }
      
      const lastProduct = querySnapshot.docs[0].data();
      return lastProduct.productId + 1;
    } catch (error) {
      console.error('Error getting next combo product ID:', error);
      return 1;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isEditing && !selectedImage) {
      toast.error('Please select an image');
      return;
    }

    if (!formData.title || !formData.description || !formData.actualMRP || !formData.offeredMRP) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = formData.imageUrl; // Use existing image if editing and no new image selected
      
      // Upload new image to Cloudinary if selected
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      // Prepare product data
      const productData = {
        ...formData,
        imageUrl,
        actualMRP: parseFloat(formData.actualMRP),
        offeredMRP: parseFloat(formData.offeredMRP),
        rating: parseFloat(formData.rating) || 0,
        quantityValue: parseFloat(formData.quantityValue) || 0,
        quantityUnit: formData.quantityUnit,
        totalQuantity: `${formData.quantityValue || 0} ${formData.quantityUnit}`, // For display purposes
        discount: parseFloat(discount),
        updatedAt: new Date()
      };

      if (isEditing) {
        // Update existing product
        const productRef = doc(db, 'combo-products', editingProductId);
        await updateDoc(productRef, productData);
        toast.success('Combo product updated successfully!');
      } else {
        // Add new product
        const productId = await getNextProductId();
        productData.productId = productId;
        productData.createdAt = new Date();
        await addDoc(collection(db, 'combo-products'), productData);
        toast.success('Combo product added successfully!');
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        actualMRP: '',
        offeredMRP: '',
        rating: '',
        quantityValue: '',
        quantityUnit: 'ml',
        imageUrl: ''
      });
      setSelectedImage(null);
      setDiscount(0);
      setResetTrigger(prev => prev + 1);
      setIsEditing(false);
      setEditingProductId(null);

      // Close modal and refresh products
      setShowModal(false);
      await fetchProducts();

    } catch (error) {
      console.error('Error saving combo product:', error);
      if (error.code === 'permission-denied') {
        toast.error('Permission denied. Please check Firestore security rules.');
      } else if (error.code === 'unavailable') {
        toast.error('Firebase service unavailable. Please check your connection.');
      } else {
        toast.error(`Error saving combo product: ${error.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      title: '',
      description: '',
      actualMRP: '',
      offeredMRP: '',
      rating: '',
      quantityValue: '',
      quantityUnit: 'ml',
      imageUrl: ''
    });
    setSelectedImage(null);
    setDiscount(0);
    setResetTrigger(prev => prev + 1);
    setIsEditing(false);
    setEditingProductId(null);
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setEditingProductId(product.id);
    
    // Parse quantity from existing product data
    let quantityValue = '';
    let quantityUnit = 'ml';
    
    if (product.quantityValue && product.quantityUnit) {
      // If new format exists, use it
      quantityValue = product.quantityValue.toString();
      quantityUnit = product.quantityUnit;
    } else if (product.totalQuantity) {
      // If old format exists, try to parse it
      const quantityStr = product.totalQuantity.toString();
      const match = quantityStr.match(/^(\d+(?:\.\d+)?)\s*(.+)$/);
      if (match) {
        quantityValue = match[1];
        quantityUnit = match[2];
      } else {
        quantityValue = quantityStr;
        quantityUnit = 'ml';
      }
    }
    
    setFormData({
      title: product.title || '',
      description: product.description || '',
      actualMRP: product.actualMRP?.toString() || '',
      offeredMRP: product.offeredMRP?.toString() || '',
      rating: product.rating?.toString() || '',
      quantityValue: quantityValue,
      quantityUnit: quantityUnit,
      imageUrl: product.imageUrl || ''
    });
    setDiscount(product.discount || 0);
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this combo product? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'combo-products', productId));
        toast.success('Combo product deleted successfully!');
        // Refresh products
        await fetchProducts();
      } catch (error) {
        console.error('Error deleting combo product:', error);
        toast.error('Error deleting combo product');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="page-header">
        <h1>Combo Products</h1>
        <div className="loading">Loading combo products...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Combo Products ({products.length})</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaPlus /> Add Combo Product
        </button>
      </div>

      {/* Products Grid */}
      <div className="products-section">
        <div className="section-header">
          <h2>All Combo Products</h2>
        </div>
        <div className="products-grid">
          {products.length === 0 ? (
            <div className="no-products">
              <p>No combo products found. Add your first combo product!</p>
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.imageUrl} alt={product.title} />
                  {product.discount > 0 && (
                    <div className="discount-badge">
                      {product.discount}% OFF
                    </div>
                  )}
                </div>
                <div className="product-info">
                  <div className="product-header">
                    <h3>{product.title}</h3>
                    <div className="product-actions">
                      <button 
                        className="btn-icon btn-edit" 
                        onClick={() => handleEdit(product)}
                        title="Edit Combo Product"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn-icon btn-delete" 
                        onClick={() => handleDelete(product.id)}
                        title="Delete Combo Product"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <p className="description">{product.description}</p>
                  <div className="price-section">
                    <span className="offered-price">{formatPrice(product.offeredMRP)}</span>
                    {product.actualMRP > product.offeredMRP && (
                      <span className="actual-price">{formatPrice(product.actualMRP)}</span>
                    )}
                  </div>
                  <div className="product-meta">
                    {product.rating && (
                      <div className="rating">
                        <FaStar color="#ffd700" />
                        <span>{product.rating}</span>
                      </div>
                    )}
                    <div className="quantity">
                      Size: {product.totalQuantity || 0}
                    </div>
                  </div>
                  <div className="product-id">
                    ID: {product.productId}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Combo Product' : 'Add New Combo Product'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <ImageUpload 
                  onImageSelect={handleImageSelect} 
                  label="Combo Product Image" 
                  resetTrigger={resetTrigger}
                />
                
                {isEditing && formData.imageUrl && !selectedImage && (
                  <div className="current-image">
                    <label>Current Image:</label>
                    <img src={formData.imageUrl} alt="Current combo product" style={{ maxWidth: '200px', marginTop: '10px' }} />
                  </div>
                )}
                
                <div className="form-group">
                  <label>Combo Product Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter combo product title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter combo product description"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Actual MRP *</label>
                    <input
                      type="number"
                      name="actualMRP"
                      value={formData.actualMRP}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Enter actual MRP"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Offered MRP *</label>
                    <input
                      type="number"
                      name="offeredMRP"
                      value={formData.offeredMRP}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Enter offered MRP"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {discount > 0 && (
                  <div className="discount-calculator">
                    <p>Discount Percentage: <span className="discount-value">{discount}%</span></p>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Rating (1-5)</label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Enter rating (1-5)"
                      min="1"
                      max="5"
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Quantity</label>
                    <div className="quantity-input-group">
                      <input
                        type="number"
                        name="quantityValue"
                        value={formData.quantityValue}
                        onChange={handleInputChange}
                        className="form-control quantity-input"
                        placeholder="Enter quantity"
                        min="0"
                        step="0.01"
                      />
                      <select
                        name="quantityUnit"
                        value={formData.quantityUnit}
                        onChange={handleInputChange}
                        className="form-control quantity-unit-select"
                      >
                        <option value="ml">ml</option>
                        <option value="l">Litre</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="pcs">Pieces</option>
                        <option value="bottles">Bottles</option>
                        <option value="packets">Packets</option>
                        <option value="boxes">Boxes</option>
                        <option value="tubs">Tubs</option>
                        <option value="tubes">Tubes</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (isEditing ? 'Updating Combo Product...' : 'Adding Combo Product...') : (isEditing ? 'Update Combo Product' : 'Add Combo Product')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboProducts;

