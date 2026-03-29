import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { Activity } from '@/types/api.types';

export async function listActivities(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/activities', { params });
  return data.data as Activity[];
}

export async function getActivity(id: string) {
  const { data } = await apiClient.get(`/activities/${id}`);
  return data.data as Activity;
}

export async function createActivity(payload: Partial<Activity> & Record<string, unknown>) {
  const { data } = await apiClient.post('/activities', payload);
  return data.data as Activity;
}

export async function updateActivity(id: string, payload: Partial<Activity> & Record<string, unknown>) {
  const { data } = await apiClient.patch(`/activities/${id}`, payload);
  return data.data as Activity;
}

export async function deleteActivity(id: string) {
  const { data } = await apiClient.delete(`/activities/${id}`);
  return data.data;
}

export async function completeActivity(id: string) {
  const { data } = await apiClient.patch(`/activities/${id}/complete`);
  return data.data as Activity;
}

// React Query hooks

export function useActivities(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => listActivities(params),
  });
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: ['activities', id],
    queryFn: () => getActivity(id),
    enabled: !!id,
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createActivity,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  });
}

export function useUpdateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: { id: string } & Partial<Activity> & Record<string, unknown>) =>
      updateActivity(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  });
}

export function useDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  });
}

export function useCompleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: completeActivity,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  });
}
