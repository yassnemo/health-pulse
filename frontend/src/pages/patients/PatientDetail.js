import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApiData } from '../../hooks/useCustomHooks';
import { patientService } from '../../utils/api';
import { Card, Button, Badge, Spinner, Alert } from '../../components/ui/UIComponents';
import { 
  PatientInfo, 
  PatientVitals, 
  PatientLabs, 
  PatientMedications 
} from '../../components/patient/PatientDetails';
import { RiskGauge, RiskComparison } from '../../components/risk/RiskIndicators';
import { FeatureContributionChart } from '../../components/visualizations/Charts';
import { ArrowLeftIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';

const PatientDetail = () => {
  const { patientId } = useParams();
  const [selectedRiskType, setSelectedRiskType] = useState('deterioration');
  
  // Fetch patient details
  const { data: patient, loading, error } = useApiData(
    () => patientService.getPatient(patientId),
    null,
    [patientId]
  );
  
  // Fetch risk explanation
  const { 
    data: riskExplanation, 
    loading: loadingExplanation,
    error: explanationError
  } = useApiData(
    () => patientService.explainRisk(selectedRiskType, patientId),
    null,
    [selectedRiskType, patientId]
  );
  
  // Handle risk type selection
  const handleRiskTypeChange = (type) => {
    setSelectedRiskType(type);
  };
  
  // If loading
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }
  
  // If error
  if (error) {
    return (
      <div className="space-y-6">
        <Link to="/patients" className="inline-flex items-center text-primary-600 hover:text-primary-700">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Patients List
        </Link>
        <Alert variant="danger">
          <p>Error loading patient data: {error}</p>
        </Alert>
      </div>
    );
  }
  
  // If no patient data
  if (!patient) {
    return (
      <div className="space-y-6">
        <Link to="/patients" className="inline-flex items-center text-primary-600 hover:text-primary-700">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Patients List
        </Link>
        <Card>
          <div className="text-center py-8">
            <p className="text-secondary-500">Patient not found</p>
          </div>
        </Card>
      </div>
    );
  }
  
  // Get all risk scores for comparison
  const riskScores = [
    { label: 'Deterioration', score: patient.risk_scores?.deterioration || 0 },
    { label: 'Readmission', score: patient.risk_scores?.readmission || 0 },
    { label: 'Sepsis', score: patient.risk_scores?.sepsis || 0 }
  ];
  
  // Get current selected risk score
  const currentRiskScore = patient.risk_scores?.[selectedRiskType] || 0;
  
  return (
    <div className="space-y-6">
      {/* Back link and actions */}
      <div className="flex flex-wrap justify-between items-center">
        <Link to="/patients" className="inline-flex items-center text-primary-600 hover:text-primary-700">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Patients List
        </Link>
        
        <div className="flex space-x-2">
          <Button variant="outline">
            <DocumentChartBarIcon className="h-5 w-5 mr-2" />
            Export Patient Record
          </Button>
          <Button>
            View Full History
          </Button>
        </div>
      </div>
      
      {/* Patient header card */}
      <Card>
        <div className="flex flex-wrap justify-between items-start">
          {/* Patient basic info */}
          <div>
            <h1 className="text-2xl font-semibold text-secondary-900">
              {patient.name}
              <span className="ml-2 text-lg text-secondary-500">#{patient.id}</span>
            </h1>
            <p className="text-secondary-600 mt-1">
              {patient.age} y/o {patient.gender} • {patient.department} • Room: {patient.room || 'N/A'}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {patient.diagnoses?.map((diagnosis, idx) => (
                <Badge key={idx} variant="blue">
                  {diagnosis}
                </Badge>
              ))}
            </div>
            <div className="mt-4">
              <span className="text-sm text-secondary-500">Attending Physician:</span>
              <span className="ml-2">{patient.attending_physician}</span>
            </div>
          </div>
          
          {/* Patient alerts */}
          {patient.alerts && patient.alerts.length > 0 && (
            <div className="mt-4 md:mt-0 border-l border-secondary-200 pl-4">
              <h3 className="text-sm font-medium text-secondary-700 flex items-center">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-danger-100 text-danger-800 text-xs font-medium mr-2">
                  {patient.alerts.length}
                </span>
                Active Alerts
              </h3>
              <ul className="mt-2 space-y-1">
                {patient.alerts.map((alert, idx) => (
                  <li key={idx} className="text-sm text-secondary-600">
                    <span className="inline-block w-2 h-2 rounded-full bg-danger-500 mr-2"></span>
                    {alert.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Patient info and vitals */}
        <div className="lg:col-span-2 space-y-6">
          <PatientInfo patient={patient} />
          <PatientVitals vitals={patient.vitals} isLoading={false} />
        </div>
        
        {/* Right column - Risk scores and explanations */}
        <div className="space-y-6">
          {/* Risk scores */}
          <Card title="Risk Assessment">
            <div className="flex justify-center py-2">
              <RiskGauge score={currentRiskScore} label={selectedRiskType} />
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-secondary-700 mb-2">Risk Score Comparison</h3>
              <RiskComparison scores={riskScores} />
            </div>
            
            <div className="mt-4 pt-4 border-t border-secondary-200">
              <div className="flex space-x-2 mb-4">
                <Button 
                  variant={selectedRiskType === 'deterioration' ? 'primary' : 'outline'} 
                  size="sm"
                  onClick={() => handleRiskTypeChange('deterioration')}
                >
                  Deterioration
                </Button>
                <Button 
                  variant={selectedRiskType === 'readmission' ? 'primary' : 'outline'} 
                  size="sm"
                  onClick={() => handleRiskTypeChange('readmission')}
                >
                  Readmission
                </Button>
                <Button 
                  variant={selectedRiskType === 'sepsis' ? 'primary' : 'outline'} 
                  size="sm"
                  onClick={() => handleRiskTypeChange('sepsis')}
                >
                  Sepsis
                </Button>
              </div>
              
              {loadingExplanation ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : explanationError ? (
                <Alert variant="danger">
                  Error loading risk explanation
                </Alert>
              ) : !riskExplanation?.features || riskExplanation.features.length === 0 ? (
                <p className="text-center text-secondary-500 py-4">No explanation available</p>
              ) : (
                <div>
                  <h4 className="text-sm font-medium text-secondary-700 mb-2">Key Contributing Factors</h4>
                  <div className="bg-secondary-50 p-4 rounded-md">
                    <FeatureContributionChart 
                      data={riskExplanation.features.map(f => ({
                        feature: f.name,
                        contribution: f.contribution
                      }))}
                      height={300}
                      width={300}
                      margin={{ top: 20, right: 30, bottom: 30, left: 150 }}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Lab results and medications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PatientLabs labs={patient.labs} isLoading={false} />
        <PatientMedications medications={patient.medications} isLoading={false} />
      </div>
    </div>
  );
};

export default PatientDetail;
