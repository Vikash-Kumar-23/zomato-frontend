import React from 'react';
import '../styles/common.css';
import axios from 'axios';
import { API_URL } from '../api';
import { useNavigate } from 'react-router-dom';

const FoodPartnerLogin = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await axios.post(`${API_URL}/api/auth/foodpartner/login`, { email, password }, { withCredentials: true });
       if (res.status === 200) {
        navigate(`/food-partner/${res.data.foodPartner._id}`);
      } else {
        alert('Login failed');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Food Partner Login</h2>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" placeholder="Enter your email" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" placeholder="Enter your password" />
        </div>
        <button type="submit" className="auth-button">Login</button>
        <p className="switch-link">
          Don't have an account? <a href="/foodpartner/register">Register</a>
        </p>
      </form>
    </div>
  );
};

export default FoodPartnerLogin;
