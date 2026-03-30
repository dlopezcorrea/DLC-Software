import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const schema = z.object({
  name: z.string().min(2).max(100),
  website: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().length(3).optional(),
});

type FormData = z.infer<typeof schema>;

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'America/Mexico_City', 'America/Bogota',
  'America/Lima', 'America/Santiago', 'America/Buenos_Aires',
  'Europe/London', 'Europe/Paris', 'Europe/Madrid', 'Asia/Tokyo',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'MXN', 'COP', 'CLP', 'ARS', 'BRL', 'PEN'];

export default function OrganizationPage() {
  const [saved, setSaved] = useState(false);
  const qc = useQueryClient();

  const { data: org, isLoading } = useQuery({
    queryKey: ['org'],
    queryFn: () => apiClient.get('/organizations/current').then(r => r.data.data),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: org ? {
      name: org.name ?? '',
      website: org.website ?? '',
      phone: org.phone ?? '',
      timezone: org.timezone ?? 'UTC',
      currency: org.currency ?? 'USD',
    } : undefined,
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => apiClient.patch('/organizations/current', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Organization Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Update your organization's information</p>
      </div>

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Organization Name</label>
          <input
            {...register('name')}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Website</label>
          <input
            {...register('website')}
            type="url"
            placeholder="https://yourcompany.com"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Phone</label>
          <input
            {...register('phone')}
            type="tel"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Timezone</label>
            <select
              {...register('timezone')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Currency</label>
            <select
              {...register('currency')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && <span className="text-sm text-green-600">Saved successfully</span>}
          {mutation.isError && <span className="text-sm text-red-600">Failed to save</span>}
        </div>
      </form>
    </div>
  );
}
