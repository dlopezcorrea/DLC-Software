import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { Ticket } from '@/types/api.types';

export async function listTickets(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/tickets', { params });
  return data.data as Ticket[];
}

export async function getTicket(id: string) {
  const { data } = await apiClient.get(`/tickets/${id}`);
  return data.data as Ticket;
}

export async function createTicket(payload: Partial<Ticket> & Record<string, unknown>) {
  const { data } = await apiClient.post('/tickets', payload);
  return data.data as Ticket;
}

export async function updateTicket(id: string, payload: Partial<Ticket> & Record<string, unknown>) {
  const { data } = await apiClient.patch(`/tickets/${id}`, payload);
  return data.data as Ticket;
}

export async function deleteTicket(id: string) {
  const { data } = await apiClient.delete(`/tickets/${id}`);
  return data.data;
}

export async function assignTicket(id: string, payload: Record<string, unknown>) {
  const { data } = await apiClient.patch(`/tickets/${id}/assign`, payload);
  return data.data as Ticket;
}

export async function changeStatus(id: string, payload: Record<string, unknown>) {
  const { data } = await apiClient.patch(`/tickets/${id}/status`, payload);
  return data.data as Ticket;
}

export async function addComment(id: string, payload: Record<string, unknown>) {
  const { data } = await apiClient.post(`/tickets/${id}/comments`, payload);
  return data.data;
}

export async function getTicketStats(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/tickets/stats', { params });
  return data.data;
}

// React Query hooks

export function useTickets(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: () => listTickets(params),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => getTicket(id),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<Ticket> & Record<string, unknown>) =>
      updateTicket(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  });
}

export function useDeleteTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTicket,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  });
}

export function useAssignTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      assignTicket(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  });
}

export function useChangeTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      changeStatus(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  });
}

export function useAddTicketComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      addComment(id, payload),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ['tickets', variables.id] }),
  });
}

export function useTicketStats(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['tickets', 'stats', params],
    queryFn: () => getTicketStats(params),
  });
}
