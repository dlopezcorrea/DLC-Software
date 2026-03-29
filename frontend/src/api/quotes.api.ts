import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { Quote } from '@/types/api.types';

export async function listQuotes(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/quotes', { params });
  return data.data as Quote[];
}

export async function getQuote(id: string) {
  const { data } = await apiClient.get(`/quotes/${id}`);
  return data.data as Quote;
}

export async function createQuote(payload: Partial<Quote> & Record<string, unknown>) {
  const { data } = await apiClient.post('/quotes', payload);
  return data.data as Quote;
}

export async function updateQuote(id: string, payload: Partial<Quote> & Record<string, unknown>) {
  const { data } = await apiClient.patch(`/quotes/${id}`, payload);
  return data.data as Quote;
}

export async function deleteQuote(id: string) {
  const { data } = await apiClient.delete(`/quotes/${id}`);
  return data.data;
}

export async function sendQuote(id: string, email: string) {
  const { data } = await apiClient.post(`/quotes/${id}/send`, { email });
  return data.data as Quote;
}

export async function acceptQuote(id: string) {
  const { data } = await apiClient.patch(`/quotes/${id}/accept`);
  return data.data as Quote;
}

export async function rejectQuote(id: string) {
  const { data } = await apiClient.patch(`/quotes/${id}/reject`);
  return data.data as Quote;
}

export async function convertToInvoice(id: string) {
  const { data } = await apiClient.post(`/quotes/${id}/convert-to-invoice`);
  return data.data;
}

// React Query hooks

export function useQuotes(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['quotes', params],
    queryFn: () => listQuotes(params),
  });
}

export function useQuote(id: string) {
  return useQuery({
    queryKey: ['quotes', id],
    queryFn: () => getQuote(id),
    enabled: !!id,
  });
}

export function useCreateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createQuote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }),
  });
}

export function useUpdateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<Quote> & Record<string, unknown>) =>
      updateQuote(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }),
  });
}

export function useDeleteQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteQuote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }),
  });
}

export function useSendQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) => sendQuote(id, email),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }),
  });
}

export function useAcceptQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: acceptQuote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }),
  });
}

export function useRejectQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rejectQuote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }),
  });
}

export function useConvertToInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: convertToInvoice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotes'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
