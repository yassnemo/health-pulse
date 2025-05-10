import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApiData } from '../hooks/useCustomHooks';
import { patientService, alertService } from '../utils/api';
import { Card, Button, Badge, Spinner } from '../components/ui/UIComponents';
import { HighRiskPatientCard } from '../components/patient/PatientCards';
import { RiskGauge, RiskBadge } from '../components/risk/RiskIndicators';
import { BarChart } from '../components/visualizations/Charts';
import { 
  ChartBarSquareIcon, 
  UsersIcon, 
  ExclamationTriangleIcon, 
  BellIcon 
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { data: highRiskPatients, loading: loadingHighRisk } = useApiData(
    () => patientService.getHighRiskPatients(),
    [],
    []
  );
  
  const { data: alerts, loading: loadingAlerts } = useApiData(
    () => alertService.getAlerts({ status: 'active', limit: 5 }),
    [],
    []
  );
  
  // Mock data for statistics - in a real app, this would come from an API
  const [stats, setStats] = useState(null);
  
  // Mock data for risk distribution - in a real app, this would come from an API
  const [riskDistribution, setRiskDistribution] = useState([]);
  
  // Mock data for department stats - in a real app, this would come from an API
  const [departmentStats, setDepartmentStats] = useState([]);
  
  // Fetch mock data
  useEffect(() => {
    // Simulate API call for statistics
    setTimeout(() => {
      setStats({
        totalPatients: 124,
        highRiskPatients: 18,
        alertsCount: 12,
        averageRisk: 0.32
      });
    }, 500);
    
    // Simulate API call for risk distribution
    setTimeout(() => {
      setRiskDistribution([
        { label: 'Deterioration', value: 0.42 },
        { label: 'Readmission', value: 0.31 },
        { label: 'Sepsis', value: 0.24 }
      ]);
    }, 600);
    
    // Simulate API call for department stats
    setTimeout(() => {
      setDepartmentStats([
        { department: 'Cardiology', patientCount: 32, highRiskCount: 7 },
        { department: 'Neurology', patientCount: 28, highRiskCount: 4 },
        { department: 'Oncology', patientCount: 22, highRiskCount: 5 },
        { department: 'Orthopedics', patientCount: 18, highRiskCount: 1 },
        { department: 'General', patientCount: 24, highRiskCount: 1 }
      ]);
    }, 700);
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-secondary-900">Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            Export Report
          </Button>
          <Button size="sm">
            Refresh Data
          </Button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Patients */}
        <Card className="flex items-center">
          {!stats ? (
            <div className="w-full flex justify-center py-6">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="flex items-start w-full p-2">
              <div className="p-3 rounded-md bg-primary-100">
                <UsersIcon className="h-6 w-6 text-primary-700" />
              </div>
              <div className="ml-3 flex flex-col">
                <span className="text-sm text-secondary-500">Total Patients</span>
                <span className="text-2xl font-semibold text-secondary-900">{stats.totalPatients}</span>
              </div>
            </div>
          )}
        </Card>
        
        {/* High Risk Patients */}
        <Card className="flex items-center">
          {!stats ? (
            <div className="w-full flex justify-center py-6">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="flex items-start w-full p-2">
              <div className="p-3 rounded-md bg-danger-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-danger-700" />
              </div>
              <div className="ml-3 flex flex-col">
                <span className="text-sm text-secondary-500">High Risk Patients</span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-semibold text-secondary-900">{stats.highRiskPatients}</span>
                  <span className="ml-2 text-sm text-danger-700">
                    {((stats.highRiskPatients / stats.totalPatients) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
        
        {/* Active Alerts */}
        <Card className="flex items-center">
          {!stats ? (
            <div className="w-full flex justify-center py-6">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="flex items-start w-full p-2">
              <div className="p-3 rounded-md bg-warning-100">
                <BellIcon className="h-6 w-6 text-warning-700" />
              </div>
              <div className="ml-3 flex flex-col">
                <span className="text-sm text-secondary-500">Active Alerts</span>
                <span className="text-2xl font-semibold text-secondary-900">{stats.alertsCount}</span>
              </div>
            </div>
          )}
        </Card>
        
        {/* Average Risk Score */}
        <Card className="flex items-center">
          {!stats ? (
            <div className="w-full flex justify-center py-6">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="flex items-start w-full p-2">
              <div className="p-3 rounded-md bg-secondary-100">
                <ChartBarSquareIcon className="h-6 w-6 text-secondary-700" />
              </div>
              <div className="ml-3 flex flex-col">
                <span className="text-sm text-secondary-500">Average Risk</span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-semibold text-secondary-900">{(stats.averageRisk * 100).toFixed(1)}%</span>
                  <span className="ml-2">
                    <RiskBadge score={stats.averageRisk} />
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <Card title="Risk Distribution" className="col-span-1 lg:col-span-2">
          {riskDistribution.length === 0 ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <div className="p-4">
              <BarChart 
                data={riskDistribution}
                width={600}
                height={300}
                className="w-full"
              />
            </div>
          )}
        </Card>
        
        {/* Hospital Occupancy */}
        <Card title="Hospital Overview" className="col-span-1">
          {departmentStats.length === 0 ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center py-3">
                <RiskGauge score={stats?.averageRisk || 0} size="md" label="Hospital Risk Level" />
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-secondary-600 mb-2">Department Statistics</h4>
                <div className="space-y-2">
                  {departmentStats.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-secondary-900">{dept.department}</span>
                      <div className="flex items-center">
                        <span className="text-secondary-500">{dept.patientCount} patients</span>
                        <Badge 
                          variant="red" 
                          className="ml-2"
                        >
                          {dept.highRiskCount} high risk
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
      
      {/* High Risk Patients Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-secondary-900">High Risk Patients</h2>
          <Link to="/high-risk" className="text-sm text-primary-600 hover:text-primary-800">
            View all high risk patients →
          </Link>
        </div>
        
        {loadingHighRisk ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : !highRiskPatients?.length ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-secondary-500">No high risk patients found</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highRiskPatients.slice(0, 3).map((patient) => (
              <HighRiskPatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        )}
      </div>
      
      {/* Recent Alerts Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-secondary-900">Recent Alerts</h2>
          <Link to="/alerts" className="text-sm text-primary-600 hover:text-primary-800">
            View all alerts →
          </Link>
        </div>
        
        {loadingAlerts ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : !alerts?.length ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-secondary-500">No recent alerts found</p>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                    >
                      Patient
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                    >
                      Alert Type
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                    >
                      Priority
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                    >
                      Time
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/patients/${alert.patient_id}`} className="text-primary-600 hover:underline">
                          {alert.patient_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {alert.alert_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={
                            alert.priority === 'high' ? 'red' : 
                            alert.priority === 'medium' ? 'yellow' : 'green'
                          }
                        >
                          {alert.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                        {alert.created_at}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                        {alert.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
