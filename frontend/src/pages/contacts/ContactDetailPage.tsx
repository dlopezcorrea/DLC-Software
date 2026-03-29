import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContact, useContactActivities } from '@/api/contacts.api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate, formatDateTime, getInitials } from '@/utils/formatters';
import {
  ArrowLeft, Mail, Phone, Building2, Briefcase, Calendar,
  Activity, FileText,
} from 'lucide-react';

type Tab = 'overview' | 'activities';

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data: contact, isLoading } = useContact(id!);
  const { data: activities, isLoading: activitiesLoading } = useContactActivities(id!, undefined);

  if (isLoading) return <LoadingSpinner />;

  if (!contact) {
    return (
      <EmptyState
        icon={FileText}
        title="Contact not found"
        description="This contact does not exist or has been deleted."
        action={
          <Link to="/contacts" className="text-sm text-indigo-600 hover:underline">
            Back to Contacts
          </Link>
        }
      />
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'activities', label: 'Activities' },
  ];

  return (
    <div>
      {/* Back button */}
      <Link
        to="/contacts"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Contacts
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
            {getInitials(contact.firstName, contact.lastName)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900">
              {contact.firstName} {contact.lastName}
            </h1>
            {contact.jobTitle && (
              <p className="text-slate-500 text-sm mt-0.5">{contact.jobTitle}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <StatusBadge status={contact.type} />
              {!contact.isActive && <StatusBadge status="INACTIVE" />}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Contact Information</h2>
            <dl className="space-y-3">
              {contact.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <dt className="text-xs text-slate-500">Email</dt>
                    <dd className="text-sm text-slate-900">
                      <a href={`mailto:${contact.email}`} className="hover:text-indigo-600">
                        {contact.email}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <dt className="text-xs text-slate-500">Phone</dt>
                    <dd className="text-sm text-slate-900">{contact.phone}</dd>
                  </div>
                </div>
              )}
              {contact.mobile && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <dt className="text-xs text-slate-500">Mobile</dt>
                    <dd className="text-sm text-slate-900">{contact.mobile}</dd>
                  </div>
                </div>
              )}
              {contact.account && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <dt className="text-xs text-slate-500">Account</dt>
                    <dd className="text-sm text-slate-900">
                      <Link
                        to={`/accounts/${contact.accountId}`}
                        className="hover:text-indigo-600"
                      >
                        {contact.account.name}
                      </Link>
                    </dd>
                  </div>
                </div>
              )}
              {contact.department && (
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <dt className="text-xs text-slate-500">Department</dt>
                    <dd className="text-sm text-slate-900">{contact.department}</dd>
                  </div>
                </div>
              )}
              {contact.source && (
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <dt className="text-xs text-slate-500">Source</dt>
                    <dd className="text-sm text-slate-900">{contact.source}</dd>
                  </div>
                </div>
              )}
            </dl>
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Additional Details</h2>
            <dl className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <dt className="text-xs text-slate-500">Created</dt>
                  <dd className="text-sm text-slate-900">{formatDateTime(contact.createdAt)}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <dt className="text-xs text-slate-500">Last Updated</dt>
                  <dd className="text-sm text-slate-900">{formatDateTime(contact.updatedAt)}</dd>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <dt className="text-xs text-slate-500 mb-1">Communication Preferences</dt>
                <div className="flex gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      contact.emailOptIn
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    Email {contact.emailOptIn ? 'Opted In' : 'Opted Out'}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      contact.smsOptIn
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    SMS {contact.smsOptIn ? 'Opted In' : 'Opted Out'}
                  </span>
                </div>
              </div>
            </dl>
          </div>
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="bg-white rounded-xl border border-slate-200">
          {activitiesLoading ? (
            <LoadingSpinner />
          ) : !activities || (activities as any[]).length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No activities yet"
              description="Activities logged for this contact will appear here."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {(activities as any[]).map((a: any) => (
                <div key={a.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{a.subject}</p>
                      {a.description && (
                        <p className="text-sm text-slate-500 mt-0.5">{a.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">{a.type}</span>
                        {a.dueAt && (
                          <span className="text-xs text-slate-400">
                            Due {formatDate(a.dueAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={a.isCompleted ? 'COMPLETED' : 'IN_PROGRESS'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
