import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useCustomHooks';
import { Alert, Button } from '../../components/ui/UIComponents';
import logo from '../../assets/logo.svg';

const Login = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [animateIn, setAnimateIn] = useState(false);
  
  // Trigger animations after initial render
  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 100);
  }, []);
  
  // Form validation
  const validateForm = (values) => {
    const errors = {};
    if (!values.username) {
      errors.username = 'Username is required';
    }
    if (!values.password) {
      errors.password = 'Password is required';
    }
    return errors;
  };
  
  // Setup form
  const { values, errors, handleChange, handleBlur, handleSubmit } = useForm(
    { username: '', password: '' },
    validateForm
  );
    // Handle login
  const handleLogin = async () => {
    try {
      setIsSubmitting(true);
      setLoginError('');
      
      const success = await login(values.username, values.password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setLoginError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      setLoginError('An error occurred during login. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (    <div className={`min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-6 ${animateIn ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
      <div className={`max-w-md w-full ${animateIn ? 'animate-slide-up' : ''}`}>
        {/* Logo and header */}
        <div className="text-center mb-8">
          <div className="inline-block animate-float">
            <img src={logo} alt="HealthPulse" className="h-12 mx-auto mb-4" />
          </div>
          <h1 className="text-3xl font-display font-bold text-secondary-900">Welcome Back</h1>
          <p className="mt-2 text-secondary-600">Sign in to access your HealthPulse dashboard</p>
        </div>
        
        {/* Login card */}
        <div className="bg-white shadow-card rounded-xl p-8 border border-secondary-100">
          {/* Error messages */}
          {(loginError || authError) && (
            <Alert variant="danger" className="mb-6 animate-fade-in">
              {loginError || authError}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
            {/* Username field */}
            <div className={`transition duration-300 ease-in-out ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
              <label htmlFor="username" className="block text-sm font-medium text-secondary-700">
                Username
              </label>
              <div className="mt-1 relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={values.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input block w-full rounded-lg shadow-sm px-4 py-3 border ${
                    errors.username 
                      ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500 pr-10' 
                      : 'border-secondary-200 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-danger-600 animate-fade-in">{errors.username}</p>
                )}
              </div>
            </div>
            
            {/* Password field */}
            <div className={`transition duration-300 ease-in-out ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                  Password
                </label>
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input block w-full rounded-lg shadow-sm px-4 py-3 border ${
                    errors.password ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' : 'border-secondary-200 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-danger-600 animate-fade-in">{errors.password}</p>
                )}
              </div>
            </div>
            
            {/* Remember me */}
            <div className={`flex items-center transition duration-300 ease-in-out ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-700">
                Remember me
              </label>
            </div>
            
            {/* Submit button */}
            <div className={`transition duration-300 ease-in-out ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-button text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Register link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-secondary-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>  );
};

export default Login;
