import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">DLC CRM</h1>
          <p className="text-slate-500 mt-1">Customer Relationship Management</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
