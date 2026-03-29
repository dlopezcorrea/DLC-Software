import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { Account } from '@/types/api.types';

export async function listAccounts(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/accounts', { params });
  return data.data as Account[];
}

export async function getAccount(id: string) {
  const { data } = await apiClient.get(`/accounts/${id}`);
  return data.data as Account;
}

export async function createAccount(payload: Partial<Account> & Record<string, unknown>) {
  const { data } = await apiClient.post('/accounts', payload);
  return data.data as Account;
}

export async function updateAccount(id: string, payload: Partial<Account> & Record<string, unknown>) {
  const { data } = await apiClient.patch(`/accounts/${id}`, payload);
  return data.data as Account;
}

export async function deleteAccount(id: string) {
  const { data } = await apiClient.delete(`/accounts/${id}`);
  return data.data;
}

export async function getAccountContacts(id: string, params?: Record<string, unknown>) {
  const { data } = await apiClient.get(`/accounts/${id}/contacts`, { params });
  return data.data;
}

export async function getAccountOpportunities(id: string, params?: Record<string, unknown>) {
  const { data } = await apiClient.get(`/accounts/${id}/opportunities`, { params });
  return data.data;
}

export async function getAccountInvoices(id: string, params?: Record<string, unknown>) {
  const { data } = await apiClient.get(`/accounts/${id}/invoices`, { params });
  return data.data;
}

// React Query hooks

export function useAccounts(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['accounts', params],
    queryFn: () => listAccounts(params),
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => getAccount(id),
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<Account> & Record<string, unknown>) =>
      updateAccount(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });
}

export function useAccountContacts(id: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['accounts', id, 'contacts', params],
    queryFn: () => getAccountContacts(id, params),
    enabled: !!id,
  });
}

export function useAccountOpportunities(id: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['accounts', id, 'opportunities', params],
    queryFn: () => getAccountOpportunities(id, params),
    enabled: !!id,
  });
}

export function useAccountInvoices(id: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['accounts', id, 'invoices', params],
    queryFn: () => getAccountInvoices(id, params),
    enabled: !!id,
  });
}
