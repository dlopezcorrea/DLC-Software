import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { Lead } from '@/types/api.types';

export async function listLeads(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/leads', { params });
  return data.data as Lead[];
}

export async function getLead(id: string) {
  const { data } = await apiClient.get(`/leads/${id}`);
  return data.data as Lead;
}

export async function createLead(payload: Partial<Lead> & Record<string, unknown>) {
  const { data } = await apiClient.post('/leads', payload);
  return data.data as Lead;
}

export async function updateLead(id: string, payload: Partial<Lead> & Record<string, unknown>) {
  const { data } = await apiClient.patch(`/leads/${id}`, payload);
  return data.data as Lead;
}

export async function deleteLead(id: string) {
  const { data } = await apiClient.delete(`/leads/${id}`);
  return data.data;
}

export async function convertLead(id: string, payload: Record<string, unknown>) {
  const { data } = await apiClient.post(`/leads/${id}/convert`, payload);
  return data.data;
}

export async function assignLead(id: string, payload: Record<string, unknown>) {
  const { data } = await apiClient.patch(`/leads/${id}/assign`, payload);
  return data.data as Lead;
}

// React Query hooks

export function useLeads(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => listLeads(params),
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: () => getLead(id),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<Lead> & Record<string, unknown>) =>
      updateLead(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteLead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useConvertLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      convertLead(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['contacts'] });
      qc.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useAssignLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      assignLead(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}
