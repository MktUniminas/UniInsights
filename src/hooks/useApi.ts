import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  apiCall: () => Promise<{ success: boolean; data: T; error?: string }>,
  dependencies: any[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall();
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || 'Erro desconhecido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na requisição');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// Helper function to get current month date range
const getCurrentMonthRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    startDate: startOfMonth.toISOString().split('T')[0],
    endDate: endOfMonth.toISOString().split('T')[0]
  };
};

// Specific hooks for different data types
export function useKPIs(filters?: {
  startDate?: string;
  endDate?: string;
  consultantIds?: string[];
  campaignIds?: string[];
}) {
  // If no filters are provided, use current month
  const shouldUseCurrentMonth = !filters?.startDate && !filters?.endDate;
  const currentMonth = shouldUseCurrentMonth ? getCurrentMonthRange() : {};
  
  const finalFilters = {
    ...filters,
    ...(shouldUseCurrentMonth ? currentMonth : {})
  };
  
  return useApi(
    () => apiService.getKPIs(finalFilters),
    [
      finalFilters.startDate, 
      finalFilters.endDate, 
      finalFilters.consultantIds?.join(','), 
      finalFilters.campaignIds?.join(',')
    ]
  );
}

export function useConsultants(includePerformance = true, filters?: {
  startDate?: string;
  endDate?: string;
}) {
  return useApi(
    () => apiService.getConsultants(includePerformance, filters),
    [includePerformance, filters?.startDate, filters?.endDate]
  );
}

export function useCampaigns(includeMetrics = true, filters?: {
  startDate?: string;
  endDate?: string;
}) {
  return useApi(
    () => apiService.getCampaigns(includeMetrics, filters),
    [includeMetrics, filters?.startDate, filters?.endDate]
  );
}

export function useDeals(filters?: {
  startDate?: string;
  endDate?: string;
  consultantId?: string;
  campaignId?: string;
  stage?: string;
  page?: number;
  limit?: number;
}) {
  return useApi(
    () => apiService.getDeals(filters),
    [
      filters?.startDate,
      filters?.endDate,
      filters?.consultantId,
      filters?.campaignId,
      filters?.stage,
      filters?.page,
      filters?.limit
    ]
  );
}

export function useSalesPrediction(months = 3, filters?: {
  startDate?: string;
  endDate?: string;
}) {
  return useApi(
    () => apiService.getSalesPrediction(months, filters),
    [months, filters?.startDate, filters?.endDate]
  );
}

export function useLossAnalysis(filters?: {
  startDate?: string;
  endDate?: string;
}) {
  return useApi(
    () => apiService.getLossAnalysis(filters),
    [filters?.startDate, filters?.endDate]
  );
}

export function useGoals(consultantId?: string) {
  return useApi(
    () => apiService.getGoals(consultantId),
    [consultantId]
  );
}