import React from 'react';
import '../styles/common.css';
import axios from 'axios';
import { API_URL, saveAuthToken } from '../api';
import { useNavigate } from 'react-router-dom';

const UserLogin = () => {
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = e.target.elements;
    try {
      const response = await axios.post(`${API_URL}/api/auth/user/login`, {
        email: email.value,
        password: password.value,
      },{
        withCredentials: true,
      });
      if (response.status === 200) {
        saveAuthToken(response.data.token);
        navigate('/user/profile');
      }
    } catch (error) {
      alert(error.response.data.message || 'Login failed');
    }
  };
  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>User Login</h2>
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
          Don't have an account? <a href="/user/register">Register</a>
        </p>
      </form>
    </div>
  );
};

export default UserLogin;
