import { useState, useCallback } from 'react';
import api from '@/services/api';
import { ApiResponse } from '@/types';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (
    request: () => Promise<ApiResponse<T>>,
    options?: UseApiOptions<T>
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await request();
      setData(response.data);
      options?.onSuccess?.(response.data);
      return response.data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options?.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, isLoading, error, execute, reset };
}