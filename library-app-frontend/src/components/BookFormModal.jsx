import React, { useState, useEffect } from 'react';
import './BookFormModal.css';

function BookFormModal({ isOpen, onClose, onSubmit, initialData = {} }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    copies: 1,
    cover: ''
  });

  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (isOpen && initialData && Object.keys(initialData).length > 0) {
      setFormData({
        title: initialData.title || '',
        author: initialData.author || '',
        copies: initialData.copies || 1,
        cover: initialData.cover || ''
      });
      setPreview(initialData.cover || '');
    } else if (isOpen) {
      setFormData({ title: '', author: '', copies: 1, cover: '' });
      setPreview('');
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'copies' ? Number(value) : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Only JPEG, PNG, or WebP images are allowed.');
        return;
      }
      if (file.size > 1024 * 1024) {
        alert('Image size must be less than 1MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, cover: reader.result }));
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onSubmit === 'function') {
      onSubmit(formData);
    } else {
      console.error('onSubmit is not a function');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{initialData && initialData._id ? 'Edit Book' : 'Add Book'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <input
            name="author"
            placeholder="Author"
            value={formData.author}
            onChange={handleChange}
            required
          />
          <input
            name="copies"
            type="number"
            min="1"
            placeholder="Copies"
            value={formData.copies}
            onChange={handleChange}
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {preview && (
            <img
              src={preview}
              alt="Book Cover Preview"
              style={{
                width: '120px',
                height: '160px',
                objectFit: 'cover',
                marginTop: '10px'
              }}
            />
          )}
          <div className="modal-buttons">
            <button
              type="submit"
              disabled={
                !formData.title ||
                !formData.author ||
                formData.copies < 1
              }
            >
              Save
            </button>
            <button type="button" className="cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookFormModal;
