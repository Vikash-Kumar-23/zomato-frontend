import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/common.css';
import { API_URL } from '../../api';

const CreateFood = () => {
  const [video, setVideo] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('main course');
  const [portionSize, setPortionSize] = useState('');
  const [isVeg, setIsVeg] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !video) {
      alert('Please provide a food name and a video file');
      return;
    }
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('video', video);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('portionSize', portionSize);
      formData.append('isVeg', String(isVeg));
      formData.append('isBestseller', String(isBestseller));

      const res = await axios.post(`${API_URL}/api/food`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      alert('Food item created successfully');
      setVideo(null);
      setName('');
      setDescription('');
      setPrice('');
      setPortionSize('');
      setIsVeg(false);
      setIsBestseller(false);
    } catch (error) {
      console.error('Error creating food item:', error);
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        alert('Unauthorized: only food partners can create food. Please log in.');
      } else if (status === 400) {
        alert(error?.response?.data?.message || 'Bad request');
      } else if (status === 413) {
        alert('File too large. Max size is 100MB');
      } else {
        alert('Failed to create food item.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create Food Item</h2>
        <div className="form-group">
          <label htmlFor="video">Video File</label>
          <input
            type="file"
            id="video"
            name="video"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files[0])}
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price (₹)</label>
          <input type="number" id="price" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Enter price" />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="starters">Starters</option>
            <option value="main course">Main Course</option>
            <option value="desserts">Desserts</option>
            <option value="beverages">Beverages</option>
            <option value="fast food">Fast Food</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="portionSize">Portion Size</label>
          <input type="text" id="portionSize" value={portionSize} onChange={(e) => setPortionSize(e.target.value)} placeholder="e.g. serves 1" />
        </div>
        <div className="checkbox-row">
          <label><input type="checkbox" checked={isVeg} onChange={(e) => setIsVeg(e.target.checked)} /> Vegetarian</label>
          <label><input type="checkbox" checked={isBestseller} onChange={(e) => setIsBestseller(e.target.checked)} /> Bestseller</label>
        </div>
        <div className="form-group">
          <label htmlFor="name">Food Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter food item name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter food description"
            rows="3"
          ></textarea>
        </div>
        <button type="submit" className="auth-button" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Add Food Item'}
        </button>
      </form>
    </div>
  );
};

export default CreateFood;
