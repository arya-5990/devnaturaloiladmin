import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadImage } from '../config/cloudinary';
import ImageUpload from '../components/ImageUpload';
import { toast } from 'react-toastify';

const AddBanner = () => {
  const [formData, setFormData] = useState({
    text: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedImage) {
      toast.error('Please select a banner image');
      return;
    }

    if (!formData.text) {
      toast.error('Please enter banner text');
      return;
    }

    setLoading(true);

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
        text: ''
      });
      setSelectedImage(null);

    } catch (error) {
      console.error('Error adding banner:', error);
      toast.error('Error adding banner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Add Banner</h1>
      </div>
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <ImageUpload onImageSelect={handleImageSelect} label="Banner Image" />

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
            disabled={loading}
          >
            {loading ? 'Adding Banner...' : 'Add Banner'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBanner;
