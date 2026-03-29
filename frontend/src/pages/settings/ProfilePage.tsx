import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { PageHeader } from '@/components/common/PageHeader';
import { Save } from 'lucide-react';

const TIMEZONE_OPTIONS = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
];

interface ProfilePayload {
  firstName: string;
  lastName: string;
  phone: string;
  timezone: string;
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const orgId = useAuthStore((s) => s.orgId);

  const [form, setForm] = useState<ProfilePayload>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: '',
    timezone: 'UTC',
  });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
      }));
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: (payload: ProfilePayload) =>
      apiClient.patch('/auth/me', payload).then((r) => r.data.data),
    onSuccess: (updatedUser: any) => {
      if (accessToken && orgId) {
        setAuth(accessToken, updatedUser, orgId);
      }
      setSuccessMsg('Profile updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
  });

  const handleChange = (field: keyof ProfilePayload, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div>
      <PageHeader title="Profile" description="Manage your personal account settings" />

      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              readOnly
              value={user?.email ?? ''}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed here.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Timezone</label>
            <select
              value={form.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              Failed to update profile. Please try again.
            </p>
          )}
          {successMsg && (
            <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
              {successMsg}
            </p>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
