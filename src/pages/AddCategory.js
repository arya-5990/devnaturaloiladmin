import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadImage } from '../config/cloudinary';
import ImageUpload from '../components/ImageUpload';
import { toast } from 'react-toastify';

const AddCategory = () => {
  const [formData, setFormData] = useState({
    name: ''
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
      toast.error('Please select a category image');
      return;
    }

    if (!formData.name) {
      toast.error('Please enter category name');
      return;
    }

    setLoading(true);

    try {
      // Upload image to Cloudinary
      const imageUrl = await uploadImage(selectedImage);
      
      // Prepare category data
      const categoryData = {
        ...formData,
        imageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to Firestore
      await addDoc(collection(db, 'categories'), categoryData);

      toast.success('Category added successfully!');
      
      // Reset form
      setFormData({
        name: ''
      });
      setSelectedImage(null);

    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Error adding category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Add Category</h1>
      </div>
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter category name"
              required
            />
          </div>

          <ImageUpload onImageSelect={handleImageSelect} label="Category Image" />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Adding Category...' : 'Add Category'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;
