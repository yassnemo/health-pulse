import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.svg';

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();
  
  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            src={logo} 
            alt="HealthPulse Analytics" 
            className="mx-auto h-16 w-auto"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
            HealthPulse Analytics
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            Healthcare Predictive Analytics Platform
          </p>
        </div>
        
        {/* Render the child routes */}
        <Outlet />
        
        <div className="mt-8 text-center text-sm text-secondary-500">
          <p>© {new Date().getFullYear()} HealthPulse Analytics. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
