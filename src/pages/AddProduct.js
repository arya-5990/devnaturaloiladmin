import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadImage } from '../config/cloudinary';
import ImageUpload from '../components/ImageUpload';
import { toast } from 'react-toastify';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    actualMRP: '',
    offeredMRP: '',
    rating: '',
    totalQuantity: '',
    imageUrl: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);

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
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('productId', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return 1;
      }
      
      const lastProduct = querySnapshot.docs[0].data();
      return lastProduct.productId + 1;
    } catch (error) {
      console.error('Error getting next product ID:', error);
      return 1;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedImage) {
      toast.error('Please select an image');
      return;
    }

    if (!formData.title || !formData.description || !formData.actualMRP || !formData.offeredMRP) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Upload image to Cloudinary
      const imageUrl = await uploadImage(selectedImage);
      
      // Get next product ID
      const productId = await getNextProductId();

      // Prepare product data
      const productData = {
        ...formData,
        imageUrl,
        productId,
        actualMRP: parseFloat(formData.actualMRP),
        offeredMRP: parseFloat(formData.offeredMRP),
        rating: parseFloat(formData.rating),
        totalQuantity: parseInt(formData.totalQuantity),
        discount: parseFloat(discount),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to Firestore
      await addDoc(collection(db, 'products'), productData);

             toast.success('Product added successfully!');
       
       // Scroll to top of form
       window.scrollTo({ top: 0, behavior: 'smooth' });
       
       // Reset form
       setFormData({
         title: '',
         description: '',
         actualMRP: '',
         offeredMRP: '',
         rating: '',
         totalQuantity: '',
         imageUrl: ''
       });
       setSelectedImage(null);
       setDiscount(0);
       setResetTrigger(prev => prev + 1); // Trigger image upload reset

    } catch (error) {
      console.error('Error adding product:', error);
      if (error.code === 'permission-denied') {
        toast.error('Permission denied. Please check Firestore security rules.');
      } else if (error.code === 'unavailable') {
        toast.error('Firebase service unavailable. Please check your connection.');
      } else {
        toast.error(`Error adding product: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Add Product</h1>
      </div>
      
      <div className="form-container">
                 <form onSubmit={handleSubmit}>
           <ImageUpload 
             onImageSelect={handleImageSelect} 
             label="Product Image" 
             resetTrigger={resetTrigger}
           />
          
          <div className="form-group">
            <label>Product Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter product title"
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
              placeholder="Enter product description"
              required
            />
          </div>

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

          {discount > 0 && (
            <div className="discount-calculator">
              <p>Discount Percentage: <span className="discount-value">{discount}%</span></p>
            </div>
          )}

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
            <label>Total Available Quantity</label>
            <input
              type="number"
              name="totalQuantity"
              value={formData.totalQuantity}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter available quantity"
              min="0"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
