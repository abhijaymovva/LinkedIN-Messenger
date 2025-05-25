import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5001';
axios.defaults.withCredentials = true;

function Home() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Set up axios default headers
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/auth/profile');
        setUser(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data. Please try again.');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await axios.post('/auth/logout');
      
      // Clear local storage
      localStorage.removeItem('token');
      
      // Clear axios default headers
      delete axios.defaults.headers.common['Authorization'];
      
      // Clear any LinkedIn-related cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Redirect to login page
      window.location.href = 'http://localhost:3000/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the backend call fails, clear local data and redirect
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      window.location.href = 'http://localhost:3000/login';
    }
  };

  if (!user && !error) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome, {user?.firstName || 'User'}!</h1>
        <div className="header-actions">
          <Link to="/chat" className="chat-btn">Go to Chat</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>
      <main>
        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <p>You are now logged in with your LinkedIn account.</p>
            <p>Email: {user?.email}</p>
          </>
        )}
      </main>
    </div>
  );
}

export default Home; 