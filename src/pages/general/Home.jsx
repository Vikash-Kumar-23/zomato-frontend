import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './home.css';
import { useNavigate,Link } from 'react-router-dom';
import { API_URL, clearAuthToken } from '../../api';

const Home = () => {
  const navigate = useNavigate();
  const videosRef = useRef([]);
  const reelSectionsRef = useRef([]);
  const reelsContainerRef = useRef(null);
  const filterPanelRef = useRef(null);

  const [videos, setVideos] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [filters, setFilters] = useState({ q: '', category: '', isVeg: '', minPrice: '', maxPrice: '' });
  const [draftFilters, setDraftFilters] = useState(filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [savedFoodIds, setSavedFoodIds] = useState(() => new Set());

  useEffect(() => {
    axios.get(`${API_URL}/api/auth/me`, { withCredentials: true })
      .then((response) => setSession(response.data))
      .catch(() => setSession(null));
  }, []);

  useEffect(() => {
    if (!filtersOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setFiltersOpen(false);
    };
    const closeOnOutsideClick = (event) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target)) {
        setFiltersOpen(false);
      }
    };

    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('mousedown', closeOnOutsideClick);
    };
  }, [filtersOpen]);

  const scrollToReel = (direction) => {
    const sections = reelSectionsRef.current.filter(Boolean);
    const container = reelsContainerRef.current;

    if (!sections.length) return;

    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerStyles = window.getComputedStyle(container);
    const contentStart = parseFloat(containerStyles.paddingTop) || 0;
    const currentIndex = sections.reduce((closestIndex, section, index) => {
      const closestDistance = Math.abs(
        sections[closestIndex].getBoundingClientRect().top -
          containerRect.top -
          contentStart,
      );
      const distance = Math.abs(
        section.getBoundingClientRect().top - containerRect.top - contentStart,
      );
      return distance < closestDistance ? index : closestIndex;
    }, 0);

    const target = sections[currentIndex + direction];
    if (target) {
      const targetRect = target.getBoundingClientRect();
      const targetScrollTop = container.scrollTop +
        targetRect.top - containerRect.top - contentStart;

      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth',
      });
      return;
    }

    container.scrollTo({
      top: direction < 0 ? 0 : container.scrollHeight - container.clientHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.8) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: [0.5, 0.8] }
    );

    videosRef.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      videosRef.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
      observer.disconnect();
    };
  }, [videos]);

  useEffect(() => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== ''),
    );
    axios.get(`${API_URL}/api/food`, { params, withCredentials: true })
      .then((response) => {
        setVideos(response.data.foodItems);
      })
      .catch((error) => {
        console.error('Error fetching food items:', error);
        setLoadError('The food menu could not be loaded. Please check that the backend is running.');
      });
  }, [filters]);

  const updateFilter = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value }));
  };

  const openFilters = () => {
    setDraftFilters(filters);
    setFiltersOpen(true);
  };

  const applyFilters = () => {
    setFilters(draftFilters);
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    const emptyFilters = { q: '', category: '', isVeg: '', minPrice: '', maxPrice: '' };
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
    setFiltersOpen(false);
  };

  const logout = async () => {
    const rolePath = session?.role === 'foodPartner' ? 'foodpartner' : 'user';
    await axios.post(`${API_URL}/api/auth/${rolePath}/logout`, {}, { withCredentials: true });
    clearAuthToken();
    setSession(null);
  };

  const saveFoodItem = async (foodId) => {
    try {
      await axios.post(`${API_URL}/api/favorites/food/${foodId}`, {}, { withCredentials: true });
      setSavedFoodIds((current) => new Set(current).add(foodId));
    } catch (error) {
      alert(error.response?.data?.message || 'Please log in as a user to save items.');
    }
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="reels-container" ref={reelsContainerRef}>
      <header className="home-header">
        <Link className="brand" to="/">Zomato</Link>
        <nav className="home-nav" aria-label="Account navigation">
          {session?.role === 'user' ? (
            <Link to="/user/profile">My Profile</Link>
          ) : (
            <Link to="/user/login">User Login</Link>
          )}
          {session?.role === 'foodPartner' ? (
            <Link to={`/food-partner/${session.foodPartner._id}`}>My Restaurant</Link>
          ) : (
            <Link to="/foodpartner/login">Food Partner Login</Link>
          )}
          <Link to="/favorites">Saved</Link>
          <button type="button" className="filter-nav-button" onClick={openFilters} aria-expanded={filtersOpen} aria-controls="food-filter-panel">
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
          {session && <button type="button" className="filter-nav-button" onClick={logout}>Logout</button>}
        </nav>
      </header>

      {filtersOpen && (
        <section className="filter-panel" id="food-filter-panel" ref={filterPanelRef} role="dialog" aria-label="Food filters">
          <div className="filter-panel-heading">
            <h2>Find your food</h2>
            <button type="button" className="filter-close-button" onClick={() => setFiltersOpen(false)} aria-label="Close filters">×</button>
          </div>
          <div className="discovery-toolbar">
            <input type="search" value={draftFilters.q} onChange={(event) => updateFilter('q', event.target.value)} placeholder="Search food or restaurants" aria-label="Search food or restaurants" />
            <select value={draftFilters.category} onChange={(event) => updateFilter('category', event.target.value)} aria-label="Filter by category">
              <option value="">All categories</option>
              <option value="starters">Starters</option>
              <option value="main course">Main course</option>
              <option value="desserts">Desserts</option>
              <option value="beverages">Beverages</option>
              <option value="fast food">Fast food</option>
            </select>
            <select value={draftFilters.isVeg} onChange={(event) => updateFilter('isVeg', event.target.value)} aria-label="Filter by dietary preference">
              <option value="">All diets</option>
              <option value="true">Vegetarian</option>
              <option value="false">Non-vegetarian</option>
            </select>
            <input type="number" min="0" value={draftFilters.minPrice} onChange={(event) => updateFilter('minPrice', event.target.value)} placeholder="Min ₹" aria-label="Minimum price" />
            <input type="number" min="0" value={draftFilters.maxPrice} onChange={(event) => updateFilter('maxPrice', event.target.value)} placeholder="Max ₹" aria-label="Maximum price" />
          </div>
          <div className="filter-panel-actions">
            <button type="button" className="filter-reset-button" onClick={resetFilters}>Reset Filters</button>
            <button type="button" className="filter-apply-button" onClick={applyFilters}>Apply Filters</button>
          </div>
        </section>
      )}

      {videos.length === 0 ? (
        <section className="home-empty-state">
          <div className="welcome-card">
            <span className="welcome-badge">Welcome to Zomato</span>
            <h1>Discover great food near you</h1>
            <p>
              There are no food videos yet. Users can sign in to explore the menu,
              while food partners can create an account and add their first dish.
            </p>
            {loadError && <p className="load-error">{loadError}</p>}
            <div className="action-grid">
              <div className="action-card">
                <h2>For users</h2>
                <p>Browse food and visit your favourite food partners.</p>
                <div className="action-links">
                  <Link className="primary-action" to="/user/login">User Login</Link>
                  <Link className="secondary-action" to="/user/register">Create User Account</Link>
                </div>
              </div>
              <div className="action-card">
                <h2>For food partners</h2>
                <p>Join the platform and upload your food videos.</p>
                <div className="action-links">
                  <Link className="primary-action" to="/foodpartner/login">Partner Login</Link>
                  <Link className="secondary-action" to="/foodpartner/register">Register Business</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {videos.map((item, idx) => (
        <section
          className="reel"
          key={item._id}
          ref={(element) => {
            reelSectionsRef.current[idx] = element;
          }}
        >
          <video
            ref={(el) => (videosRef.current[idx] = el)}
            src={item.video}
            muted
            loop
            playsInline
            preload="metadata"
          />

          <div className="overlay-gradient" />
          {item.price != null && (
            <p className="reel-price">₹{Number(item.price).toFixed(2)}</p>
          )}
          <div className="overlay-content">
            <p className="reel-description line-clamp-2">{item.description}</p>
            <button
              className="visit-store-button"
              onClick={() => navigate(`/food-partner/${item.foodPartner}`)}
            >
              Visit Store
            </button>
            <button
              className={`save-item-button ${savedFoodIds.has(item._id) ? 'saved' : ''}`}
              type="button"
              onClick={() => saveFoodItem(item._id)}
              disabled={savedFoodIds.has(item._id)}
            >
              {savedFoodIds.has(item._id) ? '✓ Saved' : '♡ Save Item'}
            </button>
          </div>
        </section>
      ))}

      {videos.length > 0 && (
        <div className="scroll-controls" aria-label="Reel navigation">
          <button
            type="button"
            className="scroll-control"
            aria-label="Scroll up"
            title="Previous reel"
            onClick={() => scrollToReel(-1)}
          >
            ↑
          </button>
          <button
            type="button"
            className="scroll-control"
            aria-label="Scroll down"
            title="Next reel"
            onClick={() => scrollToReel(1)}
          >
            ↓
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
