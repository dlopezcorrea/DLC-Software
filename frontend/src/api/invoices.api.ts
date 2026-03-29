import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { Invoice } from '@/types/api.types';

export async function listInvoices(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/invoices', { params });
  return data.data as Invoice[];
}

export async function getInvoice(id: string) {
  const { data } = await apiClient.get(`/invoices/${id}`);
  return data.data as Invoice;
}

export async function createInvoice(payload: Partial<Invoice> & Record<string, unknown>) {
  const { data } = await apiClient.post('/invoices', payload);
  return data.data as Invoice;
}

export async function updateInvoice(id: string, payload: Partial<Invoice> & Record<string, unknown>) {
  const { data } = await apiClient.patch(`/invoices/${id}`, payload);
  return data.data as Invoice;
}

export async function deleteInvoice(id: string) {
  const { data } = await apiClient.delete(`/invoices/${id}`);
  return data.data;
}

export async function sendInvoice(id: string, payload?: Record<string, unknown>) {
  const { data } = await apiClient.post(`/invoices/${id}/send`, payload ?? {});
  return data.data as Invoice;
}

export async function recordPayment(id: string, payload: Record<string, unknown>) {
  const { data } = await apiClient.post(`/invoices/${id}/payments`, payload);
  return data.data;
}

export async function getInvoicePayments(id: string, params?: Record<string, unknown>) {
  const { data } = await apiClient.get(`/invoices/${id}/payments`, { params });
  return data.data;
}

// React Query hooks

export function useInvoices(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => listInvoices(params),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => getInvoice(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<Invoice> & Record<string, unknown>) =>
      updateInvoice(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useSendInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      sendInvoice(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      recordPayment(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

export function useInvoicePayments(id: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['invoices', id, 'payments', params],
    queryFn: () => getInvoicePayments(id, params),
    enabled: !!id,
  });
}
