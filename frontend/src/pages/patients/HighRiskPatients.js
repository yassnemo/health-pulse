import React, { useState } from 'react';
import { useApiData } from '../../hooks/useCustomHooks';
import { patientService } from '../../utils/api';
import { Card, Button, FormSelect, Spinner, Badge } from '../../components/ui/UIComponents';
import { HighRiskPatientCard } from '../../components/patient/PatientCards';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const HighRiskPatients = () => {
  const [riskType, setRiskType] = useState('all');
  const [department, setDepartment] = useState('');
  
  // Fetch high risk patients
  const { 
    data: highRiskPatients, 
    loading, 
    error,
    refresh 
  } = useApiData(
    () => patientService.getHighRiskPatients(department),
    [],
    [department]
  );
  
  // Handle risk type filter
  const filteredPatients = highRiskPatients?.filter(patient => {
    if (riskType === 'all') return true;
    
    const scores = patient.risk_scores || {};
    
    // Check if the specified risk type is high
    return scores[riskType] >= 0.7;
  }) || [];
  
  // Risk type options
  const riskTypeOptions = [
    { label: 'All Risk Types', value: 'all' },
    { label: 'Deterioration', value: 'deterioration' },
    { label: 'Readmission', value: 'readmission' },
    { label: 'Sepsis', value: 'sepsis' }
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
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-secondary-900">High Risk Patients</h1>
        <Button>
          Export Risk Report
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-secondary-900">Filters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              id="risk-type"
              label="Risk Type"
              name="risk-type"
              value={riskType}
              onChange={(e) => setRiskType(e.target.value)}
              options={riskTypeOptions}
            />
            
            <FormSelect
              id="department"
              label="Department"
              name="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={departmentOptions}
            />
          </div>
          
          <div className="flex justify-end">
            <Button onClick={refresh}>
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Risk stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total high risk patients */}
        <Card>
          <div className="text-center">
            <h3 className="text-sm font-medium text-secondary-500">Total High Risk</h3>
            <div className="mt-2 flex justify-center">
              <div className="bg-danger-100 rounded-full p-2">
                <span className="text-3xl font-bold text-danger-700">
                  {filteredPatients.length}
                </span>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Risk type breakdown */}
        <Card>
          <div className="text-center">
            <h3 className="text-sm font-medium text-secondary-500">Risk Type Breakdown</h3>
            <div className="mt-2 flex justify-center gap-4">
              {['deterioration', 'readmission', 'sepsis'].map((type) => {
                const count = highRiskPatients?.filter(p => 
                  (p.risk_scores?.[type] || 0) >= 0.7
                ).length || 0;
                
                return (
                  <div key={type} className="text-center">
                    <span className="text-lg font-semibold text-secondary-900 block">
                      {count}
                    </span>
                    <Badge 
                      variant={count > 0 ? 'red' : 'gray'}
                      className="mt-1"
                    >
                      {type}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
        
        {/* Department breakdown */}
        <Card>
          <div className="text-center">
            <h3 className="text-sm font-medium text-secondary-500">Department Breakdown</h3>
            <div className="mt-2">
              {loading ? (
                <div className="flex justify-center">
                  <Spinner size="sm" />
                </div>
              ) : (
                <ul className="space-y-1">
                  {['cardiology', 'neurology', 'oncology', 'orthopedics', 'general']
                    .map(dept => {
                      const count = highRiskPatients?.filter(
                        p => p.department.toLowerCase() === dept
                      ).length || 0;
                      
                      if (count === 0) return null;
                      
                      return (
                        <li key={dept} className="flex justify-between text-sm">
                          <span className="text-secondary-600 capitalize">{dept}:</span>
                          <span className="font-medium text-secondary-900">{count}</span>
                        </li>
                      );
                    }).filter(Boolean)}
                </ul>
              )}
            </div>
          </div>
        </Card>
      </div>
      
      {/* High risk patients list */}
      <div>
        <h2 className="text-lg font-medium text-secondary-900 mb-4">
          Patient List
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : error ? (
          <Card>
            <div className="bg-danger-50 p-4 text-danger-700 rounded-md">
              Error loading high risk patients: {error}
            </div>
          </Card>
        ) : filteredPatients.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-secondary-500">
                No high risk patients found with the selected filters
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <HighRiskPatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HighRiskPatients;
