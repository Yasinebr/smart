import { useState, useEffect, useCallback } from 'react';

// A generic hook to handle API requests
const useApi = (apiFunction, immediate = false, initialParams = null) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to execute the API call
  const execute = useCallback(async (params = initialParams) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(params);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, initialParams]);

  // Execute the API call on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      execute(initialParams);
    }
  }, [execute, immediate, initialParams]);

  // Reset the state
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, error, loading, execute, reset };
};

export default useApi;