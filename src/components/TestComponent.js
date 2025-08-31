import React from 'react';

const TestComponent = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      border: '1px solid #ccc',
      margin: '20px'
    }}>
      <h2>Test Component</h2>
      <p>If you can see this, React is working!</p>
      <p>Environment variables check:</p>
      <ul>
        <li>Firebase API Key: {process.env.REACT_APP_FIREBASE_API_KEY ? '✅ Loaded' : '❌ Missing'}</li>
        <li>Cloudinary Cloud Name: {process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ? '✅ Loaded' : '❌ Missing'}</li>
      </ul>
    </div>
  );
};

export default TestComponent;
