import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadImage } from '../config/cloudinary';
import ImageUpload from '../components/ImageUpload';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const AddBanner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    bannerId: '',
    text: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch banners on component mount
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const bannersRef = collection(db, 'banners');
      const q = query(bannersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const bannersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBanners(bannersData);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Error fetching banners');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (file) => {
    setSelectedImage(file);
  };

  const handleDelete = async (bannerId) => {
    if (window.confirm('Are you sure you want to delete this banner? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'banners', bannerId));
        toast.success('Banner deleted successfully!');
        await fetchBanners(); // Refresh the list
      } catch (error) {
        console.error('Error deleting banner:', error);
        toast.error('Error deleting banner');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedImage) {
      toast.error('Please select a banner image');
      return;
    }

    if (!formData.bannerId) {
      toast.error('Please enter a banner ID');
      return;
    }

    if (!formData.text) {
      toast.error('Please enter banner text');
      return;
    }

    setSubmitting(true);

    try {
      // Upload image to Cloudinary
      const imageUrl = await uploadImage(selectedImage);
      
      // Prepare banner data
      const bannerData = {
        ...formData,
        imageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to Firestore
      await addDoc(collection(db, 'banners'), bannerData);

      toast.success('Banner added successfully!');
      
      // Reset form
      setFormData({
        bannerId: '',
        text: ''
      });
      setSelectedImage(null);
      
      // Refresh banners list
      await fetchBanners();

    } catch (error) {
      console.error('Error adding banner:', error);
      toast.error('Error adding banner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Banners ({banners.length})</h1>
        <button 
          className="btn btn-primary"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaPlus /> Add Banner
        </button>
      </div>
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <ImageUpload onImageSelect={handleImageSelect} label="Banner Image" />

          <div className="form-group">
            <label>Banner ID *</label>
            <input
              type="text"
              name="bannerId"
              value={formData.bannerId}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter banner ID"
              required
            />
          </div>

          <div className="form-group">
            <label>Banner Text *</label>
            <textarea
              name="text"
              value={formData.text}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter banner text"
              rows="3"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Adding Banner...' : 'Add Banner'}
          </button>
        </form>
      </div>

      {/* Existing Banners Display */}
      {loading ? (
        <div className="loading">Loading banners...</div>
      ) : (
        <div className="banners-section">
          <div className="section-header">
            <h2>Existing Banners</h2>
          </div>
          {banners.length === 0 ? (
            <div className="no-banners">
              <p>No banners found. Add your first banner!</p>
            </div>
          ) : (
            <div className="banners-grid">
              {banners.map((banner) => (
                <div key={banner.id} className="banner-card">
                  <div className="banner-image">
                    <img src={banner.imageUrl} alt={banner.text} />
                  </div>
                  <div className="banner-info">
                    <div className="banner-header">
                      <h3>Banner ID: {banner.bannerId}</h3>
                      <div className="banner-actions">
                        <button 
                          className="btn-icon btn-delete" 
                          onClick={() => handleDelete(banner.id)}
                          title="Delete Banner"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <p className="banner-text">{banner.text}</p>
                    <div className="banner-meta">
                      <span className="banner-date">
                        Created: {banner.createdAt?.toDate ? banner.createdAt.toDate().toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddBanner;
