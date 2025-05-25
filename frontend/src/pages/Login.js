import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have an error in the URL (from failed auth)
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      setError('Authentication failed. Please try again.');
    }
  }, []);

  const handleLinkedInLogin = () => {
    try {
      setIsLoading(true);
      setError(null);
      // Redirect to the backend LinkedIn auth endpoint
      window.location.href = 'http://localhost:5001/auth/linkedin';
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to initiate login. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome to LinkedIn Chat</h1>
        <p>Sign in with your LinkedIn account to continue</p>
        {error && <div className="error-message">{error}</div>}
        <button 
          type="button"
          className="linkedin-login-btn"
          onClick={handleLinkedInLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Sign in with LinkedIn'}
        </button>
      </div>
    </div>
  );
}

export default Login; 