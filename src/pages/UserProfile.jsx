import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../api';
import '../styles/common.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [message, setMessage] = useState('Loading profile...');

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/auth/me`, { withCredentials: true }),
      axios.get(`${API_URL}/api/favorites`, { withCredentials: true }),
    ])
      .then(([sessionResponse, favoritesResponse]) => {
        if (sessionResponse.data.role !== 'user') {
          navigate('/');
          return;
        }
        setSession(sessionResponse.data.user);
        setFavorites(favoritesResponse.data.favorites || []);
        setMessage('');
      })
      .catch(() => setMessage('Please log in as a user to view your profile.'));
  }, [navigate]);

  const removeFavorite = async (favorite) => {
    const type = favorite.food ? 'food' : 'restaurant';
    const id = favorite.food?._id || favorite.foodPartner?._id;
    await axios.delete(`${API_URL}/api/favorites/${type}/${id}`, { withCredentials: true });
    setFavorites((items) => items.filter((item) => item._id !== favorite._id));
  };

  return (
    <main className="favorites-page">
      <div className="favorites-panel">
        <Link to="/">← Home</Link>
        {session && <h1>{session.fullName}'s Profile</h1>}
        {message && <p>{message}</p>}
        <h2>Saved items</h2>
        {favorites.length === 0 && !message && <p>You have not saved anything yet.</p>}
        <div className="favorites-list">
          {favorites.map((favorite) => (
            <article className="favorite-item" key={favorite._id}>
              {favorite.foodPartner && (
                <Link to={`/food-partner/${favorite.foodPartner._id}`}>
                  Restaurant: {favorite.foodPartner.name}
                </Link>
              )}
              {favorite.food && <span>Food: {favorite.food.name}</span>}
              <button type="button" onClick={() => removeFavorite(favorite)}>Remove</button>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};

export default UserProfile;
