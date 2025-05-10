import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import PatientsList from '../../pages/patients/PatientsList';
import PatientDetail from '../../pages/patients/PatientDetail';
import { patientService } from '../../utils/api';

// Mock the API service
jest.mock('../../utils/api', () => ({
  patientService: {
    getPatients: jest.fn(),
    getPatient: jest.fn(),
    predictRisk: jest.fn(),
    explainRisk: jest.fn()
  }
}));

// Mock data
const mockPatients = {
  data: {
    patients: [
      {
        id: 'PT-001',
        firstName: 'John',
        lastName: 'Doe',
        age: 65,
        gender: 'Male',
        department: 'Cardiology',
        mrn: 'MRN12345',
        admissionDate: '2023-05-15T08:30:00',
        roomNumber: '301',
        riskScores: {
          readmission: 0.75,
          deterioration: 0.45,
          sepsis: 0.12
        }
      },
      {
        id: 'PT-002',
        firstName: 'Jane',
        lastName: 'Smith',
        age: 52,
        gender: 'Female',
        department: 'Neurology',
        mrn: 'MRN54321',
        admissionDate: '2023-05-12T14:15:00',
        roomNumber: '405',
        riskScores: {
          readmission: 0.32,
          deterioration: 0.22,
          sepsis: 0.08
        }
      }
    ],
    totalPages: 1
  }
};

const mockPatientDetail = {
  data: {
    id: 'PT-001',
    firstName: 'John',
    lastName: 'Doe',
    age: 65,
    gender: 'Male',
    dateOfBirth: '1958-03-10',
    department: 'Cardiology',
    mrn: 'MRN12345',
    admissionDate: '2023-05-15T08:30:00',
    roomNumber: '301',
    primaryPhysician: 'Dr. Michael Johnson',
    diagnosis: 'Congestive Heart Failure',
    allergies: ['Penicillin', 'Sulfa Drugs'],
    riskScores: {
      readmission: 0.75,
      deterioration: 0.45,
      sepsis: 0.12
    },
    vitals: [
      { name: 'Heart Rate', value: 88, unit: 'bpm', trend: 'stable', timestamp: '2023-05-16T08:00:00' },
      { name: 'Blood Pressure', value: '130/85', unit: 'mmHg', trend: 'increasing', timestamp: '2023-05-16T08:00:00' },
      { name: 'Temperature', value: 37.2, unit: '°C', trend: 'stable', timestamp: '2023-05-16T08:00:00' },
      { name: 'Respiratory Rate', value: 18, unit: 'breaths/min', trend: 'stable', timestamp: '2023-05-16T08:00:00' },
      { name: 'Oxygen Saturation', value: 94, unit: '%', trend: 'decreasing', timestamp: '2023-05-16T08:00:00' }
    ],
    medications: [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', startDate: '2023-05-15' },
      { name: 'Furosemide', dosage: '40mg', frequency: 'Twice daily', startDate: '2023-05-15' },
      { name: 'Metoprolol', dosage: '25mg', frequency: 'Twice daily', startDate: '2023-05-15' }
    ],
    recentNotes: [
      {
        id: 'N1',
        authorName: 'Dr. Michael Johnson',
        authorRole: 'Cardiologist',
        timestamp: '2023-05-15T14:30:00',
        content: 'Patient admitted with symptoms of acute heart failure. Started on standard protocol.'
      }
    ]
  }
};

const mockRiskExplanation = {
  data: {
    riskType: 'readmission',
    score: 0.75,
    features: [
      { name: 'Previous Readmissions', value: 3, weight: 0.35, direction: 'positive' },
      { name: 'Age', value: 65, weight: 0.15, direction: 'positive' },
      { name: 'Heart Rate', value: 88, weight: 0.12, direction: 'positive' },
      { name: 'Diagnosis', value: 'Congestive Heart Failure', weight: 0.28, direction: 'positive' },
      { name: 'Length of Stay', value: 3, weight: 0.05, direction: 'negative' }
    ]
  }
};

// Mock Auth Context
const mockAuthContext = {
  currentUser: { id: 'user-123', name: 'Test User', role: 'clinician' },
  isAuthenticated: true,
  loading: false
};

// Test suite
describe('Patient Workflow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    patientService.getPatients.mockResolvedValue(mockPatients);
    patientService.getPatient.mockResolvedValue(mockPatientDetail);
    patientService.predictRisk.mockResolvedValue({ data: { score: 0.75 } });
    patientService.explainRisk.mockResolvedValue(mockRiskExplanation);
  });

  test('navigate from patient list to patient detail', async () => {
    render(
      <AuthProvider value={mockAuthContext}>
        <MemoryRouter initialEntries={['/patients']}>
          <Routes>
            <Route path="/patients" element={<PatientsList />} />
            <Route path="/patients/:patientId" element={<PatientDetail />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    // Wait for patient list to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Verify patient list content
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Cardiology')).toBeInTheDocument();
    expect(screen.getByText('Neurology')).toBeInTheDocument();

    // Click on a patient to navigate to detail
    fireEvent.click(screen.getByText('John Doe'));

    // Wait for patient detail to load
    await waitFor(() => {
      expect(screen.getByText('Congestive Heart Failure')).toBeInTheDocument();
    });

    // Verify patient detail content
    expect(screen.getByText('MRN12345')).toBeInTheDocument();
    expect(screen.getByText('Dr. Michael Johnson')).toBeInTheDocument();
    expect(screen.getByText('Room 301')).toBeInTheDocument();

    // Verify medications are displayed
    expect(screen.getByText('Lisinopril')).toBeInTheDocument();
    expect(screen.getByText('40mg')).toBeInTheDocument();

    // Verify vitals are displayed
    expect(screen.getByText('Heart Rate')).toBeInTheDocument();
    expect(screen.getByText('88 bpm')).toBeInTheDocument();

    // Check that risk explanations can be displayed
    const readmissionTab = screen.getByText('Readmission Risk');
    fireEvent.click(readmissionTab);

    // Wait for risk explanation to load
    await waitFor(() => {
      expect(screen.getByText('Previous Readmissions')).toBeInTheDocument();
    });

    // Verify risk explanation content
    expect(screen.getByText('Diagnosis')).toBeInTheDocument();
    expect(screen.getByText('Heart Rate')).toBeInTheDocument();
  });
});
