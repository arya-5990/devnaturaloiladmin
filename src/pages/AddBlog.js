import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadImage } from '../config/cloudinary';
import ImageUpload from '../components/ImageUpload';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const AddBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
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

  // Fetch blogs on component mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const blogsRef = collection(db, 'blogs');
      const q = query(blogsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const blogsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBlogs(blogsData);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Error fetching blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (file) => {
    setSelectedImage(file);
  };

  const handleDelete = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'blogs', blogId));
        toast.success('Blog deleted successfully!');
        await fetchBlogs(); // Refresh the list
      } catch (error) {
        console.error('Error deleting blog:', error);
        toast.error('Error deleting blog');
      }
    }
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

    setSubmitting(true);

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
      
      // Refresh blogs list
      await fetchBlogs();

    } catch (error) {
      console.error('Error adding blog:', error);
      toast.error('Error adding blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Blogs ({blogs.length})</h1>
        <button 
          className="btn btn-primary"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaPlus /> Add Blog
        </button>
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
            disabled={submitting}
          >
            {submitting ? 'Adding Blog...' : 'Add Blog'}
          </button>
        </form>
      </div>

      {/* Existing Blogs Display */}
      {loading ? (
        <div className="loading">Loading blogs...</div>
      ) : (
        <div className="blogs-section">
          <div className="section-header">
            <h2>Existing Blogs</h2>
          </div>
          {blogs.length === 0 ? (
            <div className="no-blogs">
              <p>No blogs found. Add your first blog!</p>
            </div>
          ) : (
            <div className="blogs-grid">
              {blogs.map((blog) => (
                <div key={blog.id} className="blog-card">
                  <div className="blog-image">
                    <img src={blog.thumbnailUrl} alt={blog.title} />
                  </div>
                  <div className="blog-info">
                    <div className="blog-header">
                      <h3>{blog.title}</h3>
                      <div className="blog-actions">
                        <button 
                          className="btn-icon btn-delete" 
                          onClick={() => handleDelete(blog.id)}
                          title="Delete Blog"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <p className="blog-content">{blog.content}</p>
                    <div className="blog-meta">
                      <span className="blog-date">
                        Created: {blog.createdAt?.toDate ? blog.createdAt.toDate().toLocaleDateString() : 'N/A'}
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

export default AddBlog;
