import React, { useState, useRef, useEffect } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';

const ImageUpload = ({ onImageSelect, label = 'Upload Image', resetTrigger }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        onImageSelect(file);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select an image file');
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  // Reset preview when resetTrigger changes
  useEffect(() => {
    if (resetTrigger) {
      setPreview(null);
      setDragActive(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }, [resetTrigger]);

  return (
    <div className="form-group">
      <label>{label}</label>
      <div
        className={`upload-area ${dragActive ? 'dragover' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <FaCloudUploadAlt size={40} color="#3498db" />
        <p>Drag and drop an image here, or click to select</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </div>
      {preview && (
        <img src={preview} alt="Preview" className="image-preview" />
      )}
    </div>
  );
};

export default ImageUpload;
