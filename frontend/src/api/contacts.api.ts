import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { Contact } from '@/types/api.types';

export async function listContacts(params?: Record<string, unknown>) {
  const { data } = await apiClient.get('/contacts', { params });
  return data.data as Contact[];
}

export async function getContact(id: string) {
  const { data } = await apiClient.get(`/contacts/${id}`);
  return data.data as Contact;
}

export async function createContact(payload: Partial<Contact> & Record<string, unknown>) {
  const { data } = await apiClient.post('/contacts', payload);
  return data.data as Contact;
}

export async function updateContact(id: string, payload: Partial<Contact> & Record<string, unknown>) {
  const { data } = await apiClient.patch(`/contacts/${id}`, payload);
  return data.data as Contact;
}

export async function deleteContact(id: string) {
  const { data } = await apiClient.delete(`/contacts/${id}`);
  return data.data;
}

export async function importContacts(payload: Record<string, unknown>) {
  const { data } = await apiClient.post('/contacts/import', payload);
  return data.data;
}

export async function getContactActivities(id: string, params?: Record<string, unknown>) {
  const { data } = await apiClient.get(`/contacts/${id}/activities`, { params });
  return data.data;
}

// React Query hooks

export function useContacts(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => listContacts(params),
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => getContact(id),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createContact,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<Contact> & Record<string, unknown>) =>
      updateContact(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteContact,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useImportContacts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: importContacts,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useContactActivities(id: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['contacts', id, 'activities', params],
    queryFn: () => getContactActivities(id, params),
    enabled: !!id,
  });
}
