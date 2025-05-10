import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../utils/api';

// Create authentication context
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if the user is already logged in (token exists)
  useEffect(() => {
    const token = localStorage.getItem('token');
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
      const response = await api.get('/api/v1/users/me');
      setCurrentUser(response.data);
      setError(null);
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
      
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await api.post('/api/v1/auth/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      
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
    localStorage.removeItem('token');
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
