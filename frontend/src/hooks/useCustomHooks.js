import { useState, useEffect } from 'react';

// Custom hook for handling form state and validation
export const useForm = (initialValues, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form to initial values
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  // Handle input blur (for validation)
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
  };

  // Handle form submission
  const handleSubmit = (callback) => (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const touchedFields = {};
    Object.keys(values).forEach(key => {
      touchedFields[key] = true;
    });
    setTouched(touchedFields);
    
    // Validate and call callback if valid
    if (Object.keys(validate(values)).length === 0) {
      callback();
    }
  };

  // Validate on touched fields change
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  }, [values, touched, validate]);

  // Reset isSubmitting when errors change
  useEffect(() => {
    if (isSubmitting) {
      setIsSubmitting(false);
    }
  }, [errors]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues
  };
};

// Custom hook for handling pagination
export const usePagination = (initialPage = 1, initialPageSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.ceil(totalItems / pageSize);
  
  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };
  
  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  
  const goToPage = (pageNum) => {
    const page = Math.max(1, Math.min(pageNum, totalPages));
    setPage(page);
  };
  
  const changePageSize = (size) => {
    setPageSize(size);
    setPage(1); // Reset to first page
  };

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    setTotalItems,
    nextPage,
    prevPage,
    goToPage,
    changePageSize
  };
};

// Custom hook for fetching data with automatic loading/error states
export const useApiData = (fetchFunction, initialData = null, dependencies = []) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to manually trigger a refresh
  const refresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchFunction();
        if (isMounted) {
          setData(result.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('API Error:', err);
          setError(err.response?.data?.detail || 'An error occurred while fetching data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [...dependencies, refreshTrigger]);

  return { data, loading, error, refresh, setData };
};
