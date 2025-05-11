import axios from 'axios';

// Create axios instance with default config
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if it exists
    const storageKey = process.env.REACT_APP_AUTH_STORAGE_KEY || 'token';
    const token = localStorage.getItem(storageKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login page if on protected route
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Patient API
export const patientService = {
  // Get all patients with optional filters
  getPatients: (params = {}) => {
    return api.get('/api/v1/patients', { params });
  },
  
  // Get high risk patients
  getHighRiskPatients: (department) => {
    return api.get('/api/v1/high-risk', { params: { department } });
  },
  
  // Get patient details
  getPatient: (patientId) => {
    return api.get(`/api/v1/patients/${patientId}`);
  },
  
  // Get risk prediction
  predictRisk: (riskType, patientId) => {
    return api.get(`/api/v1/predict/${riskType}/${patientId}`);
  },
  
  // Get risk explanation
  explainRisk: (riskType, patientId) => {
    return api.get(`/api/v1/explain/${riskType}/${patientId}`);
  }
};

// Alert API
export const alertService = {
  // Get alerts with optional filters
  getAlerts: (params = {}) => {
    return api.get('/api/v1/alerts', { params });
  },
  
  // Update alert (acknowledge or dismiss)
  updateAlert: (alertId, data) => {
    return api.put(`/api/v1/alerts/${alertId}`, data);
  }
};

// Settings API
export const settingsService = {
  // Get alert thresholds
  getAlertThresholds: () => {
    return api.get('/api/v1/settings/alert-thresholds');
  },
  
  // Update alert thresholds
  updateAlertThresholds: (thresholds) => {
    return api.patch('/api/v1/settings/alert-thresholds', thresholds);
  }
};

// Admin API
export const adminService = {
  // Get users
  getUsers: (params = {}) => {
    return api.get('/api/v1/users', { params });
  },
  
  // Create user
  createUser: (userData) => {
    return api.post('/api/v1/users', userData);
  },
  
  // Get audit logs
  getAuditLogs: (params = {}) => {
    return api.get('/api/v1/audit-logs', { params });
  }
};

// Health check
export const healthService = {
  checkHealth: () => {
    return api.get('/api/v1/health');
  }
};

// Authentication service
export const authService = {
  login: (credentials) => {
    return api.post('/api/v1/auth/login', credentials);
  },
  
  logout: () => {
    return api.post('/api/v1/auth/logout');
  },
  
  forgotPassword: (email) => {
    return api.post('/api/v1/auth/forgot-password', { email });
  },
  
  resetPassword: (token, newPassword) => {
    return api.post('/api/v1/auth/reset-password', { token, newPassword });
  },
  
  changePassword: (data) => {
    return api.post('/api/v1/auth/change-password', data);
  },
  
  getProfile: () => {
    return api.get('/api/v1/auth/profile');
  },
  
  updateProfile: (data) => {
    return api.patch('/api/v1/auth/profile', data);
  }
};

// Dashboard service
export const dashboardService = {
  getSummary: (department) => {
    return api.get('/api/v1/dashboard/summary', { params: { department } });
  },
  
  getRiskDistribution: (riskType, department) => {
    return api.get('/api/v1/dashboard/risk-distribution', { 
      params: { riskType, department } 
    });
  },
  
  getRecentAlerts: (limit = 5) => {
    return api.get('/api/v1/dashboard/recent-alerts', { params: { limit } });
  },
  
  getTrends: (metric, period = '7d') => {
    return api.get('/api/v1/dashboard/trends', { params: { metric, period } });
  },
  
  getPerformanceMetrics: (department) => {
    return api.get('/api/v1/dashboard/performance', { params: { department } });
  }
};
