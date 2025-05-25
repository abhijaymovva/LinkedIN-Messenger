import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function AuthCallback({ setIsAuthenticated }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      if (token) {
        try {
          // Store the token
          localStorage.setItem('token', token);
          
          // Set up axios default headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Update authentication state
          setIsAuthenticated(true);
          
          // Redirect to home page
          navigate('/', { replace: true });
        } catch (error) {
          console.error('Error during authentication:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          navigate('/login', { replace: true });
        }
      } else {
        // If no token, redirect to login
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate, setIsAuthenticated]);

  return (
    <div className="auth-callback">
      <h2>Processing your login...</h2>
      <p>Please wait while we complete the authentication process.</p>
    </div>
  );
}

export default AuthCallback; 