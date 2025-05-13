import React from 'react';
import { Link } from 'react-router-dom';
import { RiskBadge, RiskScore } from '../risk/RiskIndicators';
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
      className="h-full transform transition-all duration-300 hover:shadow-lg"
      variant="default"
      hover={true}
      animate={true}
      onClick={onClick ? handleClick : undefined}
    >
      <div className="flex items-start">
        {/* Patient icon/avatar */}
        <div className="flex-shrink-0">
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 shadow-inner rounded-full p-3 flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-primary-700" />
          </div>
        </div>
        
        {/* Patient info */}
        <div className="ml-4 flex-1">
          {/* Patient name and basic info */}
          <div className="flex flex-wrap justify-between items-baseline mb-2">
            <Link 
              to={`/patients/${patient.id}`} 
              className="text-lg font-semibold text-primary-700 hover:text-primary-800 transition-colors hover:underline flex items-center group"
            >
              {formatPatientName(patient.name)}
              <svg className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transform transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <span className="text-sm font-medium text-secondary-500 bg-secondary-50 px-2 py-0.5 rounded-md">
              ID: {patient.id}
            </span>
          </div>
          
          {/* Demographics */}
          <div className="mt-1 flex flex-wrap text-sm">
            <span className="mr-4 bg-secondary-50 text-secondary-700 px-2 py-0.5 rounded-md">{patient.age} years • {patient.gender}</span>
            <span className="bg-secondary-50 text-secondary-700 px-2 py-0.5 rounded-md">Room: {patient.room || 'N/A'}</span>
          </div>
          
          {/* Department and attending */}
          <div className="mt-2 flex flex-wrap items-center text-sm">
            <span className="text-secondary-600 mr-2 font-medium">Department:</span>
            <Badge variant="blue" className="mr-4 shadow-sm">{patient.department}</Badge>
            <span className="text-secondary-600 mr-2 font-medium">Attending:</span>
            <span className="text-secondary-800 font-medium">{patient.attending_physician}</span>
          </div>
          
          {/* Admission date */}
          <div className="mt-2 text-sm bg-secondary-50 text-secondary-700 px-2 py-1 rounded-md inline-block">
            <span className="font-medium">Admitted:</span> {formatDateTime(patient.admission_date)}
          </div>
          
          {/* Diagnoses */}
          {patient.diagnoses && patient.diagnoses.length > 0 && (
            <div className="mt-3 pt-3 border-t border-secondary-100">
              <h4 className="text-xs font-semibold text-secondary-600 uppercase tracking-wider">Diagnoses:</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {patient.diagnoses.map((diagnosis, idx) => (
                  <Badge key={idx} variant="gray" className="shadow-sm">
                    {diagnosis}
                  </Badge>
                ))}
              </div>
            </div>
          )}
            {/* Risk scores */}
          {showRiskScores && (
            <div className="mt-4 pt-3 border-t border-secondary-100">
              <h4 className="text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-2">Risk Assessment:</h4>
              <div className="flex flex-wrap gap-3">
                {patient.risk_scores?.deterioration !== undefined && (
                  <div className="flex items-center bg-white border border-secondary-200 rounded-lg px-2 py-1.5 shadow-sm hover:bg-secondary-50 transition-colors">
                    <span className="text-xs font-medium text-secondary-700 mr-2">Deterioration:</span>
                    <RiskBadge score={patient.risk_scores.deterioration} />
                  </div>
                )}
                {patient.risk_scores?.readmission !== undefined && (
                  <div className="flex items-center bg-white border border-secondary-200 rounded-lg px-2 py-1.5 shadow-sm hover:bg-secondary-50 transition-colors">
                    <span className="text-xs font-medium text-secondary-700 mr-2">Readmission:</span>
                    <RiskBadge score={patient.risk_scores.readmission} />
                  </div>
                )}
                {patient.risk_scores?.sepsis !== undefined && (
                  <div className="flex items-center bg-white border border-secondary-200 rounded-lg px-2 py-1.5 shadow-sm hover:bg-secondary-50 transition-colors">
                    <span className="text-xs font-medium text-secondary-700 mr-2">Sepsis:</span>
                    <RiskBadge score={patient.risk_scores.sepsis} />
                  </div>
                )}
              </div>
            </div>
          )}
            {/* Alert indicators */}
          {patient.alerts && patient.alerts.length > 0 && (
            <div className="mt-3 flex items-center">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-danger-100">
                <ExclamationTriangleIcon className="h-4 w-4 text-danger-600" />
              </span>
              <span className="ml-2 text-sm font-medium text-danger-700 bg-danger-50 px-2 py-0.5 rounded-md animate-pulse-subtle">
                {patient.alerts.length} active {patient.alerts.length === 1 ? 'alert' : 'alerts'}
              </span>
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
  
  // Determine background color based on risk
  const getBgColor = () => {
    if (!highestRiskType.score || highestRiskType.score < 0.3) return 'hover:bg-secondary-50';
    if (highestRiskType.score >= 0.7) return 'hover:bg-danger-50/50';
    if (highestRiskType.score >= 0.4) return 'hover:bg-warning-50/50';
    return 'hover:bg-secondary-50';
  };
  
  return (
    <div 
      className={`border-b border-secondary-200 p-4 ${getBgColor()} transition-colors duration-150 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick ? handleClick : undefined}
    >
      <div className="flex justify-between items-center">
        {/* Patient info */}
        <div className="flex items-center flex-1">
          <div className="flex-shrink-0 mr-3">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-full p-2 shadow-inner">
              <UserIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          
          <div>
            <div className="flex items-baseline">
              <Link 
                to={`/patients/${patient.id}`} 
                className="text-primary-700 font-medium hover:text-primary-900 hover:underline mr-2 transition-colors group flex items-center"
              >
                {formatPatientName(patient.name)}
                <svg className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transform transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <span className="text-xs font-medium text-secondary-500 bg-secondary-50 px-1.5 py-0.5 rounded">
                ID: {patient.id}
              </span>
            </div>
            <div className="text-sm text-secondary-600 flex flex-wrap gap-x-4 mt-1">
              <span className="font-medium">{patient.age} y/o {patient.gender}</span>
              <span>Room: {patient.room || 'N/A'}</span>
              <Badge variant="blue" className="shadow-sm">{patient.department}</Badge>
            </div>
          </div>
        </div>
        
        {/* Risk indicators */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {patient.alerts && patient.alerts.length > 0 && (
            <div className="flex items-center bg-danger-50 px-2 py-1 rounded-full animate-pulse-subtle">
              <ExclamationTriangleIcon className="h-4 w-4 text-danger-600 mr-1" />
              <span className="text-xs font-medium text-danger-700">
                {patient.alerts.length}
              </span>
            </div>
          )}
          
          {highestRiskType.type && (
            <div className="transform hover:scale-110 transition-transform">
              <RiskBadge score={highestRiskType.score} />
            </div>
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
    <Card 
      className="h-full border-l-4 border-danger-500 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      variant="default"
      hover={true}
    >
      <div className="absolute top-0 right-0 mt-4 mr-4">
        <RiskScore 
          score={highestRiskType.score} 
          label={formatRiskType(highestRiskType.type)} 
        />
      </div>
      
      <div className="flex items-start mb-8">
        <div className="bg-danger-100 rounded-full p-3 mr-3">
          <UserIcon className="h-6 w-6 text-danger-700" />
        </div>
        
        <div>
          <Link 
            to={`/patients/${patient.id}`} 
            className="text-primary-700 text-lg font-semibold hover:underline inline-flex items-center group"
          >
            {formatPatientName(patient.name)}
            <svg className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transform transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <div className="text-sm text-secondary-600 mt-1">
            {patient.age} y/o {patient.gender} • <span className="font-medium">{patient.department}</span>
          </div>
          
          {/* Alert indicators */}
          {patient.alerts && patient.alerts.length > 0 && (
            <div className="mt-2 flex items-center">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-danger-100">
                <ExclamationTriangleIcon className="h-3 w-3 text-danger-600" />
              </span>
              <span className="text-xs font-medium text-danger-700 ml-1 animate-pulse-subtle">
                {patient.alerts.length} active {patient.alerts.length === 1 ? 'alert' : 'alerts'}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Top contributing factors */}
      {patient.contributing_factors && (
        <div className="mt-3 pt-3 border-t border-secondary-100">
          <h4 className="text-xs font-semibold text-secondary-600 uppercase tracking-wider">Key Risk Factors:</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {patient.contributing_factors.slice(0, 3).map((factor, idx) => (
              <Badge 
                key={idx} 
                variant={idx === 0 ? "red" : idx === 1 ? "yellow" : "gray"}
                className="px-2.5 py-1 shadow-sm"
              >
                {factor}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Call to action */}
      <div className="mt-4 pt-3 border-t border-secondary-100 flex justify-end">
        <Link 
          to={`/patients/${patient.id}`}
          className="inline-flex items-center text-sm text-primary-700 hover:text-primary-900 font-medium transition-colors"
        >
          View Patient Details
          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </Card>
  );
};
