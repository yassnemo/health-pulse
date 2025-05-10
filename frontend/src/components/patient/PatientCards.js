import React from 'react';
import { Link } from 'react-router-dom';
import { RiskBadge, RiskScore } from './RiskIndicators';
import { formatDateTime, formatPatientName } from '../../utils/formatters';
import { Card, Badge } from '../ui/UIComponents';
import { UserIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Patient summary card for dashboards and lists
export const PatientCard = ({ 
  patient, 
  showRiskScores = true,
  onClick = null 
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(patient);
    }
  };
  
  return (
    <Card 
      className={`h-full transition-shadow hover:shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick ? handleClick : undefined}
    >
      <div className="flex items-start">
        {/* Patient icon/avatar */}
        <div className="flex-shrink-0">
          <div className="bg-primary-100 rounded-full p-2">
            <UserIcon className="h-8 w-8 text-primary-700" />
          </div>
        </div>
        
        {/* Patient info */}
        <div className="ml-4 flex-1">
          {/* Patient name and basic info */}
          <div className="flex flex-wrap justify-between items-baseline">
            <Link to={`/patients/${patient.id}`} className="text-lg font-medium text-primary-700 hover:underline">
              {formatPatientName(patient.name)}
            </Link>
            <span className="text-sm text-secondary-500">
              #{patient.id}
            </span>
          </div>
          
          {/* Demographics */}
          <div className="mt-1 flex flex-wrap text-sm text-secondary-500">
            <span className="mr-4">{patient.age} y/o {patient.gender}</span>
            <span>Room: {patient.room || 'N/A'}</span>
          </div>
          
          {/* Department and attending */}
          <div className="mt-1 flex flex-wrap text-sm">
            <span className="text-secondary-500 mr-2">Department:</span>
            <Badge variant="blue" className="mr-2">{patient.department}</Badge>
            <span className="text-secondary-500 mr-2">Attending:</span>
            <span>{patient.attending_physician}</span>
          </div>
          
          {/* Admission date */}
          <div className="mt-1 text-sm text-secondary-500">
            <span>Admitted: {formatDateTime(patient.admission_date)}</span>
          </div>
          
          {/* Diagnoses */}
          {patient.diagnoses && patient.diagnoses.length > 0 && (
            <div className="mt-2">
              <h4 className="text-xs font-medium text-secondary-500 uppercase">Diagnoses:</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {patient.diagnoses.map((diagnosis, idx) => (
                  <Badge key={idx} variant="gray">
                    {diagnosis}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Risk scores */}
          {showRiskScores && (
            <div className="mt-3 border-t border-secondary-200 pt-2">
              <div className="flex flex-wrap items-center gap-4">
                {patient.risk_scores?.deterioration !== undefined && (
                  <div className="flex items-center">
                    <span className="text-xs text-secondary-500 mr-2">Deterioration:</span>
                    <RiskBadge score={patient.risk_scores.deterioration} />
                  </div>
                )}
                {patient.risk_scores?.readmission !== undefined && (
                  <div className="flex items-center">
                    <span className="text-xs text-secondary-500 mr-2">Readmission:</span>
                    <RiskBadge score={patient.risk_scores.readmission} />
                  </div>
                )}
                {patient.risk_scores?.sepsis !== undefined && (
                  <div className="flex items-center">
                    <span className="text-xs text-secondary-500 mr-2">Sepsis:</span>
                    <RiskBadge score={patient.risk_scores.sepsis} />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Alert indicators */}
          {patient.alerts && patient.alerts.length > 0 && (
            <div className="mt-2 flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-danger-500 mr-1" />
              <span className="text-sm text-danger-700">{patient.alerts.length} active alerts</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Compact patient list item
export const PatientListItem = ({ patient, onClick }) => {
  // Find highest risk score
  const riskScores = patient.risk_scores || {};
  const highestRiskType = Object.entries(riskScores).reduce(
    (highest, [type, score]) => {
      return score > highest.score ? { type, score } : highest;
    },
    { type: null, score: -1 }
  );
  
  const handleClick = () => {
    if (onClick) {
      onClick(patient);
    }
  };
  
  return (
    <div 
      className={`border-b border-secondary-200 p-3 hover:bg-secondary-50 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick ? handleClick : undefined}
    >
      <div className="flex justify-between items-center">
        {/* Patient info */}
        <div className="flex-1">
          <div className="flex items-baseline">
            <Link to={`/patients/${patient.id}`} className="text-primary-700 font-medium hover:underline mr-2">
              {formatPatientName(patient.name)}
            </Link>
            <span className="text-xs text-secondary-500">#{patient.id}</span>
          </div>
          <div className="text-sm text-secondary-600 flex flex-wrap gap-x-4">
            <span>{patient.age} y/o {patient.gender}</span>
            <span>Room: {patient.room || 'N/A'}</span>
            <span>{patient.department}</span>
          </div>
        </div>
        
        {/* Risk indicators */}
        <div className="flex-shrink-0 flex items-center">
          {patient.alerts && patient.alerts.length > 0 && (
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-danger-100 text-danger-800 text-xs font-medium mr-3">
              {patient.alerts.length}
            </span>
          )}
          
          {highestRiskType.type && (
            <RiskBadge score={highestRiskType.score} />
          )}
        </div>
      </div>
    </div>
  );
};

// High risk patient card for dashboard
export const HighRiskPatientCard = ({ patient }) => {
  // Find the highest risk score and its type
  const riskScores = patient.risk_scores || {};
  const highestRiskType = Object.entries(riskScores).reduce(
    (highest, [type, score]) => {
      return score > highest.score ? { type, score } : highest;
    },
    { type: null, score: -1 }
  );

  // Format risk type for display
  const formatRiskType = (type) => {
    if (!type) return '';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  return (
    <Card className="h-full border-l-4 border-danger-500">
      <div className="flex justify-between">
        <div>
          <Link to={`/patients/${patient.id}`} className="text-primary-700 font-medium hover:underline">
            {formatPatientName(patient.name)}
          </Link>
          <div className="text-sm text-secondary-600 mt-1">
            {patient.age} y/o {patient.gender} • {patient.department}
          </div>
          
          {/* Alert indicators */}
          {patient.alerts && patient.alerts.length > 0 && (
            <div className="mt-2 flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-danger-500 mr-1" />
              <span className="text-xs text-danger-700">{patient.alerts.length} active alerts</span>
            </div>
          )}
        </div>
        
        {/* Risk score */}
        <div className="flex-shrink-0">
          <RiskScore 
            score={highestRiskType.score} 
            label={formatRiskType(highestRiskType.type)} 
          />
        </div>
      </div>
      
      {/* Top contributing factors */}
      {patient.contributing_factors && (
        <div className="mt-3 pt-2 border-t border-secondary-200">
          <h4 className="text-xs font-medium text-secondary-500 uppercase">Key Factors:</h4>
          <div className="mt-1 flex flex-wrap gap-1">
            {patient.contributing_factors.slice(0, 3).map((factor, idx) => (
              <Badge key={idx} variant="gray">
                {factor}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Call to action */}
      <div className="mt-3 text-right">
        <Link 
          to={`/patients/${patient.id}`}
          className="text-xs text-primary-700 hover:text-primary-800 font-medium hover:underline"
        >
          View Details →
        </Link>
      </div>
    </Card>
  );
};
