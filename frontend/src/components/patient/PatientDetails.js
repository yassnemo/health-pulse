import React from 'react';
import { Card, Badge, Spinner } from '../ui/UIComponents';
import { LineChart } from '../visualizations/Charts';
import { isVitalAbnormal, getVitalDisplayName, getVitalUnit } from '../../utils/formatters';
import { formatDateTime, formatDate } from '../../utils/formatters';

// Patient vitals display component
export const PatientVitals = ({ vitals, isLoading }) => {
  if (isLoading) {
    return (
      <Card title="Patient Vitals">
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </Card>
    );
  }

  if (!vitals || vitals.length === 0) {
    return (
      <Card title="Patient Vitals">
        <div className="text-center py-8 text-secondary-500">
          No vital signs data available
        </div>
      </Card>
    );
  }

  // Get the latest vitals
  const latestVitals = vitals[0];
  
  // Prepare data for charts
  const vitalTypes = Object.keys(latestVitals).filter(key => 
    key !== 'timestamp' && key !== 'patient_id'
  );
  
  const chartData = vitalTypes.map(vitalType => {
    return {
      name: vitalType,
      data: vitals.map(v => ({
        timestamp: new Date(v.timestamp),
        value: v[vitalType]
      })).reverse() // Reverse to show oldest to newest
    };
  });
  
  return (
    <Card title="Patient Vitals">
      {/* Latest vitals summary */}
      <div className="mb-6">
        <div className="text-sm text-secondary-500 mb-2">
          Latest Vitals • {formatDateTime(latestVitals.timestamp)}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {vitalTypes.map(vitalType => {
            const isAbnormal = isVitalAbnormal(vitalType, latestVitals[vitalType]);
            
            return (
              <div key={vitalType} className="flex flex-col">
                <span className="text-xs text-secondary-500">
                  {getVitalDisplayName(vitalType)}
                </span>
                <div className="flex items-baseline">
                  <span className={`text-lg font-medium ${isAbnormal ? 'text-danger-600' : 'text-secondary-900'}`}>
                    {latestVitals[vitalType]}
                  </span>
                  <span className="ml-1 text-xs text-secondary-500">
                    {getVitalUnit(vitalType)}
                  </span>
                  {isAbnormal && (
                    <Badge variant="red" className="ml-2">
                      Abnormal
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Vitals charts */}
      <div className="space-y-6">
        {chartData.map(chart => (
          <div key={chart.name}>
            <h4 className="text-sm font-medium text-secondary-700 mb-2">
              {getVitalDisplayName(chart.name)} Trend
            </h4>
            <LineChart 
              data={chart.data}
              width={600}
              height={200}
              xLabel="Time"
              yLabel={getVitalDisplayName(chart.name)}
              color="#0284c7"
              className="w-full"
              thresholds={
                (chart.name === 'heart_rate') ? { lower: 60, upper: 100 } : 
                (chart.name === 'systolic_bp') ? { lower: 90, upper: 130 } :
                (chart.name === 'diastolic_bp') ? { lower: 60, upper: 85 } :
                (chart.name === 'temperature') ? { lower: 36.5, upper: 37.5 } :
                (chart.name === 'respiration_rate') ? { lower: 12, upper: 20 } :
                (chart.name === 'o2_saturation') ? { lower: 95 } :
                null
              }
            />
          </div>
        ))}
      </div>
    </Card>
  );
};

// Patient demographics and administrative information
export const PatientInfo = ({ patient }) => {
  if (!patient) {
    return (
      <Card title="Patient Information">
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </Card>
    );
  }
  
  return (
    <Card title="Patient Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        <div className="py-1">
          <span className="text-sm text-secondary-500">Name</span>
          <p className="text-secondary-900">{patient.name}</p>
        </div>
        
        <div className="py-1">
          <span className="text-sm text-secondary-500">Patient ID</span>
          <p className="text-secondary-900">#{patient.id}</p>
        </div>
        
        <div className="py-1">
          <span className="text-sm text-secondary-500">Age</span>
          <p className="text-secondary-900">{patient.age} years</p>
        </div>
        
        <div className="py-1">
          <span className="text-sm text-secondary-500">Gender</span>
          <p className="text-secondary-900">{patient.gender}</p>
        </div>
        
        <div className="py-1">
          <span className="text-sm text-secondary-500">Date of Birth</span>
          <p className="text-secondary-900">{formatDate(patient.dob)}</p>
        </div>
        
        <div className="py-1">
          <span className="text-sm text-secondary-500">Room</span>
          <p className="text-secondary-900">{patient.room || 'N/A'}</p>
        </div>
        
        <div className="py-1">
          <span className="text-sm text-secondary-500">Department</span>
          <p className="text-secondary-900">{patient.department}</p>
        </div>
        
        <div className="py-1">
          <span className="text-sm text-secondary-500">Attending Physician</span>
          <p className="text-secondary-900">{patient.attending_physician}</p>
        </div>
        
        <div className="py-1">
          <span className="text-sm text-secondary-500">Admission Date</span>
          <p className="text-secondary-900">{formatDateTime(patient.admission_date)}</p>
        </div>
        
        <div className="py-1">
          <span className="text-sm text-secondary-500">Length of Stay</span>
          <p className="text-secondary-900">{patient.length_of_stay} days</p>
        </div>
      </div>
      
      {/* Diagnoses Section */}
      <div className="mt-4 pt-4 border-t border-secondary-200">
        <h4 className="text-sm font-medium text-secondary-700 mb-2">Diagnoses</h4>
        {patient.diagnoses && patient.diagnoses.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {patient.diagnoses.map((diagnosis, idx) => (
              <Badge key={idx} variant="blue">
                {diagnosis}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-secondary-500">No diagnoses recorded</p>
        )}
      </div>
      
      {/* Allergies Section */}
      <div className="mt-4 pt-4 border-t border-secondary-200">
        <h4 className="text-sm font-medium text-secondary-700 mb-2">Allergies</h4>
        {patient.allergies && patient.allergies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {patient.allergies.map((allergy, idx) => (
              <Badge key={idx} variant="red">
                {allergy}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-secondary-500">No allergies recorded</p>
        )}
      </div>
    </Card>
  );
};

// Patient lab results component
export const PatientLabs = ({ labs, isLoading }) => {
  if (isLoading) {
    return (
      <Card title="Laboratory Results">
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </Card>
    );
  }

  if (!labs || labs.length === 0) {
    return (
      <Card title="Laboratory Results">
        <div className="text-center py-8 text-secondary-500">
          No laboratory results available
        </div>
      </Card>
    );
  }
  
  // Group labs by date
  const labsByDate = labs.reduce((acc, lab) => {
    const date = formatDate(lab.timestamp);
    if (!acc[date]) acc[date] = [];
    acc[date].push(lab);
    return acc;
  }, {});
  
  return (
    <Card title="Laboratory Results">
      <div className="space-y-6">
        {Object.entries(labsByDate).map(([date, labsForDate]) => (
          <div key={date}>
            <h3 className="text-sm font-medium text-secondary-700 mb-2">
              {date}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Test
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Reference Range
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {labsForDate.map((lab, idx) => {
                    const isAbnormal = lab.status !== 'normal';
                    
                    return (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm text-secondary-900">
                          {lab.test_name}
                        </td>
                        <td className={`px-4 py-2 text-sm ${isAbnormal ? 'font-semibold text-danger-700' : 'text-secondary-900'}`}>
                          {lab.value} {lab.unit}
                        </td>
                        <td className="px-4 py-2 text-sm text-secondary-500">
                          {lab.reference_range}
                        </td>
                        <td className="px-4 py-2">
                          {lab.status === 'high' && (
                            <Badge variant="red">High</Badge>
                          )}
                          {lab.status === 'low' && (
                            <Badge variant="yellow">Low</Badge>
                          )}
                          {lab.status === 'normal' && (
                            <Badge variant="green">Normal</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Patient medications component
export const PatientMedications = ({ medications, isLoading }) => {
  if (isLoading) {
    return (
      <Card title="Medications">
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </Card>
    );
  }

  if (!medications || medications.length === 0) {
    return (
      <Card title="Medications">
        <div className="text-center py-8 text-secondary-500">
          No medications found
        </div>
      </Card>
    );
  }
  
  // Group medications by status (active vs. discontinued)
  const activeMeds = medications.filter(med => med.status === 'active');
  const discontinuedMeds = medications.filter(med => med.status === 'discontinued');
  
  return (
    <Card title="Medications">
      {/* Active medications */}
      <div>
        <h3 className="text-sm font-medium text-secondary-700 mb-2">
          Active Medications
        </h3>
        
        {activeMeds.length > 0 ? (
          <div className="space-y-3">
            {activeMeds.map((med, idx) => (
              <div key={idx} className="border-b border-secondary-100 pb-3 last:border-b-0 last:pb-0">
                <div className="flex justify-between">
                  <span className="font-medium text-secondary-900">{med.medication}</span>
                  <Badge variant="green">Active</Badge>
                </div>
                <div className="mt-1 text-sm text-secondary-500">{med.dosage} - {med.route}</div>
                <div className="mt-1 text-sm text-secondary-500">
                  <span className="font-medium">Schedule:</span> {med.schedule}
                </div>
                {med.start_date && (
                  <div className="mt-1 text-xs text-secondary-500">
                    Started: {formatDate(med.start_date)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-secondary-500">No active medications</p>
        )}
      </div>
      
      {/* Discontinued medications */}
      {discontinuedMeds.length > 0 && (
        <div className="mt-6 pt-4 border-t border-secondary-200">
          <h3 className="text-sm font-medium text-secondary-700 mb-2">
            Discontinued Medications
          </h3>
          
          <div className="space-y-3">
            {discontinuedMeds.map((med, idx) => (
              <div key={idx} className="border-b border-secondary-100 pb-3 last:border-b-0 last:pb-0">
                <div className="flex justify-between">
                  <span className="text-secondary-700">{med.medication}</span>
                  <Badge variant="gray">Discontinued</Badge>
                </div>
                <div className="mt-1 text-sm text-secondary-500">{med.dosage} - {med.route}</div>
                <div className="mt-1 text-xs text-secondary-500">
                  {med.start_date && <span>Started: {formatDate(med.start_date)}</span>}
                  {med.end_date && <span className="ml-3">Ended: {formatDate(med.end_date)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
