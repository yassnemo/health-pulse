import React from 'react';

// Card component for dashboard widgets
export const Card = ({ 
  title, 
  children, 
  footer, 
  className = '',
  onClick = null,
  hover = false,
  animate = false,
  variant = 'default'
}) => {
  // Card variants
  const variants = {
    default: 'bg-white border border-secondary-100',
    primary: 'bg-primary-50 border border-primary-100',
    accent: 'bg-accent-50 border border-accent-100',
    success: 'bg-success-50 border border-success-100',
    warning: 'bg-warning-50 border border-warning-100',
    danger: 'bg-danger-50 border border-danger-100',
  };
  
  // Animation classes
  const animationClass = animate ? 'animate-fade-in' : '';
  const hoverClass = hover ? 'transition-all duration-200 hover:shadow-card-hover transform hover:-translate-y-1' : '';
  const cursorClass = onClick ? 'cursor-pointer' : '';

  return (
    <div 
      className={`rounded-xl shadow-card overflow-hidden ${variants[variant]} ${hoverClass} ${animationClass} ${cursorClass} ${className}`}
      onClick={onClick}
    >
      {title && (
        <div className="px-6 py-4 border-b border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-3 bg-secondary-50/50 border-t border-secondary-200">
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
  loading = false,
  animate = false,
}) => {
  // Button variants
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 border border-primary-700',
    secondary: 'bg-secondary-100 hover:bg-secondary-200 text-secondary-800 focus:ring-secondary-500 border border-secondary-200',
    accent: 'bg-accent-600 hover:bg-accent-700 text-white focus:ring-accent-500 border border-accent-700',
    danger: 'bg-danger-600 hover:bg-danger-700 text-white focus:ring-danger-500 border border-danger-700',
    success: 'bg-success-600 hover:bg-success-700 text-white focus:ring-success-500 border border-success-700',
    warning: 'bg-warning-500 hover:bg-warning-600 text-white focus:ring-warning-500 border border-warning-600',
    outline: 'bg-white hover:bg-secondary-50 border border-secondary-300 hover:border-secondary-400 text-secondary-800 focus:ring-primary-500',
    'outline-primary': 'bg-white hover:bg-primary-50 border border-primary-500 text-primary-700 hover:text-primary-800 focus:ring-primary-500',
    'outline-accent': 'bg-white hover:bg-accent-50 border border-accent-500 text-accent-700 hover:text-accent-800 focus:ring-accent-500',
    'ghost': 'bg-transparent hover:bg-secondary-50 text-secondary-700 hover:text-secondary-900 focus:ring-secondary-500',
    'ghost-primary': 'bg-transparent hover:bg-primary-50 text-primary-700 hover:text-primary-900 focus:ring-primary-500',
  };

  // Button sizes
  const sizes = {
    xs: 'px-2.5 py-1 text-xs rounded-md',
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2.5 text-sm rounded-lg',
    lg: 'px-5 py-3 text-base rounded-lg',
    xl: 'px-6 py-3.5 text-base rounded-xl',
  };
  
  // Animation classes
  const animationClass = animate ? 'animate-fade-in hover:animate-pulse-subtle' : '';
  const loadingClass = loading ? 'relative !text-transparent' : '';

  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center font-medium 
        shadow-button transition-all duration-200 ease-in-out
        hover:shadow-button-hover hover:transform hover:-translate-y-0.5
        active:shadow-inner active:translate-y-0.5 
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-button disabled:hover:translate-y-0
        ${variants[variant]} ${sizes[size]} ${animationClass} ${loadingClass} ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {icon && !loading && <span className={`${children ? 'mr-2' : ''} transition-transform group-hover:scale-110`}>{icon}</span>}
      {children}
      
      {/* Loading spinner overlay */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
              fill="none"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </span>
      )}
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
  icon = null,
  animate = false,
}) => {
  // Alert variants with icons
  const variants = {
    info: {
      classes: 'bg-primary-50 border-primary-500 text-primary-800',
      defaultIcon: (
        <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    success: {
      classes: 'bg-success-50 border-success-500 text-success-800',
      defaultIcon: (
        <svg className="h-5 w-5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    warning: {
      classes: 'bg-warning-50 border-warning-500 text-warning-800',
      defaultIcon: (
        <svg className="h-5 w-5 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    danger: {
      classes: 'bg-danger-50 border-danger-500 text-danger-800',
      defaultIcon: (
        <svg className="h-5 w-5 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  };
  
  // Animation classes
  const animationClass = animate ? 'animate-fade-in' : '';

  return (
    <div
      className={`border-l-4 p-4 rounded-lg shadow-sm ${variants[variant].classes} ${animationClass} ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        {/* Icon */}
        {(icon || variants[variant].defaultIcon) && (
          <div className="flex-shrink-0 mr-3">
            <div className="p-1 rounded-full bg-white bg-opacity-50">
              {icon || variants[variant].defaultIcon}
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-semibold mb-1 flex items-center">
              {title}
            </h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
        
        {/* Dismiss button */}
        {dismissible && (
          <button
            type="button"
            className="ml-3 p-1 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Badge component for status indicators
export const Badge = ({ 
  children, 
  variant = 'gray', 
  className = '',
  icon = null,
  dot = false,
  pulse = false,
  outline = false
}) => {
  // Badge variants
  const variants = {
    gray: outline 
      ? 'bg-white border border-secondary-300 text-secondary-700' 
      : 'bg-secondary-100 text-secondary-800',
    red: outline 
      ? 'bg-white border border-danger-300 text-danger-700' 
      : 'bg-danger-100 text-danger-800',
    yellow: outline 
      ? 'bg-white border border-warning-300 text-warning-700' 
      : 'bg-warning-100 text-warning-800',
    green: outline 
      ? 'bg-white border border-success-300 text-success-700' 
      : 'bg-success-100 text-success-800',
    blue: outline 
      ? 'bg-white border border-primary-300 text-primary-700' 
      : 'bg-primary-100 text-primary-800',
    accent: outline 
      ? 'bg-white border border-accent-300 text-accent-700' 
      : 'bg-accent-100 text-accent-800',
  };
  
  // Dot colors
  const dotColors = {
    gray: 'bg-secondary-500',
    red: 'bg-danger-500',
    yellow: 'bg-warning-500',
    green: 'bg-success-500',
    blue: 'bg-primary-500',
    accent: 'bg-accent-500',
  };
  
  // Pulse animation
  const pulseClass = pulse ? 'animate-pulse-subtle' : '';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${pulseClass} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {icon && (
        <span className="mr-1.5">{icon}</span>
      )}
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
