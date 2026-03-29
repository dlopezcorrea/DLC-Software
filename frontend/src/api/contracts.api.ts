import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { Contract } from '@/types/api.types';

export async function listContracts(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/contracts', { params });
  return data.data as Contract[];
}

export async function getContract(id: string) {
  const { data } = await apiClient.get(`/contracts/${id}`);
  return data.data as Contract;
}

export async function createContract(payload: Partial<Contract> & Record<string, unknown>) {
  const { data } = await apiClient.post('/contracts', payload);
  return data.data as Contract;
}

export async function updateContract(id: string, payload: Partial<Contract> & Record<string, unknown>) {
  const { data } = await apiClient.patch(`/contracts/${id}`, payload);
  return data.data as Contract;
}

export async function deleteContract(id: string) {
  const { data } = await apiClient.delete(`/contracts/${id}`);
  return data.data;
}

export async function activateContract(id: string) {
  const { data } = await apiClient.patch(`/contracts/${id}/activate`);
  return data.data as Contract;
}

export async function renewContract(id: string, payload?: Record<string, unknown>) {
  const { data } = await apiClient.post(`/contracts/${id}/renew`, payload ?? {});
  return data.data as Contract;
}

export async function terminateContract(id: string, payload?: Record<string, unknown>) {
  const { data } = await apiClient.patch(`/contracts/${id}/terminate`, payload ?? {});
  return data.data as Contract;
}

// React Query hooks

export function useContracts(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['contracts', params],
    queryFn: () => listContracts(params),
  });
}

export function useContract(id: string) {
  return useQuery({
    queryKey: ['contracts', id],
    queryFn: () => getContract(id),
    enabled: !!id,
  });
}

export function useCreateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createContract,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });
}

export function useUpdateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: { id: string } & Partial<Contract> & Record<string, unknown>) =>
      updateContract(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });
}

export function useDeleteContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteContract,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });
}

export function useActivateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: activateContract,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });
}

export function useRenewContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      renewContract(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });
}

export function useTerminateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      terminateContract(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });
}
