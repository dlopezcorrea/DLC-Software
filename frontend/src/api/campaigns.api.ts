import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { Campaign } from '@/types/api.types';

export async function listCampaigns(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/campaigns', { params });
  return data.data as Campaign[];
}

export async function getCampaign(id: string) {
  const { data } = await apiClient.get(`/campaigns/${id}`);
  return data.data as Campaign;
}

export async function createCampaign(payload: Partial<Campaign> & Record<string, unknown>) {
  const { data } = await apiClient.post('/campaigns', payload);
  return data.data as Campaign;
}

export async function updateCampaign(id: string, payload: Partial<Campaign> & Record<string, unknown>) {
  const { data } = await apiClient.patch(`/campaigns/${id}`, payload);
  return data.data as Campaign;
}

export async function deleteCampaign(id: string) {
  const { data } = await apiClient.delete(`/campaigns/${id}`);
  return data.data;
}

export async function scheduleCampaign(id: string, payload: Record<string, unknown>) {
  const { data } = await apiClient.post(`/campaigns/${id}/schedule`, payload);
  return data.data as Campaign;
}

export async function sendNow(id: string) {
  const { data } = await apiClient.post(`/campaigns/${id}/send`);
  return data.data as Campaign;
}

export async function pauseCampaign(id: string) {
  const { data } = await apiClient.patch(`/campaigns/${id}/pause`);
  return data.data as Campaign;
}

export async function cancelCampaign(id: string) {
  const { data } = await apiClient.patch(`/campaigns/${id}/cancel`);
  return data.data as Campaign;
}

export async function getCampaignAnalytics(id: string, params?: Record<string, unknown>) {
  const { data } = await apiClient.get(`/campaigns/${id}/analytics`, { params });
  return data.data;
}

// React Query hooks

export function useCampaigns(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: () => listCampaigns(params),
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => getCampaign(id),
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: { id: string } & Partial<Campaign> & Record<string, unknown>) =>
      updateCampaign(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}

export function useScheduleCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      scheduleCampaign(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}

export function useSendNow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sendNow,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}

export function usePauseCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: pauseCampaign,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}

export function useCancelCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelCampaign,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}

export function useCampaignAnalytics(id: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['campaigns', id, 'analytics', params],
    queryFn: () => getCampaignAnalytics(id, params),
    enabled: !!id,
  });
}
