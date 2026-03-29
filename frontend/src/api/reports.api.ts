import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export async function getRevenueReport(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/reports/revenue', { params });
  return data.data;
}

export async function getOutstandingAR(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/reports/outstanding-ar', { params });
  return data.data;
}

export async function getPaymentsReceived(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/reports/payments-received', { params });
  return data.data;
}

export async function getInvoiceAging(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/reports/invoice-aging', { params });
  return data.data;
}

export async function getRevenueByAccount(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/reports/revenue-by-account', { params });
  return data.data;
}

// React Query hooks

export function useRevenueReport(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['reports', 'revenue', params],
    queryFn: () => getRevenueReport(params),
  });
}

export function useOutstandingAR(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['reports', 'outstanding-ar', params],
    queryFn: () => getOutstandingAR(params),
  });
}

export function usePaymentsReceived(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['reports', 'payments-received', params],
    queryFn: () => getPaymentsReceived(params),
  });
}

export function useInvoiceAging(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['reports', 'invoice-aging', params],
    queryFn: () => getInvoiceAging(params),
  });
}

export function useRevenueByAccount(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['reports', 'revenue-by-account', params],
    queryFn: () => getRevenueByAccount(params),
  });
}
