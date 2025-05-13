// Format date and time
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format just date
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
};

// Format just time
export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format a number with fixed precision
export const formatNumber = (number, decimals = 2) => {
  if (number === null || number === undefined) return '';
  return Number(number).toFixed(decimals);
};

// Format a risk score as a percentage
export const formatRiskScore = (score) => {
  if (score === null || score === undefined) return '';
  return `${(score * 100).toFixed(1)}%`;
};

// Get risk level class based on score
export const getRiskLevelClass = (score) => {
  if (score >= 0.7) return 'badge-red';
  if (score >= 0.4) return 'badge-yellow';
  return 'badge-green';
};

// Get risk level text based on score
export const getRiskLevelText = (score) => {
  if (score >= 0.7) return 'High';
  if (score >= 0.4) return 'Medium';
  return 'Low';
};

// Get alert priority class
export const getAlertPriorityClass = (priority) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'badge-red';
    case 'medium':
      return 'badge-yellow';
    case 'low':
      return 'badge-green';
    default:
      return 'badge-gray';
  }
};

// Format patient name
export const formatPatientName = (name) => {
  if (!name) return '';
  
  // If name includes a comma, assume format is "Last, First"
  if (name.includes(',')) {
    const [last, first] = name.split(',').map(part => part.trim());
    return `${first} ${last}`;
  }
  
  return name;
};

// Check if a vital sign is abnormal
export const isVitalAbnormal = (vitalName, value) => {
  if (value === null || value === undefined) return false;
  
  const ranges = {
    heart_rate: { min: 60, max: 100 },
    systolic_bp: { min: 90, max: 130 },
    diastolic_bp: { min: 60, max: 85 },
    temperature: { min: 36.5, max: 37.5 },
    respiration_rate: { min: 12, max: 20 },
    o2_saturation: { min: 95, max: 100 }
  };
  
  if (!ranges[vitalName]) return false;
  
  return value < ranges[vitalName].min || value > ranges[vitalName].max;
};

// Get vital sign display name
export const getVitalDisplayName = (vitalName) => {
  const displayNames = {
    heart_rate: 'Heart Rate',
    systolic_bp: 'Systolic BP',
    diastolic_bp: 'Diastolic BP',
    temperature: 'Temperature',
    respiration_rate: 'Respiration Rate',
    o2_saturation: 'O₂ Saturation',
    pain_level: 'Pain Level'
  };
  
  return displayNames[vitalName] || vitalName;
};

// Get vital sign unit
export const getVitalUnit = (vitalName) => {
  const units = {
    heart_rate: 'bpm',
    systolic_bp: 'mmHg',
    diastolic_bp: 'mmHg',
    temperature: '°C',
    respiration_rate: 'breaths/min',
    o2_saturation: '%',
    pain_level: '/10'
  };
  
  return units[vitalName] || '';
};

// Format a date as a relative time (e.g., "2 hours ago")
export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const now = new Date();
  const diffSeconds = Math.floor((now - date) / 1000);
  
  if (diffSeconds < 60) {
    return 'just now';
  }
  
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
  
  return formatDate(dateStr);
};

// Get a color for data visualization based on an index
export const getChartColor = (index) => {
  const colors = [
    '#4f46e5', // primary
    '#10b981', // success
    '#f59e0b', // warning
    '#ef4444', // danger
    '#8b5cf6', // accent
    '#3b82f6', // blue
    '#ec4899', // pink
    '#14b8a6', // teal
  ];
  
  return colors[index % colors.length];
};

// Format a large number with abbreviations (K, M, B)
export const formatLargeNumber = (number) => {
  if (number === null || number === undefined) return '';
  
  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(1) + 'B';
  }
  
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  }
  
  if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  }
  
  return number.toString();
};

// Generate initials from a name
export const getInitials = (name) => {
  if (!name) return '';
  
  const names = name.split(' ');
  if (names.length === 1) return name.charAt(0);
  
  return names[0].charAt(0) + names[names.length - 1].charAt(0);
};
