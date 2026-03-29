import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { forgotPassword } from '@/api/auth.api';
import { CheckCircle } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      setError('');
      await forgotPassword(data.email);
      setSuccess(true);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setError(err.response?.data?.error?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo / branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">DLC CRM</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-14 h-14 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Check your email</h2>
              <p className="text-slate-500 text-sm">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
              </p>
              <Link
                to="/login"
                className="inline-block mt-2 text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Reset password</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Sending...' : 'Send reset link'}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-slate-500 hover:text-slate-700 hover:underline"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
