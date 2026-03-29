import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { Opportunity } from '@/types/api.types';

export async function listOpportunities(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/opportunities', { params });
  return data.data as Opportunity[];
}

export async function getOpportunity(id: string) {
  const { data } = await apiClient.get(`/opportunities/${id}`);
  return data.data as Opportunity;
}

export async function createOpportunity(payload: Partial<Opportunity> & Record<string, unknown>) {
  const { data } = await apiClient.post('/opportunities', payload);
  return data.data as Opportunity;
}

export async function updateOpportunity(id: string, payload: Partial<Opportunity> & Record<string, unknown>) {
  const { data } = await apiClient.patch(`/opportunities/${id}`, payload);
  return data.data as Opportunity;
}

export async function deleteOpportunity(id: string) {
  const { data } = await apiClient.delete(`/opportunities/${id}`);
  return data.data;
}

export async function moveToStage(id: string, stageId: string) {
  const { data } = await apiClient.patch(`/opportunities/${id}/stage`, { stageId });
  return data.data as Opportunity;
}

export async function markAsWon(id: string) {
  const { data } = await apiClient.patch(`/opportunities/${id}/won`);
  return data.data as Opportunity;
}

export async function markAsLost(id: string, reason: string) {
  const { data } = await apiClient.patch(`/opportunities/${id}/lost`, { reason });
  return data.data as Opportunity;
}

// React Query hooks

export function useOpportunities(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['opportunities', params],
    queryFn: () => listOpportunities(params),
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ['opportunities', id],
    queryFn: () => getOpportunity(id),
    enabled: !!id,
  });
}

export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOpportunity,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  });
}

export function useUpdateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: { id: string } & Partial<Opportunity> & Record<string, unknown>) =>
      updateOpportunity(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  });
}

export function useDeleteOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteOpportunity,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  });
}

export function useMoveToStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stageId }: { id: string; stageId: string }) => moveToStage(id, stageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  });
}

export function useMarkAsWon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAsWon,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  });
}

export function useMarkAsLost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => markAsLost(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  });
}
