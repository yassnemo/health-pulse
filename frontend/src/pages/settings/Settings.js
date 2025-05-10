import React, { useState } from 'react';
import { Card, Button, FormInput, FormSelect, Alert, Spinner } from '../../components/ui/UIComponents';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Settings form state
  const [general, setGeneral] = useState({
    notificationEmail: currentUser?.email || '',
    language: 'en',
    timezone: 'UTC'
  });
  
  // Dashboard preferences state
  const [dashboard, setDashboard] = useState({
    defaultView: 'summary',
    refreshRate: '5',
    showHighRiskOnly: false,
  });
  
  // Alert preferences state
  const [alerts, setAlerts] = useState({
    emailNotifications: true,
    smsNotifications: false,
    highPriorityOnly: false,
  });
  
  // Theme preferences
  const [theme, setTheme] = useState({
    mode: 'light',
    primaryColor: 'blue',
  });
  
  // Handle form submission for general settings
  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update settings. Please try again.');
      console.error('Settings update error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form submission for dashboard preferences
  const handleDashboardSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update dashboard preferences. Please try again.');
      console.error('Dashboard preferences update error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form submission for alert preferences
  const handleAlertsSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update alert preferences. Please try again.');
      console.error('Alert preferences update error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle theme change
  const handleThemeSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update theme settings. Please try again.');
      console.error('Theme settings update error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Language options
  const languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' }
  ];
  
  // Timezone options
  const timezoneOptions = [
    { label: 'UTC', value: 'UTC' },
    { label: 'Eastern Time (ET)', value: 'America/New_York' },
    { label: 'Central Time (CT)', value: 'America/Chicago' },
    { label: 'Mountain Time (MT)', value: 'America/Denver' },
    { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' }
  ];
  
  // Dashboard view options
  const dashboardViewOptions = [
    { label: 'Summary', value: 'summary' },
    { label: 'High Risk Patients', value: 'high-risk' },
    { label: 'Recent Alerts', value: 'alerts' },
  ];
  
  // Refresh rate options
  const refreshRateOptions = [
    { label: 'Every minute', value: '1' },
    { label: 'Every 5 minutes', value: '5' },
    { label: 'Every 15 minutes', value: '15' },
    { label: 'Every 30 minutes', value: '30' },
    { label: 'Every hour', value: '60' },
    { label: 'Manual refresh only', value: '0' }
  ];
  
  // Theme options
  const themeOptions = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System Default', value: 'system' }
  ];
  
  // Primary color options
  const colorOptions = [
    { label: 'Blue', value: 'blue' },
    { label: 'Green', value: 'green' },
    { label: 'Purple', value: 'purple' },
    { label: 'Teal', value: 'teal' }
  ];
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-secondary-900">Settings</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Manage your application preferences and account settings
        </p>
      </div>
      
      {/* Success notification */}
      {success && (
        <Alert variant="success" dismissible onDismiss={() => setSuccess(false)}>
          <p>Settings have been successfully updated!</p>
        </Alert>
      )}
      
      {/* Error notification */}
      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError('')}>
          <p>{error}</p>
        </Alert>
      )}
      
      {/* General Settings */}
      <Card title="General Settings">
        <form onSubmit={handleGeneralSubmit}>
          <div className="space-y-4">
            <FormInput
              id="notification-email"
              label="Notification Email"
              type="email"
              name="notificationEmail"
              value={general.notificationEmail}
              onChange={(e) => setGeneral({...general, notificationEmail: e.target.value})}
              placeholder="email@example.com"
            />
            
            <FormSelect
              id="language"
              label="Language"
              name="language"
              value={general.language}
              onChange={(e) => setGeneral({...general, language: e.target.value})}
              options={languageOptions}
            />
            
            <FormSelect
              id="timezone"
              label="Timezone"
              name="timezone"
              value={general.timezone}
              onChange={(e) => setGeneral({...general, timezone: e.target.value})}
              options={timezoneOptions}
            />
            
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner size="sm" className="mr-2" /> : null}
                Save General Settings
              </Button>
            </div>
          </div>
        </form>
      </Card>
      
      {/* Dashboard Preferences */}
      <Card title="Dashboard Preferences">
        <form onSubmit={handleDashboardSubmit}>
          <div className="space-y-4">
            <FormSelect
              id="default-view"
              label="Default Dashboard View"
              name="defaultView"
              value={dashboard.defaultView}
              onChange={(e) => setDashboard({...dashboard, defaultView: e.target.value})}
              options={dashboardViewOptions}
            />
            
            <FormSelect
              id="refresh-rate"
              label="Dashboard Refresh Rate"
              name="refreshRate"
              value={dashboard.refreshRate}
              onChange={(e) => setDashboard({...dashboard, refreshRate: e.target.value})}
              options={refreshRateOptions}
            />
            
            <div className="flex items-center">
              <input
                id="show-high-risk"
                name="showHighRiskOnly"
                type="checkbox"
                checked={dashboard.showHighRiskOnly}
                onChange={(e) => setDashboard({...dashboard, showHighRiskOnly: e.target.checked})}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label htmlFor="show-high-risk" className="ml-2 block text-sm text-secondary-700">
                Show high risk patients by default
              </label>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner size="sm" className="mr-2" /> : null}
                Save Dashboard Preferences
              </Button>
            </div>
          </div>
        </form>
      </Card>
      
      {/* Alert Preferences */}
      <Card title="Alert Preferences">
        <form onSubmit={handleAlertsSubmit}>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="email-notifications"
                name="emailNotifications"
                type="checkbox"
                checked={alerts.emailNotifications}
                onChange={(e) => setAlerts({...alerts, emailNotifications: e.target.checked})}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label htmlFor="email-notifications" className="ml-2 block text-sm text-secondary-700">
                Receive email notifications for new alerts
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="sms-notifications"
                name="smsNotifications"
                type="checkbox"
                checked={alerts.smsNotifications}
                onChange={(e) => setAlerts({...alerts, smsNotifications: e.target.checked})}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label htmlFor="sms-notifications" className="ml-2 block text-sm text-secondary-700">
                Receive SMS notifications for new alerts
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="high-priority-only"
                name="highPriorityOnly"
                type="checkbox"
                checked={alerts.highPriorityOnly}
                onChange={(e) => setAlerts({...alerts, highPriorityOnly: e.target.checked})}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label htmlFor="high-priority-only" className="ml-2 block text-sm text-secondary-700">
                Only notify me for high priority alerts
              </label>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner size="sm" className="mr-2" /> : null}
                Save Alert Preferences
              </Button>
            </div>
          </div>
        </form>
      </Card>
      
      {/* Appearance Settings */}
      <Card title="Appearance Settings">
        <form onSubmit={handleThemeSubmit}>
          <div className="space-y-4">
            <FormSelect
              id="theme-mode"
              label="Theme Mode"
              name="themeMode"
              value={theme.mode}
              onChange={(e) => setTheme({...theme, mode: e.target.value})}
              options={themeOptions}
            />
            
            <FormSelect
              id="primary-color"
              label="Primary Color"
              name="primaryColor"
              value={theme.primaryColor}
              onChange={(e) => setTheme({...theme, primaryColor: e.target.value})}
              options={colorOptions}
            />
            
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner size="sm" className="mr-2" /> : null}
                Save Appearance Settings
              </Button>
            </div>
          </div>
        </form>
      </Card>
      
      {/* Account Security */}
      <Card title="Account Security">
        <p className="text-sm text-secondary-500 mb-4">
          Manage your account security settings including password changes and two-factor authentication.
        </p>
        
        <div className="space-y-4">
          <Button variant="outline">
            Change Password
          </Button>
          
          <div className="flex items-center">
            <input
              id="two-factor"
              name="twoFactor"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
            />
            <label htmlFor="two-factor" className="ml-2 block text-sm text-secondary-700">
              Enable two-factor authentication
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
