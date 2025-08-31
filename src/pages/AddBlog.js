import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadImage } from '../config/cloudinary';
import ImageUpload from '../components/ImageUpload';
import { toast } from 'react-toastify';

const AddBlog = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
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
      toast.error('Please select a thumbnail image');
      return;
    }

    if (!formData.title || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Upload image to Cloudinary
      const imageUrl = await uploadImage(selectedImage);
      
      // Prepare blog data
      const blogData = {
        ...formData,
        thumbnailUrl: imageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to Firestore
      await addDoc(collection(db, 'blogs'), blogData);

      toast.success('Blog added successfully!');
      
      // Reset form
      setFormData({
        title: '',
        content: ''
      });
      setSelectedImage(null);

    } catch (error) {
      console.error('Error adding blog:', error);
      toast.error('Error adding blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Add Blog</h1>
      </div>
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Blog Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter blog title"
              required
            />
          </div>

          <ImageUpload onImageSelect={handleImageSelect} label="Thumbnail Image" />

          <div className="form-group">
            <label>Blog Content *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter blog content"
              rows="10"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Adding Blog...' : 'Add Blog'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBlog;
