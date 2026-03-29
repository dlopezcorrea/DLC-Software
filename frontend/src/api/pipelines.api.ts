import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { Pipeline, Stage } from '@/types/api.types';

export async function listPipelines(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/pipelines', { params });
  return data.data as Pipeline[];
}

export async function getPipeline(id: string) {
  const { data } = await apiClient.get(`/pipelines/${id}`);
  return data.data as Pipeline;
}

export async function createPipeline(payload: Partial<Pipeline> & Record<string, unknown>) {
  const { data } = await apiClient.post('/pipelines', payload);
  return data.data as Pipeline;
}

export async function updatePipeline(id: string, payload: Partial<Pipeline> & Record<string, unknown>) {
  const { data } = await apiClient.patch(`/pipelines/${id}`, payload);
  return data.data as Pipeline;
}

export async function deletePipeline(id: string) {
  const { data } = await apiClient.delete(`/pipelines/${id}`);
  return data.data;
}

export async function addStage(pipelineId: string, payload: Partial<Stage> & Record<string, unknown>) {
  const { data } = await apiClient.post(`/pipelines/${pipelineId}/stages`, payload);
  return data.data as Stage;
}

export async function updateStage(
  pipelineId: string,
  stageId: string,
  payload: Partial<Stage> & Record<string, unknown>
) {
  const { data } = await apiClient.patch(`/pipelines/${pipelineId}/stages/${stageId}`, payload);
  return data.data as Stage;
}

export async function deleteStage(pipelineId: string, stageId: string) {
  const { data } = await apiClient.delete(`/pipelines/${pipelineId}/stages/${stageId}`);
  return data.data;
}

export async function reorderStages(pipelineId: string, payload: { stageIds: string[] }) {
  const { data } = await apiClient.patch(`/pipelines/${pipelineId}/stages/reorder`, payload);
  return data.data;
}

// React Query hooks

export function usePipelines(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['pipelines', params],
    queryFn: () => listPipelines(params),
  });
}

export function usePipeline(id: string) {
  return useQuery({
    queryKey: ['pipelines', id],
    queryFn: () => getPipeline(id),
    enabled: !!id,
  });
}

export function useCreatePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPipeline,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipelines'] }),
  });
}

export function useUpdatePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<Pipeline> & Record<string, unknown>) =>
      updatePipeline(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipelines'] }),
  });
}

export function useDeletePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePipeline,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipelines'] }),
  });
}

export function useAddStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, ...payload }: { pipelineId: string } & Partial<Stage> & Record<string, unknown>) =>
      addStage(pipelineId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipelines'] }),
  });
}

export function useUpdateStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      pipelineId,
      stageId,
      ...payload
    }: { pipelineId: string; stageId: string } & Partial<Stage> & Record<string, unknown>) =>
      updateStage(pipelineId, stageId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipelines'] }),
  });
}

export function useDeleteStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, stageId }: { pipelineId: string; stageId: string }) =>
      deleteStage(pipelineId, stageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipelines'] }),
  });
}

export function useReorderStages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, stageIds }: { pipelineId: string; stageIds: string[] }) =>
      reorderStages(pipelineId, { stageIds }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipelines'] }),
  });
}
