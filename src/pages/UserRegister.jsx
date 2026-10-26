import React from 'react';
import '../styles/common.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api';

const UserRegister = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, password } = e.target.elements; // Changed from username, removed confirmPassword
    // Removed confirmPassword check
    try {
      const response = await axios.post(`${API_URL}/api/auth/user/register`, {
        fullName: fullName.value, // Changed to fullName
        email: email.value,
        password: password.value,
      },{
        withCredentials: true,
      });
      if (response.status === 201) {
        alert('User registered successfully');
        navigate('/');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed. Check that the backend is running.');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}> {/* Added onSubmit handler */}
        <h2>User Register</h2>
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input type="text" id="fullName" name="fullName" placeholder="Enter your full name" />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" placeholder="Enter your email" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" placeholder="Enter your password" />
        </div>
        <button type="submit" className="auth-button">Register</button>
        <p className="switch-link">
          Already have an account? <a href="/user/login">Login</a>
        </p>
        <p className="switch-link">
          Register as a food partner? <a href="/foodpartner/register">Register here</a>
        </p>
      </form>
    </div>
  );
};

export default UserRegister;
