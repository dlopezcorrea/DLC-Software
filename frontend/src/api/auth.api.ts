import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  orgName?: string;
  [key: string]: unknown;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  [key: string]: unknown;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export async function login(data: LoginData) {
  const { data: res } = await apiClient.post('/auth/login', data);
  return res.data as { accessToken: string; user: Record<string, unknown>; orgId: string };
}

export async function register(data: RegisterData) {
  const { data: res } = await apiClient.post('/auth/register', data);
  return res.data;
}

export async function logout() {
  const { data: res } = await apiClient.post('/auth/logout');
  return res.data;
}

export async function forgotPassword(email: string) {
  const { data: res } = await apiClient.post('/auth/forgot-password', { email });
  return res.data;
}

export async function getMe() {
  const { data: res } = await apiClient.get('/auth/me');
  return res.data;
}

export async function updateProfile(data: UpdateProfileData) {
  const { data: res } = await apiClient.patch('/auth/me', data);
  return res.data;
}

export async function changePassword(data: ChangePasswordData) {
  const { data: res } = await apiClient.patch('/auth/me/password', data);
  return res.data;
}

// React Query hooks

export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: getMe });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}
