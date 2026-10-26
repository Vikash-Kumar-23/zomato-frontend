import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserRegister from '../pages/UserRegister';
import UserLogin from '../pages/UserLogin';
import FoodPartnerRegister from '../pages/FoodPartnerRegister';
import FoodPartnerLogin from '../pages/FoodPartnerLogin';
import CreateFood from '../pages/food-partner/CreateFood'; // Corrected import path for CreateFood component
import Home from '../pages/general/Home'; // Import the Home component
import Profile from '../pages/food-partner/profile';
import Favorites from '../pages/Favorites';
import UserProfile from '../pages/UserProfile';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} /> {/* Add route for Home component */}
      <Route path="/user/register" element={<UserRegister />} />
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/foodpartner/register" element={<FoodPartnerRegister />} />
      <Route path="/foodpartner/login" element={<FoodPartnerLogin />} />
      <Route path="/create-food" element={<CreateFood />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/user/profile" element={<UserProfile />} />
      {/* Add other routes here */}
      <Route path="/food-partner/:id" element={<Profile />} />
    </Routes>
  );
};

export default AppRoutes;
