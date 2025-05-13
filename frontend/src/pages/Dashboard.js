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

const Dashboard = () => {  const { data: highRiskPatients, loading: loadingHighRisk } = useApiData(
    () => patientService.getHighRiskPatients(),
    null,
    []
  );
  
  const { data: alerts, loading: loadingAlerts } = useApiData(
    () => alertService.getAlerts({ status: 'active', limit: 5 }),
    null,
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
    <div className="space-y-6">      {/* Dashboard Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-card mb-6 animate-slide-down">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent">
            HealthPulse Dashboard
          </h1>
          <p className="text-secondary-500 mt-1">Overview of hospital analytics and patient risk assessment</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline-primary" 
            size="md" 
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            animate={true}
          >
            Export Report
          </Button>
          <Button 
            size="md" 
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
            animate={true}
          >
            Refresh Data
          </Button>
        </div>
      </div>
        {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Patients */}
        <Card 
          className="h-full" 
          variant="default" 
          hover={true} 
          animate={true}
        >
          {!stats ? (
            <div className="w-full flex justify-center py-6">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="flex items-start w-full">
              <div className="p-3.5 rounded-lg bg-primary-100/80 shadow-inner">
                <UsersIcon className="h-6 w-6 text-primary-700 animate-pulse-subtle" />
              </div>
              <div className="ml-4 flex flex-col">
                <span className="text-sm font-medium text-secondary-500">Total Patients</span>
                <span className="text-2xl font-bold text-secondary-900">{stats.totalPatients}</span>
                <span className="text-xs text-secondary-400 mt-0.5">Currently admitted</span>
              </div>
            </div>
          )}
        </Card>
        
        {/* High Risk Patients */}
        <Card 
          className="h-full" 
          variant="danger" 
          hover={true} 
          animate={true}
        >
          {!stats ? (
            <div className="w-full flex justify-center py-6">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="flex items-start w-full">
              <div className="p-3.5 rounded-lg bg-danger-100 shadow-inner">
                <ExclamationTriangleIcon className="h-6 w-6 text-danger-700 animate-pulse-subtle" />
              </div>
              <div className="ml-4 flex flex-col">
                <span className="text-sm font-medium text-secondary-500">High Risk Patients</span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-danger-700">{stats.highRiskPatients}</span>
                  <span className="ml-2 text-sm font-medium text-danger-600">
                    {((stats.highRiskPatients / stats.totalPatients) * 100).toFixed(1)}%
                  </span>
                </div>
                <span className="text-xs text-secondary-400 mt-0.5">Require attention</span>
              </div>
            </div>
          )}
        </Card>
        
        {/* Active Alerts */}
        <Card 
          className="h-full" 
          variant="warning" 
          hover={true} 
          animate={true}
        >
          {!stats ? (
            <div className="w-full flex justify-center py-6">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="flex items-start w-full">
              <div className="p-3.5 rounded-lg bg-warning-100 shadow-inner">
                <BellIcon className="h-6 w-6 text-warning-700 animate-pulse-subtle" />
              </div>
              <div className="ml-4 flex flex-col">
                <span className="text-sm font-medium text-secondary-500">Active Alerts</span>
                <span className="text-2xl font-bold text-warning-700">{stats.alertsCount}</span>
                <span className="text-xs text-secondary-400 mt-0.5">Pending review</span>
              </div>
            </div>
          )}
        </Card>
        
        {/* Average Risk Score */}
        <Card 
          className="h-full" 
          variant={stats?.averageRisk > 0.5 ? "warning" : "success"} 
          hover={true} 
          animate={true}
        >
          {!stats ? (
            <div className="w-full flex justify-center py-6">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="flex items-start w-full">
              <div className="p-3.5 rounded-lg bg-secondary-100 shadow-inner">
                <ChartBarSquareIcon className="h-6 w-6 text-secondary-700 animate-pulse-subtle" />
              </div>
              <div className="ml-4 flex flex-col">
                <span className="text-sm font-medium text-secondary-500">Average Risk</span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-secondary-900">{(stats.averageRisk * 100).toFixed(1)}%</span>
                  <span className="ml-2 transform hover:scale-110 transition-transform">
                    <RiskBadge score={stats.averageRisk} />
                  </span>
                </div>
                <span className="text-xs text-secondary-400 mt-0.5">Hospital-wide</span>
              </div>
            </div>
          )}
        </Card>
      </div>
        {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <Card 
          title="Risk Distribution" 
          className="col-span-1 lg:col-span-2"
          variant="primary"
          hover={true}
          animate={true}
        >
          {riskDistribution.length === 0 ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <div className="p-4 animate-fade-in">
              <BarChart 
                data={riskDistribution}
                width={600}
                height={300}
                className="w-full"
              />
              <div className="mt-4 flex justify-between text-sm text-secondary-500 border-t border-primary-100 pt-4">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-primary-500 mr-2"></span>
                  <span>Current Period</span>
                </div>
                <div>
                  <Button variant="ghost-primary" size="xs">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
        
        {/* Hospital Occupancy */}
        <Card 
          title="Hospital Overview" 
          className="col-span-1"
          variant="accent"
          hover={true}
          animate={true}
        >
          {departmentStats.length === 0 ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-center py-3">
                <RiskGauge score={stats?.averageRisk || 0} size="md" label="Hospital Risk Level" />
              </div>
              
              <div className="border rounded-lg p-3 bg-white shadow-sm">
                <h4 className="text-sm font-medium text-accent-800 border-b border-accent-100 pb-2 mb-3">Department Statistics</h4>
                <div className="space-y-3">
                  {departmentStats.map((dept, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-accent-50 transition-colors"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="font-medium text-secondary-900">{dept.department}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-secondary-500 bg-secondary-50 px-2 py-0.5 rounded-md">
                          {dept.patientCount} patients
                        </span>
                        <Badge 
                          variant={dept.highRiskCount > 2 ? "red" : "yellow"}
                          className="animate-pulse-subtle"
                        >
                          {dept.highRiskCount} high risk
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline-accent" size="xs">
                    View Department Details
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
        {/* High Risk Patients Section */}
      <div className="bg-danger-50/30 p-6 rounded-xl border border-danger-100">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-danger-600 mr-2" />
            <h2 className="text-xl font-bold text-danger-800">High Risk Patients</h2>
          </div>
          <Link 
            to="/high-risk" 
            className="text-sm text-danger-700 hover:text-danger-900 font-medium hover:underline flex items-center group"
          >
            View all 
            <svg className="w-4 h-4 ml-1 transform transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {loadingHighRisk ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : !highRiskPatients?.length ? (
          <Card variant="default" animate={true}>
            <div className="text-center py-8">
              <p className="text-secondary-500">No high risk patients found</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highRiskPatients.slice(0, 3).map((patient, index) => (
              <div 
                key={patient.id} 
                className="animate-fade-in" 
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <HighRiskPatientCard patient={patient} />
              </div>
            ))}
          </div>
        )}
      </div>
        {/* Recent Alerts Section */}
      <div className="bg-warning-50/30 p-6 rounded-xl border border-warning-100">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center">
            <BellIcon className="h-6 w-6 text-warning-600 mr-2" />
            <h2 className="text-xl font-bold text-warning-800">Recent Alerts</h2>
          </div>
          <Link 
            to="/alerts" 
            className="text-sm text-warning-700 hover:text-warning-900 font-medium hover:underline flex items-center group"
          >
            View all 
            <svg className="w-4 h-4 ml-1 transform transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {loadingAlerts ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : !alerts?.length ? (
          <Card variant="default" animate={true}>
            <div className="text-center py-8">
              <p className="text-secondary-500">No recent alerts found</p>
            </div>
          </Card>
        ) : (
          <Card variant="default" animate={true} className="overflow-hidden">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider"
                    >
                      Patient
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider"
                    >
                      Alert Type
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider"
                    >
                      Priority
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider"
                    >
                      Time
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {alerts.map((alert, index) => (
                    <tr 
                      key={alert.id} 
                      className="hover:bg-secondary-50 transition-colors duration-150"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/patients/${alert.patient_id}`} 
                          className="text-primary-600 hover:text-primary-800 font-medium hover:underline"
                        >
                          {alert.patient_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                        {alert.alert_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={
                            alert.priority === 'high' ? 'red' : 
                            alert.priority === 'medium' ? 'yellow' : 'green'
                          }
                          className={alert.priority === 'high' ? 'animate-pulse-subtle' : ''}
                        >
                          {alert.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                        {alert.created_at}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          alert.status === 'active' ? 'bg-warning-100 text-warning-800' : 
                          alert.status === 'resolved' ? 'bg-success-100 text-success-800' :
                          'bg-secondary-100 text-secondary-800'
                        }`}>
                          {alert.status}
                        </span>
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
