import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export async function getSummary(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/forecasting/summary', { params });
  return data.data;
}

export async function getByStage(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/forecasting/by-stage', { params });
  return data.data;
}

export async function getByUser(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/forecasting/by-user', { params });
  return data.data;
}

export async function getByPeriod(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/forecasting/by-period', { params });
  return data.data;
}

export async function getConversionRates(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/forecasting/conversion-rates', { params });
  return data.data;
}

// React Query hooks

export function useForecastSummary(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['forecasting', 'summary', params],
    queryFn: () => getSummary(params),
  });
}

export function useForecastByStage(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['forecasting', 'by-stage', params],
    queryFn: () => getByStage(params),
  });
}

export function useForecastByUser(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['forecasting', 'by-user', params],
    queryFn: () => getByUser(params),
  });
}

export function useForecastByPeriod(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['forecasting', 'by-period', params],
    queryFn: () => getByPeriod(params),
  });
}

export function useConversionRates(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['forecasting', 'conversion-rates', params],
    queryFn: () => getConversionRates(params),
  });
}
