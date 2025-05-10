import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from '../../hooks/useCustomHooks';
import { Alert } from '../../components/ui/UIComponents';

const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  // Form validation
  const validateForm = (values) => {
    const errors = {};
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Email is invalid';
    }
    return errors;
  };
  
  // Setup form
  const { values, errors, handleChange, handleBlur, handleSubmit } = useForm(
    { email: '' },
    validateForm
  );
  
  // Handle password reset request
  const handleResetRequest = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      
      // In a real application, this would make an API call
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
    } catch (error) {
      setError('An error occurred. Please try again later.');
      console.error('Password reset error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submitted) {
    return (
      <div className="card p-8">
        <div className="text-center">
          <svg 
            className="mx-auto h-12 w-12 text-success-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          
          <h3 className="mt-2 text-lg font-medium text-secondary-900">Reset link sent!</h3>
          
          <div className="mt-4">
            <p className="text-sm text-secondary-500">
              We've sent an email to <span className="font-medium text-secondary-700">{values.email}</span> with 
              instructions to reset your password.
            </p>
            <p className="mt-2 text-sm text-secondary-500">
              If you don't receive an email within a few minutes, please check your spam folder.
            </p>
          </div>
          
          <div className="mt-6">
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Return to login
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card p-8">
      <h2 className="text-2xl font-bold text-center text-secondary-900 mb-2">
        Forgot your password?
      </h2>
      
      <p className="text-center text-secondary-600 mb-6">
        Enter your email and we'll send you a link to reset your password.
      </p>
      
      {/* Error message */}
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(handleResetRequest)} className="space-y-6">
        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${
                errors.email ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' : ''
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-danger-600">{errors.email}</p>
            )}
          </div>
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
                Sending...
              </div>
            ) : (
              'Send reset link'
            )}
          </button>
        </div>
      </form>
      
      <div className="text-center mt-4">
        <Link
          to="/login"
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
