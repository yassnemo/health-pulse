import React from 'react';

// Card component for dashboard widgets
export const Card = ({ title, children, footer, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-3 bg-secondary-50 border-t border-secondary-200">
          {footer}
        </div>
      )}
    </div>
  );
};

// Button component with various styles
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  icon,
}) => {
  // Button variants
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-secondary-100 hover:bg-secondary-200 text-secondary-800 focus:ring-secondary-500',
    danger: 'bg-danger-600 hover:bg-danger-700 text-white focus:ring-danger-500',
    success: 'bg-success-600 hover:bg-success-700 text-white focus:ring-success-500',
    warning: 'bg-warning-500 hover:bg-warning-600 text-white focus:ring-warning-500',
    outline: 'bg-white border border-secondary-300 hover:border-secondary-400 text-secondary-800 focus:ring-primary-500',
  };

  // Button sizes
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center font-medium rounded-md
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

// Alert component for showing messages
export const Alert = ({
  title,
  children,
  variant = 'info',
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  // Alert variants
  const variants = {
    info: 'bg-primary-50 border-primary-500 text-primary-800',
    success: 'bg-success-50 border-success-500 text-success-800',
    warning: 'bg-warning-50 border-warning-500 text-warning-800',
    danger: 'bg-danger-50 border-danger-500 text-danger-800',
  };

  return (
    <div
      className={`border-l-4 p-4 rounded-md ${variants[variant]} ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-1">
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
          <div className="text-sm">{children}</div>
        </div>
        {dismissible && (
          <button
            type="button"
            className="ml-3 text-sm"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Badge component for status indicators
export const Badge = ({ children, variant = 'gray', className = '' }) => {
  // Badge variants
  const variants = {
    gray: 'bg-secondary-100 text-secondary-800',
    red: 'bg-danger-100 text-danger-800',
    yellow: 'bg-warning-100 text-warning-800',
    green: 'bg-success-100 text-success-800',
    blue: 'bg-primary-100 text-primary-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

// Form input component
export const FormInput = ({
  id,
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  className = '',
  required = false,
  disabled = false,
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-secondary-700 mb-1">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`block w-full rounded-md shadow-sm
          ${
            error
              ? 'border-danger-300 text-danger-900 focus:ring-danger-500 focus:border-danger-500'
              : 'border-secondary-300 focus:ring-primary-500 focus:border-primary-500'
          }
          disabled:bg-secondary-100 disabled:cursor-not-allowed
        `}
      />
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  );
};

// Form select component
export const FormSelect = ({
  id,
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
  error,
  className = '',
  required = false,
  disabled = false,
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-secondary-700 mb-1">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        className={`block w-full rounded-md shadow-sm
          ${
            error
              ? 'border-danger-300 text-danger-900 focus:ring-danger-500 focus:border-danger-500'
              : 'border-secondary-300 focus:ring-primary-500 focus:border-primary-500'
          }
          disabled:bg-secondary-100 disabled:cursor-not-allowed
        `}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  );
};

// Loading spinner
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 border-primary-600 ${sizes[size]}`}
      ></div>
    </div>
  );
};

// Empty state component
export const EmptyState = ({ 
  title, 
  description, 
  icon, 
  action,
  className = '' 
}) => {
  return (
    <div className={`text-center px-6 py-10 ${className}`}>
      {icon && <div className="flex justify-center mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-secondary-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-secondary-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

// Pagination component
export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const pages = [];
  
  // Show 5 page buttons at most
  let startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(startPage + 4, totalPages);
  
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (totalPages <= 1) return null;

  return (
    <nav className={`flex items-center justify-between ${className}`}>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-secondary-700">
            Showing page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <ul className="flex space-x-1">
            {/* Previous button */}
            <li>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-md border
                  ${
                    currentPage === 1
                      ? 'border-secondary-300 bg-white text-secondary-300 cursor-not-allowed'
                      : 'border-secondary-300 bg-white text-secondary-500 hover:bg-secondary-50'
                  }`}
              >
                <span className="sr-only">Previous</span>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </li>
            
            {/* Page numbers */}
            {startPage > 1 && (
              <li>
                <button
                  onClick={() => onPageChange(1)}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-secondary-300 bg-white text-secondary-500 hover:bg-secondary-50"
                >
                  1
                </button>
              </li>
            )}
            
            {startPage > 2 && (
              <li>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-700">
                  ...
                </span>
              </li>
            )}
            
            {pages.map((page) => (
              <li key={page}>
                <button
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border
                    ${
                      page === currentPage
                        ? 'border-primary-500 bg-primary-50 text-primary-600 z-10'
                        : 'border-secondary-300 bg-white text-secondary-500 hover:bg-secondary-50'
                    }`}
                >
                  {page}
                </button>
              </li>
            ))}
            
            {endPage < totalPages - 1 && (
              <li>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-700">
                  ...
                </span>
              </li>
            )}
            
            {endPage < totalPages && (
              <li>
                <button
                  onClick={() => onPageChange(totalPages)}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-secondary-300 bg-white text-secondary-500 hover:bg-secondary-50"
                >
                  {totalPages}
                </button>
              </li>
            )}
            
            {/* Next button */}
            <li>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-md border
                  ${
                    currentPage === totalPages
                      ? 'border-secondary-300 bg-white text-secondary-300 cursor-not-allowed'
                      : 'border-secondary-300 bg-white text-secondary-500 hover:bg-secondary-50'
                  }`}
              >
                <span className="sr-only">Next</span>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

// Modal component
export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-secondary-900 bg-opacity-50 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        />
        
        {/* Modal panel */}
        <div className="inline-block w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
          {/* Modal header */}
          <div className="bg-white px-4 py-3 border-b border-secondary-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-secondary-900">{title}</h3>
            <button
              type="button"
              className="text-secondary-500 hover:text-secondary-700"
              onClick={onClose}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Modal content */}
          <div className="bg-white px-4 py-3">
            {children}
          </div>
          
          {/* Modal footer */}
          {footer && (
            <div className="bg-secondary-50 px-4 py-3 border-t border-secondary-200 flex justify-end space-x-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
