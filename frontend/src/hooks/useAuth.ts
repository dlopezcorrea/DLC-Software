import { useAuthStore } from '@/store/authStore';
import { login, logout } from '@/api/auth.api';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const { user, orgId, setAuth, clearAuth, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogin(email: string, password: string) {
    const result = await login({ email, password });
    setAuth(result.accessToken, result.user as Parameters<typeof setAuth>[1], result.orgId);
    navigate('/');
  }

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Proceed with local logout even if the server request fails
    }
    clearAuth();
    navigate('/login');
  }

  return { user, orgId, isAuthenticated, handleLogin, handleLogout };
}
