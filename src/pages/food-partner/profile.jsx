import React, { useEffect, useState } from 'react'
import './profile.css'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../api';
import { FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa'

const Profile = () => {
  const { id } = useParams();
  const partnerId = id || (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : undefined);
  const navigate = useNavigate();
  const [foodPartner, setFoodPartner] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('meals');
  const [reviews, setReviews] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [offers, setOffers] = useState([]);
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const [restaurantStats, setRestaurantStats] = useState({
    averageRating: null,
    reviewCount: 0,
    isOpen: null,
  });

  useEffect(() => {
    console.log('Profile ID from useParams:', id);
    console.log('Resolved partnerId:', partnerId);

    if (!partnerId) {
      setError('Invalid profile URL: missing partner id');
      return;
    }

    const fetchFoodPartnerData = async () => {
      try {
        const foodPartnerResponse = await axios.get(`${API_URL}/api/food-partner/${partnerId}`);
        // Backend may return either the document itself or { foodPartner }
        const fp = foodPartnerResponse.data?.foodPartner ?? foodPartnerResponse.data;
        setFoodPartner(fp);
        setRestaurantStats({
          averageRating: foodPartnerResponse.data?.averageRating ?? null,
          reviewCount: foodPartnerResponse.data?.reviewCount ?? 0,
          isOpen: foodPartnerResponse.data?.isOpen ?? null,
        });
        // Prefer food items and reviews if included in profile response
        if (foodPartnerResponse.data?.foodItems) {
          setFoodItems(foodPartnerResponse.data.foodItems);
        } else {
          const foodItemsResponse = await axios.get(`${API_URL}/api/food-partner/${partnerId}/fooditems`);
          setFoodItems(foodItemsResponse.data.foodItems || []);
        }
        if (foodPartnerResponse.data?.reviews) {
          setReviews(foodPartnerResponse.data.reviews);
        } else {
          const reviewsResponse = await axios.get(`${API_URL}/api/food-partner/${partnerId}/reviews`);
          setReviews(reviewsResponse.data.reviews || []);
        }
        const offersResponse = await axios.get(`${API_URL}/api/offers/partner/${partnerId}`);
        setOffers(offersResponse.data.offers || []);
        setError('');
      } catch (error) {
        console.error('Error fetching food partner data:', error?.message || error);
        setError(error?.message || 'Failed to load profile');
      }
    };

    fetchFoodPartnerData();
  }, [id, partnerId]);

  const saveFavorite = async (type, itemId) => {
    try {
      await axios.post(`${API_URL}/api/favorites/${type}/${itemId}`, {}, { withCredentials: true });
      setFavoriteMessage('Saved to your favorites');
    } catch (err) {
      setFavoriteMessage(err?.response?.data?.message || 'Log in as a user to save favorites');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('Please add a comment');
      return;
    }
    if (newRating < 1 || newRating > 5) {
      setError('Rating must be between 1 and 5');
      return;
    }
    try {
      setSubmitting(true);
      await axios.post(
        `${API_URL}/api/food-partner/${partnerId}/reviews`,
        { rating: newRating, comment: newComment },
        { withCredentials: true }
      );
      // Refresh reviews to include the new one with populated user name
      const reviewsResponse = await axios.get(`${API_URL}/api/food-partner/${partnerId}/reviews`);
      setReviews(reviewsResponse.data.reviews || []);
      setNewComment('');
      setNewRating(5);
      setShowReviewForm(false);
      setError('');
    } catch (err) {
      console.error('Error submitting review:', err?.response?.data || err?.message || err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit review';
      setError(msg);
      if (err?.response?.status === 401) {
        setUnauthorized(true);
      } else {
        setUnauthorized(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !foodPartner) {
    return <div style={{ padding: 16 }}>Error: {error}</div>;
  }

  if (!foodPartner) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar"></div>
        <div className="profile-info">
          <h2 className="business-name">{foodPartner.name}</h2>
          <p className="address">
            <FaMapMarkerAlt />
            <span>{foodPartner.address}</span>
          </p>
          <p className="contact-name">
            <FaUser />
            <span className="contact-label">Contact:</span>
            <span className="contact-value">{foodPartner.contactName}</span>
          </p>
          <p className="phone">
            <FaPhone />
            <span className="phone-label">Phone:</span>
            <span className="phone-value">{foodPartner.phone}</span>
          </p>
          <p className="email">
            <FaEnvelope />
            <span className="email-label">Email:</span>
            <span className="email-value">{foodPartner.email}</span>
          </p>
          <button className="favorite-button" type="button" onClick={() => saveFavorite('restaurant', foodPartner._id)}>
            ♡ Save restaurant
          </button>
        </div>
      </div>

      <section className="restaurant-summary">
        <Link className="manage-menu-link" to="/create-food">+ Add food item</Link>
        <div className={`open-status ${restaurantStats.isOpen === true ? 'open' : ''}`}>
          {restaurantStats.isOpen === null ? 'Hours not configured' : restaurantStats.isOpen ? 'Open now' : 'Closed now'}
        </div>
        <div className="summary-stat">
          <strong>{restaurantStats.averageRating ?? '—'}</strong>
          <span>★ rating ({restaurantStats.reviewCount} reviews)</span>
        </div>
        <div className="restaurant-details">
          {foodPartner.cuisines?.length > 0 && <span>🍽 {foodPartner.cuisines.join(', ')}</span>}
          {foodPartner.openingTime && foodPartner.closingTime && (
            <span>🕒 {foodPartner.openingTime} – {foodPartner.closingTime}</span>
          )}
          {foodPartner.estimatedPrepTime != null && <span>⏱ {foodPartner.estimatedPrepTime} min prep</span>}
          {foodPartner.costForTwo != null && <span>₹{foodPartner.costForTwo} for two</span>}
          <span>{foodPartner.deliveryAvailable ? 'Delivery available' : 'Delivery unavailable'}</span>
          <span>{foodPartner.pickupAvailable ? 'Pickup available' : 'Pickup unavailable'}</span>
        </div>
        {foodPartner.description && <p className="restaurant-description">{foodPartner.description}</p>}
      </section>

      <div className="profile-tabs">
        <button
          className={activeTab === "meals" ? "active" : ""}
          onClick={() => setActiveTab("meals")}
        >
          Total Meals
        </button>
        <button
          className={activeTab === "service" ? "active" : ""}
          onClick={() => setActiveTab("service")}
        >
          Customer Service
        </button>
      </div>

      {favoriteMessage && <div className="profile-notice">{favoriteMessage}</div>}

      {offers.length > 0 && (
        <section className="offers-section">
          <h3>Active offers</h3>
          <div className="offers-list">
            {offers.map((offer) => (
              <article className="offer-card" key={offer._id}>
                <strong>{offer.title}</strong>
                <span>{offer.discountType === 'percentage' ? `${offer.discountValue}% off` : `₹${offer.discountValue} off`}</span>
                {offer.description && <p>{offer.description}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'meals' && (
        <div className="video-grid">
          {foodItems.map((item) => (
            <div className="menu-card" key={item._id}>
              <div className="video-placeholder">
                <video src={item.video} controls />
              </div>
              <div className="menu-card-content">
                <div className="menu-card-heading">
                  <h3>{item.name}</h3>
                  {item.price != null && <strong>₹{Number(item.price).toFixed(2)}</strong>}
                </div>
                {item.description && <p>{item.description}</p>}
                <div className="menu-tags">
                  {item.category && <span>{item.category}</span>}
                  {item.portionSize && <span>{item.portionSize}</span>}
                  <span className={item.isVeg ? 'veg-tag' : 'nonveg-tag'}>
                    {item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
                  </span>
                  {item.isBestseller && <span className="bestseller-tag">Bestseller</span>}
                  {item.isAvailable === false && <span className="unavailable-tag">Unavailable</span>}
                </div>
                <button className="save-food-button" type="button" onClick={() => saveFavorite('food', item._id)}>
                  ♡ Save item
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'service' && (
        <div className="comments-section">
          <button className="write-review-btn" onClick={() => setShowReviewForm((v) => !v)}>
            {showReviewForm ? 'Cancel' : 'Write a Review'}
          </button>
          {showReviewForm && (
            <form className="review-form" onSubmit={submitReview} style={{ marginTop: 12 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>
                Rating:
                <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))} style={{ marginLeft: 8 }}>
                  {[1,2,3,4,5].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>
              <textarea
                placeholder="Share your experience..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                style={{ width: '100%', marginBottom: 8 }}
              />
              <button type="submit" className="submit-review-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              {error && (
                <div style={{ color: 'salmon', marginTop: 8 }}>{error}</div>
              )}
              {unauthorized && (
                <button
                  type="button"
                  className="login-btn"
                  onClick={() => navigate('/user/login')}
                  style={{ marginTop: 8, background: '#2563eb', color: '#fff', padding: '8px 12px', borderRadius: 6 }}
                >
                  Login to write a review
                </button>
              )}
            </form>
          )}
          <div className="customer-reviews">
            <h3>Customer Reviews</h3>
            {reviews.slice(0, showAll ? reviews.length : 3).map((review) => (
              <div className="review-card" key={review._id}>
                <div className="reviewer-name">{review?.user?.fullName || 'Anonymous'}</div>
                <div className="review-text">{review.comment}</div>
                <div className="review-rating">{'★'.repeat(review.rating)}</div>
              </div>
            ))}
            {reviews.length > 3 && !showAll && (
              <button className="see-more-btn" onClick={() => setShowAll(true)}>See More ({reviews.length - 3} more)</button>
            )}
          </div>
          <div className="customer-service-footer">
            <h4>Contact Customer Support</h4>
            <p>
              <FaEnvelope /> Email: {foodPartner.customerServiceEmail}
            </p>
            <p>
              <FaPhone /> Phone: {foodPartner.customerServicePhone}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
