import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/api/client';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm: z.string().min(1, 'Please confirm your password'),
}).refine(d => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    try {
      setError('');
      await apiClient.post('/auth/reset-password', { token, password: data.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (e: any) {
      setError(e.response?.data?.error?.message ?? 'Reset failed. The link may have expired.');
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Invalid Link</h2>
        <p className="text-slate-500 text-sm">This reset link is invalid or has expired.</p>
        <Link to="/forgot-password" className="text-indigo-600 text-sm hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Password updated</h2>
        <p className="text-slate-500 text-sm">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Set new password</h2>
        <p className="text-slate-500 text-sm mt-1">Enter your new password below</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">New Password</label>
        <input
          {...register('password')}
          type="password"
          placeholder="••••••••"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Confirm Password</label>
        <input
          {...register('confirm')}
          type="password"
          placeholder="••••••••"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.confirm && <p className="text-red-500 text-xs">{errors.confirm.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Updating...' : 'Update Password'}
      </button>

      <p className="text-center text-sm text-slate-500">
        <Link to="/login" className="text-indigo-600 hover:underline">Back to login</Link>
      </p>
    </form>
  );
}
