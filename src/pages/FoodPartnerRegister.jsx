import React from 'react';
import '../styles/common.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api';

const FoodPartnerRegister = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      name, contactName, phone, address, email, password, confirmPassword,
      description, cuisines, openingTime, closingTime, estimatedPrepTime,
      costForTwo, deliveryAvailable, pickupAvailable,
    } = e.target.elements;
    try {
      const response = await axios.post(`${API_URL}/api/auth/foodpartner/register`, {
        name: name.value,
        contactName: contactName.value,
        phone: phone.value,
        address: address.value,
        email: email.value,
        password: password.value,
        confirmPassword: confirmPassword.value,
        description: description.value,
        cuisines: cuisines.value,
        openingTime: openingTime.value,
        closingTime: closingTime.value,
        estimatedPrepTime: estimatedPrepTime.value,
        costForTwo: costForTwo.value,
        deliveryAvailable: deliveryAvailable.checked,
        pickupAvailable: pickupAvailable.checked,
      },{
        withCredentials: true,
      });
      if (response.status === 201) {
        alert('Food partner registered successfully');
        navigate(`/food-partner/${response.data.foodPartner._id}`);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed. Check that the backend is running.');
    }
  };
  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Food Partner Register</h2>
        <div className="form-group">
          <label htmlFor="name">Restaurant Name</label>
          <input type="text" id="name" name="name" placeholder="Enter restaurant name" />
        </div>
        <div className="form-group">
          <label htmlFor="contactName">Contact Person Name</label>
          <input type="text" id="contactName" name="contactName" placeholder="Enter contact person name" />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input type="tel" id="phone" name="phone" placeholder="Enter phone number" />
        </div>
        <div className="form-group">
          <label htmlFor="address">Restaurant Address</label>
          <textarea id="address" name="address" placeholder="Enter restaurant address" rows="3"></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="description">Restaurant Description</label>
          <textarea id="description" name="description" placeholder="Describe your restaurant" rows="3"></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="cuisines">Cuisine Types</label>
          <input type="text" id="cuisines" name="cuisines" placeholder="e.g. Indian, Chinese" />
        </div>
        <div className="form-group">
          <label>Opening Hours</label>
          <div className="inline-fields">
            <input type="time" name="openingTime" defaultValue="09:00" />
            <input type="time" name="closingTime" defaultValue="22:00" />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="estimatedPrepTime">Estimated Preparation Time (minutes)</label>
          <input type="number" id="estimatedPrepTime" name="estimatedPrepTime" min="0" placeholder="e.g. 30" />
        </div>
        <div className="form-group">
          <label htmlFor="costForTwo">Approximate Cost for Two (₹)</label>
          <input type="number" id="costForTwo" name="costForTwo" min="0" placeholder="e.g. 600" />
        </div>
        <div className="checkbox-row">
          <label><input type="checkbox" name="deliveryAvailable" defaultChecked /> Delivery available</label>
          <label><input type="checkbox" name="pickupAvailable" defaultChecked /> Pickup available</label>
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" placeholder="Enter your email" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" placeholder="Enter your password" />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password" />
        </div>
        <button type="submit" className="auth-button">Register</button>
        <p className="switch-link">
          Already have an account? <a href="/foodpartner/login">Login</a>
        </p>
        <p className="switch-link">
          Register as a normal user? <a href="/user/register">Register here</a>
        </p>
      </form>
    </div>
  );
};

export default FoodPartnerRegister;
