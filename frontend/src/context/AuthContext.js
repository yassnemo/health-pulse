import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../utils/api';

// Create authentication context
const AuthContext = createContext();

// Get environment variables
const AUTH_STORAGE_KEY = process.env.REACT_APP_AUTH_STORAGE_KEY || 'token';
const DEV_BYPASS_AUTH = process.env.REACT_APP_DEV_BYPASS_AUTH === 'true';

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if the user is already logged in (token exists)
  useEffect(() => {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);
  // Fetch user profile with token
  const fetchUserProfile = async (token) => {
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // If in development mode with bypass and no API available, use mock data
      if (DEV_BYPASS_AUTH && process.env.NODE_ENV === 'development') {
        // Set a mock user for development mode
        const dummyUser = {
          id: 1,
          username: 'dev_user',
          email: 'dev@healthpulse.com',
          firstName: 'Development',
          lastName: 'User',
          role: 'admin',
          department: 'IT',
          lastLogin: new Date().toISOString()
        };
        setCurrentUser(dummyUser);
        setError(null);
      } else {
        // Normal API request for production
        const response = await api.get('/api/v1/users/me');
        setCurrentUser(response.data);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to get user profile', err);
      logout();
      setError('Session expired. Please login again.');
    } finally {
      setLoading(false);
    }
  };
  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      
      // Check if we should bypass authentication for development
      if (DEV_BYPASS_AUTH) {
        // Create a mock user and token for development
        const mockToken = "dummy_dev_token_12345";
        localStorage.setItem(AUTH_STORAGE_KEY, mockToken);
        
        // Set a dummy user object
        const dummyUser = {
          id: 1,
          username: username || 'dev_user',
          email: username || 'dev@healthpulse.com',
          firstName: 'Development',
          lastName: 'User',
          role: 'admin',
          department: 'IT',
          lastLogin: new Date().toISOString()
        };
        
        setCurrentUser(dummyUser);
        setError(null);
        setLoading(false);
        
        console.log('Development mode: Authentication bypassed');
        return true;
      }
      
      // Real authentication for production
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await api.post('/api/v1/auth/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const { access_token } = response.data;
      localStorage.setItem(AUTH_STORAGE_KEY, access_token);
      
      await fetchUserProfile(access_token);
      return true;
    } catch (err) {
      console.error('Login failed', err);
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
      setLoading(false);
      return false;
    }
  };
  // Logout function
  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
