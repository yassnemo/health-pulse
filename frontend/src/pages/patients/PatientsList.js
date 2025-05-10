import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiData, usePagination } from '../../hooks/useCustomHooks';
import { patientService } from '../../utils/api';
import { Card, Button, FormInput, FormSelect, Pagination, Spinner } from '../../components/ui/UIComponents';
import { PatientListItem } from '../../components/patient/PatientCards';
import { MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const PatientsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    risk_level: '',
    admission_date: ''
  });
  
  // Pagination
  const { 
    page, 
    pageSize, 
    totalItems, 
    totalPages,
    setTotalItems, 
    nextPage, 
    prevPage, 
    goToPage,
    changePageSize
  } = usePagination();
  
  // Fetch patients
  const { 
    data: patientsData, 
    loading, 
    error, 
    refresh,
    setData
  } = useApiData(
    () => patientService.getPatients({ 
      page, 
      page_size: pageSize,
      search: searchTerm,
      department: filters.department,
      risk_level: filters.risk_level,
      admission_date: filters.admission_date
    }),
    null,
    [page, pageSize, searchTerm, filters]
  );
  
  // Update total items when data changes
  useEffect(() => {
    if (patientsData?.total_count) {
      setTotalItems(patientsData.total_count);
    }
  }, [patientsData, setTotalItems]);
  
  // Handle patient click
  const handlePatientClick = (patient) => {
    navigate(`/patients/${patient.id}`);
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    refresh();
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      department: '',
      risk_level: '',
      admission_date: ''
    });
    setSearchTerm('');
  };
  
  // Department options
  const departmentOptions = [
    { label: 'All Departments', value: '' },
    { label: 'Cardiology', value: 'cardiology' },
    { label: 'Neurology', value: 'neurology' },
    { label: 'Oncology', value: 'oncology' },
    { label: 'Orthopedics', value: 'orthopedics' },
    { label: 'General', value: 'general' }
  ];
  
  // Risk level options
  const riskLevelOptions = [
    { label: 'All Risk Levels', value: '' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' }
  ];
  
  // Admission date options
  const admissionDateOptions = [
    { label: 'All Dates', value: '' },
    { label: 'Last 24 Hours', value: '24h' },
    { label: 'Last Week', value: '1w' },
    { label: 'Last Month', value: '1m' }
  ];
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-secondary-900">Patients</h1>
        <Button>
          Export Patient List
        </Button>
      </div>
      
      {/* Search and filters */}
      <Card>
        <div className="space-y-4">
          {/* Search form */}
          <form onSubmit={handleSearch} className="flex space-x-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, ID, or diagnosis..."
                className="form-input block w-full pl-10 border-secondary-300"
              />
            </div>
            <Button type="submit">
              Search
            </Button>
          </form>
          
          {/* Filters */}
          <div>
            <div className="flex items-center mb-3">
              <FunnelIcon className="h-5 w-5 text-secondary-500 mr-2" />
              <h3 className="text-sm font-medium text-secondary-700">Filters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormSelect
                id="department"
                label="Department"
                name="department"
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
                options={departmentOptions}
              />
              
              <FormSelect
                id="risk_level"
                label="Risk Level"
                name="risk_level"
                value={filters.risk_level}
                onChange={(e) => setFilters({...filters, risk_level: e.target.value})}
                options={riskLevelOptions}
              />
              
              <FormSelect
                id="admission_date"
                label="Admission Date"
                name="admission_date"
                value={filters.admission_date}
                onChange={(e) => setFilters({...filters, admission_date: e.target.value})}
                options={admissionDateOptions}
              />
            </div>
            
            <div className="flex justify-end mt-4">
              <Button variant="secondary" onClick={resetFilters} className="mr-2">
                Reset Filters
              </Button>
              <Button onClick={refresh}>
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Patients list */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : error ? (
          <div className="bg-danger-50 p-4 text-danger-700 rounded-md">
            Error loading patients: {error}
          </div>
        ) : !patientsData?.patients?.length ? (
          <div className="text-center py-12">
            <p className="text-secondary-500 mb-4">No patients found matching your criteria</p>
            <Button variant="primary" onClick={resetFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div>
            {/* Patients count */}
            <div className="px-4 py-3 border-b border-secondary-200">
              <span className="text-sm text-secondary-700">
                Showing <span className="font-medium">{((page - 1) * pageSize) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(page * pageSize, totalItems)}
                </span>{' '}
                of <span className="font-medium">{totalItems}</span> patients
              </span>
            </div>
            
            {/* Patient list items */}
            <div className="divide-y divide-secondary-200">
              {patientsData.patients.map((patient) => (
                <PatientListItem 
                  key={patient.id} 
                  patient={patient} 
                  onClick={handlePatientClick}
                />
              ))}
            </div>
            
            {/* Pagination */}
            <div className="px-4 py-3 border-t border-secondary-200">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PatientsList;
