import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../api';
import '../styles/common.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [message, setMessage] = useState('Loading favorites...');

  useEffect(() => {
    axios.get(`${API_URL}/api/favorites`, { withCredentials: true })
      .then((response) => {
        setFavorites(response.data.favorites || []);
        setMessage('');
      })
      .catch((error) => {
        setMessage(error?.response?.data?.message || 'Please log in as a user to view favorites.');
      });
  }, []);

  return (
    <main className="favorites-page">
      <div className="favorites-panel">
        <Link to="/">← Back to home</Link>
        <h1>Saved favorites</h1>
        {message && <p>{message}</p>}
        <div className="favorites-list">
          {favorites.map((favorite) => (
            <article className="favorite-item" key={favorite._id}>
              {favorite.foodPartner && (
                <Link to={`/food-partner/${favorite.foodPartner._id}`}>
                  Restaurant: {favorite.foodPartner.name}
                </Link>
              )}
              {favorite.food && <span>Food: {favorite.food.name}</span>}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Favorites;
