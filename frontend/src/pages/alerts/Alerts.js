import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiData, usePagination } from '../../hooks/useCustomHooks';
import { alertService } from '../../utils/api';
import { 
  Card, 
  Button, 
  FormSelect, 
  Badge, 
  Pagination, 
  Spinner,
  Alert 
} from '../../components/ui/UIComponents';
import { 
  ArrowPathIcon, 
  CheckIcon, 
  BellAlertIcon,
  BellSlashIcon 
} from '@heroicons/react/24/outline';
import { formatDateTime } from '../../utils/formatters';

const Alerts = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: 'active',
    priority: '',
    type: '',
    department: '',
  });
  
  // Pagination
  const { 
    page, 
    pageSize, 
    totalItems, 
    totalPages,
    setTotalItems, 
    goToPage
  } = usePagination(1, 20);
  
  // Fetch alerts
  const { 
    data: alertsData, 
    loading, 
    error, 
    refresh,
    setData
  } = useApiData(
    () => alertService.getAlerts({ 
      page, 
      page_size: pageSize,
      ...filters
    }),
    null,
    [page, pageSize, filters]
  );
  
  // Update total items when data changes
  useEffect(() => {
    if (alertsData?.total_count) {
      setTotalItems(alertsData.total_count);
    }
  }, [alertsData, setTotalItems]);
  
  // Handle viewing patient
  const viewPatient = (patientId) => {
    navigate(`/patients/${patientId}`);
  };
  
  // Handle alert acknowledgement
  const acknowledgeAlert = async (alertId) => {
    try {
      await alertService.updateAlert(alertId, { status: 'acknowledged' });
      
      // Update local data
      if (alertsData?.alerts) {
        const updatedAlerts = alertsData.alerts.map(alert => {
          if (alert.id === alertId) {
            return { ...alert, status: 'acknowledged' };
          }
          return alert;
        });
        
        setData({
          ...alertsData,
          alerts: updatedAlerts
        });
      }
      
      // Refresh data if we're filtering by status
      if (filters.status === 'active') {
        refresh();
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
      // Show error notification
    }
  };
  
  // Handle alert dismissal
  const dismissAlert = async (alertId) => {
    try {
      await alertService.updateAlert(alertId, { status: 'dismissed' });
      
      // Update local data
      if (alertsData?.alerts) {
        const updatedAlerts = alertsData.alerts.map(alert => {
          if (alert.id === alertId) {
            return { ...alert, status: 'dismissed' };
          }
          return alert;
        });
        
        setData({
          ...alertsData,
          alerts: updatedAlerts
        });
      }
      
      // Refresh data if we're filtering by status
      if (filters.status === 'active' || filters.status === 'acknowledged') {
        refresh();
      }
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
      // Show error notification
    }
  };
  
  // Status options
  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Acknowledged', value: 'acknowledged' },
    { label: 'Dismissed', value: 'dismissed' },
    { label: 'All', value: '' }
  ];
  
  // Priority options
  const priorityOptions = [
    { label: 'All Priorities', value: '' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' }
  ];
  
  // Alert type options
  const typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Vital Signs', value: 'vital_signs' },
    { label: 'Lab Results', value: 'lab_results' },
    { label: 'Deterioration Risk', value: 'deterioration_risk' },
    { label: 'Sepsis Risk', value: 'sepsis_risk' },
    { label: 'Medication', value: 'medication' }
  ];
  
  // Department options
  const departmentOptions = [
    { label: 'All Departments', value: '' },
    { label: 'Cardiology', value: 'cardiology' },
    { label: 'Neurology', value: 'neurology' },
    { label: 'Oncology', value: 'oncology' },
    { label: 'Orthopedics', value: 'orthopedics' },
    { label: 'General', value: 'general' }
  ];
  
  // Get alert priority class
  const getAlertPriorityClass = (priority) => {
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
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-secondary-900">Alerts</h1>
        <Button>
          Export Alerts Report
        </Button>
      </div>
      
      {/* Alert stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active alerts */}
        <Card className="bg-danger-50 border-danger-200">
          <div className="flex items-start">
            <div className="p-3 rounded-md bg-danger-100">
              <BellAlertIcon className="h-6 w-6 text-danger-700" />
            </div>
            <div className="ml-3">
              <h3 className="text-danger-800 font-medium">Active Alerts</h3>
              <div className="text-2xl font-semibold text-danger-900">
                {alertsData?.stats?.active || 0}
              </div>
            </div>
          </div>
        </Card>
        
        {/* Acknowledged alerts */}
        <Card className="bg-warning-50 border-warning-200">
          <div className="flex items-start">
            <div className="p-3 rounded-md bg-warning-100">
              <CheckIcon className="h-6 w-6 text-warning-700" />
            </div>
            <div className="ml-3">
              <h3 className="text-warning-800 font-medium">Acknowledged</h3>
              <div className="text-2xl font-semibold text-warning-900">
                {alertsData?.stats?.acknowledged || 0}
              </div>
            </div>
          </div>
        </Card>
        
        {/* Dismissed alerts */}
        <Card className="bg-secondary-50 border-secondary-200">
          <div className="flex items-start">
            <div className="p-3 rounded-md bg-secondary-100">
              <BellSlashIcon className="h-6 w-6 text-secondary-700" />
            </div>
            <div className="ml-3">
              <h3 className="text-secondary-800 font-medium">Dismissed</h3>
              <div className="text-2xl font-semibold text-secondary-900">
                {alertsData?.stats?.dismissed || 0}
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-secondary-900">Filters</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormSelect
              id="status"
              label="Status"
              name="status"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              options={statusOptions}
            />
            
            <FormSelect
              id="priority"
              label="Priority"
              name="priority"
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              options={priorityOptions}
            />
            
            <FormSelect
              id="type"
              label="Alert Type"
              name="type"
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              options={typeOptions}
            />
            
            <FormSelect
              id="department"
              label="Department"
              name="department"
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
              options={departmentOptions}
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="secondary" 
              className="mr-2"
              onClick={() => setFilters({
                status: 'active',
                priority: '',
                type: '',
                department: ''
              })}
            >
              Reset Filters
            </Button>
            <Button onClick={refresh}>
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Alerts list */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : error ? (
          <Alert variant="danger">
            Error loading alerts: {error}
          </Alert>
        ) : !alertsData?.alerts?.length ? (
          <div className="text-center py-8">
            <p className="text-secondary-500">No alerts found with the selected filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Alert Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {alertsData.alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => viewPatient(alert.patient_id)}
                        className="text-primary-600 hover:underline"
                      >
                        {alert.patient_name}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {alert.alert_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-900">
                      {alert.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getAlertPriorityClass(alert.priority).replace('badge-', '')}>
                        {alert.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {alert.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {formatDateTime(alert.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {alert.status === 'active' && (
                        <Badge variant="red">Active</Badge>
                      )}
                      {alert.status === 'acknowledged' && (
                        <Badge variant="yellow">Acknowledged</Badge>
                      )}
                      {alert.status === 'dismissed' && (
                        <Badge variant="gray">Dismissed</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => viewPatient(alert.patient_id)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Patient"
                        >
                          View
                        </button>
                        
                        {alert.status === 'active' && (
                          <>
                            <button 
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="text-warning-600 hover:text-warning-900"
                              title="Acknowledge Alert"
                            >
                              Acknowledge
                            </button>
                            <button 
                              onClick={() => dismissAlert(alert.id)}
                              className="text-danger-600 hover:text-danger-900"
                              title="Dismiss Alert"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                        
                        {alert.status === 'acknowledged' && (
                          <button 
                            onClick={() => dismissAlert(alert.id)}
                            className="text-danger-600 hover:text-danger-900"
                            title="Dismiss Alert"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && !error && alertsData?.alerts?.length > 0 && (
          <div className="px-6 py-4 border-t border-secondary-200">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default Alerts;
