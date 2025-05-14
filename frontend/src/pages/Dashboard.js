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
    <div className="space-y-6">      {/* Dashboard Header - Updated with new theme */}
      <div className="flex justify-between items-center bg-theme-panel p-5 rounded-lg shadow-card mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-theme-text-primary">
            HealthPulse Dashboard
          </h1>
          <p className="text-theme-text-secondary mt-1 text-sm">Overview of hospital analytics and patient risk assessment</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
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
        {/* Statistics Cards - Updated with clean clinical look */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Patients */}
        <Card 
          className="h-full bg-theme-panel" 
          hover={true} 
          animate={true}
        >
          {!stats ? (
            <div className="w-full flex justify-center py-6">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="flex items-start w-full p-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <UsersIcon className="h-5 w-5 text-theme-primary-accent" />
              </div>
              <div className="ml-4 flex flex-col">
                <span className="text-sm font-medium text-theme-text-secondary">Total Patients</span>
                <span className="text-2xl font-semibold text-theme-text-primary">{stats.totalPatients}</span>
                <span className="text-xs text-theme-text-secondary mt-1">Currently admitted</span>
              </div>
            </div>
          )}
        </Card>
        
        {/* High Risk Patients */}
        <Card 
          className="h-full bg-theme-panel" 
          hover={true} 
          animate={true}
        >
          {!stats ? (
            <div className="w-full flex justify-center py-6">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="flex items-start w-full p-4">
              <div className="p-3 rounded-lg bg-red-50">
                <ExclamationTriangleIcon className="h-5 w-5 text-theme-danger" />
              </div>
              <div className="ml-4 flex flex-col">
                <span className="text-sm font-medium text-theme-text-secondary">High Risk Patients</span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-semibold text-theme-text-primary">{stats.highRiskPatients}</span>
                  <span className="ml-2 text-sm text-theme-danger">
                    {((stats.highRiskPatients / stats.totalPatients) * 100).toFixed(1)}%
                  </span>
                </div>
                <span className="text-xs text-theme-text-secondary mt-1">Require attention</span>
              </div>
            </div>
          )}
        </Card>
        
        {/* Active Alerts */}
        <Card 
          className="h-full bg-theme-panel" 
          hover={true} 
          animate={true}
        >
          {!stats ? (
            <div className="w-full flex justify-center py-6">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="flex items-start w-full p-4">
              <div className="p-3 rounded-lg bg-amber-50">
                <BellIcon className="h-5 w-5 text-theme-warning" />
              </div>
              <div className="ml-4 flex flex-col">
                <span className="text-sm font-medium text-theme-text-secondary">Active Alerts</span>
                <span className="text-2xl font-semibold text-theme-text-primary">{stats.alertsCount}</span>
                <span className="text-xs text-theme-text-secondary mt-1">Pending review</span>
              </div>
            </div>
          )}
        </Card>
        
        {/* Average Risk Score */}
        <Card 
          className="h-full bg-theme-panel" 
          hover={true} 
          animate={true}
        >
          {!stats ? (
            <div className="w-full flex justify-center py-6">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="flex items-start w-full p-4">
              <div className="p-3 rounded-lg bg-green-50">
                <ChartBarSquareIcon className="h-5 w-5 text-theme-success" />
              </div>
              <div className="ml-4 flex flex-col">
                <span className="text-sm font-medium text-theme-text-secondary">Average Risk</span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-semibold text-theme-text-primary">{(stats.averageRisk * 100).toFixed(1)}%</span>
                  <span className="ml-2">
                    <RiskBadge score={stats.averageRisk} />
                  </span>
                </div>
                <span className="text-xs text-theme-text-secondary mt-1">Hospital-wide</span>
              </div>
            </div>
          )}
        </Card>
      </div>
        {/* Main Dashboard Content - Updated with clean clinical design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <Card 
          title="Risk Distribution" 
          className="col-span-1 lg:col-span-2 bg-theme-panel flex flex-col" // Added flex flex-col for better height management
          hover={true}
          animate={true}
          // Remove fixed height from card if any, let content define it or use min-height
        >
          {riskDistribution.length === 0 ? (
            <div className="flex justify-center items-center flex-grow py-12">
              <Spinner />
            </div>
          ) : (
            // This div will act as the main container for chart and its footer
            <div className="flex flex-col flex-grow p-0"> {/* Remove padding here, apply to inner elements if needed */}
              {/* Chart container - allow it to grow and set a specific height or let it be flexible */}
              <div className="p-4 animate-fade-in flex-grow min-h-[300px]"> 
                <BarChart 
                  data={riskDistribution}
                  // width and height props are removed from here to allow BarChart to be responsive
                  className="w-full h-full" // This className is for the div BarChart creates
                />
              </div>
              {/* Footer for the chart card */}
              <div className="border-t border-theme-border mt-auto pt-3 pb-3 px-4 text-sm">
                <div className="flex justify-between items-center text-theme-text-secondary">
                  <div className="flex items-center">
                    {/* Legend can be part of the chart or styled here */}
                    <span className="w-2.5 h-2.5 rounded-full bg-theme-primary-accent mr-2"></span>
                    <span>Current Period</span>
                  </div>
                  <div>
                    <Button variant="outline" size="xs">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
        
        {/* Hospital Overview */}
        <Card 
          title="Hospital Overview" 
          className="col-span-1 bg-theme-panel"
          hover={true}
          animate={true}
        >
          {departmentStats.length === 0 ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in p-4">
              <div className="flex justify-center py-3">
                <RiskGauge score={stats?.averageRisk || 0} size="md" label="Hospital Risk Level" />
              </div>
              
              <div className="border rounded-lg p-3 bg-theme-panel shadow-sm">
                <h4 className="text-sm font-medium text-theme-text-primary border-b border-theme-border pb-2 mb-3">Department Statistics</h4>
                <div className="space-y-3">
                  {departmentStats.map((dept, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-theme-border/30 transition-colors"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="font-medium text-theme-text-primary">{dept.department}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-theme-text-secondary bg-theme-border/50 px-2 py-0.5 rounded-md">
                          {dept.patientCount} patients
                        </span>
                        <Badge 
                          variant={dept.highRiskCount > 2 ? "red" : "yellow"}
                          className={dept.highRiskCount > 2 ? "animate-pulse-subtle" : ""}
                        >
                          {dept.highRiskCount} high risk
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" size="xs">
                    View Department Details
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
        {/* High Risk Patients Section - Updated with clinical color theme */}
      <div className="bg-red-50/50 p-6 rounded-lg border border-red-100 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-theme-danger mr-2" />
            <h2 className="text-xl font-semibold text-theme-text-primary">High Risk Patients</h2>
          </div>
          <Link 
            to="/high-risk" 
            className="text-sm text-theme-primary-accent hover:text-theme-primary-hover font-medium flex items-center group"
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
          <Card className="bg-theme-panel animate-fade-in">
            <div className="text-center py-8">
              <p className="text-theme-text-secondary">No high risk patients found</p>
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
        {/* Recent Alerts Section - Updated with clinical color theme */}
      <div className="bg-amber-50/50 p-6 rounded-lg border border-amber-100 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center">
            <BellIcon className="h-6 w-6 text-theme-warning mr-2" />
            <h2 className="text-xl font-semibold text-theme-text-primary">Recent Alerts</h2>
          </div>
          <Link 
            to="/alerts" 
            className="text-sm text-theme-primary-accent hover:text-theme-primary-hover font-medium flex items-center group"
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
          <Card className="bg-theme-panel animate-fade-in">
            <div className="text-center py-8">
              <p className="text-theme-text-secondary">No recent alerts found</p>
            </div>
          </Card>
        ) : (
          <Card className="bg-theme-panel animate-fade-in overflow-hidden">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-theme-border">
                <thead className="bg-theme-background">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-semibold text-theme-text-secondary uppercase tracking-wider"
                    >
                      Patient
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-semibold text-theme-text-secondary uppercase tracking-wider"
                    >
                      Alert Type
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-semibold text-theme-text-secondary uppercase tracking-wider"
                    >
                      Priority
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-semibold text-theme-text-secondary uppercase tracking-wider"
                    >
                      Time
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-semibold text-theme-text-secondary uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-theme-panel divide-y divide-theme-border">
                  {alerts.map((alert, index) => (
                    <tr 
                      key={alert.id} 
                      className="hover:bg-theme-background transition-colors duration-150"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/patients/${alert.patient_id}`} 
                          className="text-theme-primary-accent hover:text-theme-primary-hover font-medium"
                        >
                          {alert.patient_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-text-primary">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-secondary">
                        {alert.created_at}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          alert.status === 'active' ? 'bg-amber-100 text-amber-800' : 
                          alert.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
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
