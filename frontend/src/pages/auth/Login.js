import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useCustomHooks';
import { Alert } from '../../components/ui/UIComponents';

const Login = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  
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
  
  return (
    <div className="card p-8">
      <h2 className="text-2xl font-bold text-center text-secondary-900 mb-6">
        Sign in to your account
      </h2>
      
      {/* Error messages */}
      {(loginError || authError) && (
        <Alert variant="danger" className="mb-4">
          {loginError || authError}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
        {/* Username field */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-secondary-700">
            Username
          </label>
          <div className="mt-1">
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${
                errors.username ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' : ''
              }`}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-danger-600">{errors.username}</p>
            )}
          </div>
        </div>
        
        {/* Password field */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
              Password
            </label>
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${
                errors.password ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' : ''
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-danger-600">{errors.password}</p>
            )}
          </div>
        </div>
        
        {/* Remember me */}
        <div className="flex items-center">
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
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
};

export default Login;
