import React, { useState, useEffect } from 'react';
import { FaStar, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastId, setLastId] = useState(0);
  const [formData, setFormData] = useState({
    reviewerName: '',
    comment: '',
    rating: 5
  });

  // Load testimonials from Firebase on component mount
  useEffect(() => {
    loadTestimonials();
  }, []);

  // Initialize lastId if no testimonials exist
  useEffect(() => {
    if (testimonials.length === 0 && !isLoading) {
      setLastId(0);
    }
  }, [testimonials, isLoading]);

  // Function to load testimonials from Firebase
  const loadTestimonials = async () => {
    try {
      setIsLoading(true);
      const testimonialsRef = collection(db, 'testimonials');
      const q = query(testimonialsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const testimonialsData = querySnapshot.docs.map(doc => ({
        id: doc.data().id || 0, // Use the stored auto-incrementing ID
        firebaseId: doc.id, // Store Firebase document ID for updates/deletes
        ...doc.data()
      }));
      
      // Calculate the highest ID for auto-increment
      const maxId = testimonialsData.reduce((max, testimonial) => {
        const testimonialId = parseInt(testimonial.id) || 0;
        return testimonialId > max ? testimonialId : max;
      }, 0);
      
      setLastId(maxId);
      setTestimonials(testimonialsData);
      
      // If there are testimonials without IDs, update them with sequential IDs
      if (testimonialsData.length > 0) {
        await updateTestimonialsWithoutIds(testimonialsData, maxId);
      }
    } catch (error) {
      console.error('Error loading testimonials:', error);
      toast.error('Failed to load testimonials. Please check your Firebase connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update testimonials without IDs (for backward compatibility)
  const updateTestimonialsWithoutIds = async (testimonialsData, currentMaxId) => {
    try {
      let nextId = currentMaxId + 1;
      const testimonialsToUpdate = testimonialsData.filter(t => !t.id || t.id === 0);
      
      for (const testimonial of testimonialsToUpdate) {
        if (testimonial.firebaseId) {
          const testimonialRef = doc(db, 'testimonials', testimonial.firebaseId);
          await updateDoc(testimonialRef, {
            id: nextId
          });
          nextId++;
        }
      }
      
      // If we updated any testimonials, reload to get the new IDs
      if (testimonialsToUpdate.length > 0) {
        await loadTestimonials();
      }
    } catch (error) {
      console.error('Error updating testimonials without IDs:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reviewerName.trim() || !formData.comment.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingTestimonial) {
        // Update existing testimonial in Firebase
        const testimonialRef = doc(db, 'testimonials', editingTestimonial.firebaseId);
        await updateDoc(testimonialRef, {
          id: editingTestimonial.id, // Keep the same ID
          reviewerName: formData.reviewerName,
          comment: formData.comment,
          rating: formData.rating,
          updatedAt: serverTimestamp()
        });
        
        toast.success('Testimonial updated successfully!');
      } else {
        // Add new testimonial to Firebase with auto-incrementing ID
        const newId = lastId + 1;
        const testimonialsRef = collection(db, 'testimonials');
        const newTestimonial = {
          id: newId, // Store the auto-incrementing ID
          reviewerName: formData.reviewerName,
          comment: formData.comment,
          rating: formData.rating,
          createdAt: serverTimestamp()
        };
        
        const docRef = await addDoc(testimonialsRef, newTestimonial);
        
        // Update the lastId state
        setLastId(newId);
        
        toast.success('Testimonial added successfully!');
      }

      // Reload testimonials from Firebase
      await loadTestimonials();
      
      // Reset form and close modal
      setFormData({ reviewerName: '', comment: '', rating: 5 });
      setEditingTestimonial(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Failed to save testimonial. Please try again.');
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      reviewerName: testimonial.reviewerName,
      comment: testimonial.comment,
      rating: testimonial.rating
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (testimonial) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        const testimonialRef = doc(db, 'testimonials', testimonial.firebaseId);
        await deleteDoc(testimonialRef);
        
        toast.success('Testimonial deleted successfully!');
        
        // Reload testimonials from Firebase
        await loadTestimonials();
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        toast.error('Failed to delete testimonial. Please try again.');
      }
    }
  };

  const openModal = () => {
    setEditingTestimonial(null);
    setFormData({ reviewerName: '', comment: '', rating: 5 });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTestimonial(null);
    setFormData({ reviewerName: '', comment: '', rating: 5 });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'filled-star' : 'empty-star'}
      />
    ));
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div className="flex justify-between items-center">
          <h1>Testimonials</h1>
          <div className="flex gap-2">
            <button
              onClick={loadTestimonials}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Refresh
            </button>
            <button
              onClick={openModal}
              className="btn btn-primary"
            >
              <FaPlus />
              Add Testimonial
            </button>
          </div>
        </div>
      </div>

      {/* Testimonials Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Reviewer Name</th>
                <th>Comment</th>
                <th>Rating</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="loading">
                    Loading testimonials...
                  </td>
                </tr>
              ) : testimonials.length === 0 ? (
                <tr>
                  <td colSpan="6" className="loading">
                    No testimonials found. Add your first testimonial!
                  </td>
                </tr>
              ) : (
                testimonials.map((testimonial) => (
                  <tr key={testimonial.id}>
                    <td className="font-mono">{testimonial.id}</td>
                    <td className="font-medium">{testimonial.reviewerName}</td>
                    <td>
                      <div className="truncate" title={testimonial.comment}>
                        {testimonial.comment}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {renderStars(testimonial.rating)}
                        <span className="text-gray-600">({testimonial.rating}/5)</span>
                      </div>
                    </td>
                                         <td>{testimonial.createdAt?.toDate ? testimonial.createdAt.toDate().toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(testimonial)}
                          className="btn-icon btn-edit"
                        >
                          <FaEdit />
                        </button>
                                                 <button
                           onClick={() => handleDelete(testimonial)}
                           className="btn-icon btn-delete"
                         >
                           <FaTrash />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</h2>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Reviewer Name *</label>
                  <input
                    type="text"
                    value={formData.reviewerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, reviewerName: e.target.value }))}
                    className="form-control"
                    placeholder="Enter reviewer name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Comment *</label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                    className="form-control"
                    rows="4"
                    placeholder="Enter your review comment"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                        className="star-button"
                      >
                        <FaStar
                          className={star <= formData.rating ? 'filled-star' : 'empty-star'}
                        />
                      </button>
                    ))}
                    <span className="rating-text">({formData.rating}/5)</span>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingTestimonial ? 'Update' : 'Add'}
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

export default Testimonials;
