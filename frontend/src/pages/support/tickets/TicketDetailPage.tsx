import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { useTicket, useAddTicketComment, useChangeTicketStatus } from '@/api/tickets.api';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate, formatRelativeTime } from '@/utils/formatters';
import {
  TICKET_STATUS_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_COLORS,
} from '@/utils/constants';
import { cn } from '@/utils/cn';

const TICKET_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'WAITING_ON_CUSTOMER',
  'RESOLVED',
  'CLOSED',
];

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [replyBody, setReplyBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const { data: ticket, isLoading, isError } = useTicket(id!);
  const addComment = useAddTicketComment();
  const changeStatus = useChangeTicketStatus();

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim() || !id) return;
    addComment.mutate(
      { id, body: replyBody, isInternal },
      {
        onSuccess: () => {
          setReplyBody('');
          setIsInternal(false);
        },
      }
    );
  };

  const handleStatusChange = (newStatus: string) => {
    if (!id) return;
    changeStatus.mutate({ id, status: newStatus });
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError || !ticket) {
    return (
      <div className="text-center py-12 text-red-600 text-sm">
        Failed to load ticket details.
      </div>
    );
  }

  const t = ticket as any;
  const comments: any[] = t.comments ?? [];

  return (
    <div>
      {/* Back + Header */}
      <div className="mb-6">
        <Link
          to="/support/tickets"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-slate-500 text-sm">#{t.ticketNumber}</span>
          <h1 className="text-2xl font-bold text-slate-900">{t.subject}</h1>
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
              TICKET_PRIORITY_COLORS[t.priority] ?? 'bg-slate-100 text-slate-600'
            )}
          >
            {TICKET_PRIORITY_LABELS[t.priority] ?? t.priority}
          </span>
          <StatusBadge status={t.status} labelMap={TICKET_STATUS_LABELS} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Description + Comments */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Description */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Description</h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {t.description || <span className="text-slate-400 italic">No description provided.</span>}
            </p>
          </div>

          {/* Comments Thread */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-700">
                Comments ({comments.length})
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {comments.length === 0 ? (
                <p className="px-5 py-6 text-sm text-slate-400 text-center">
                  No comments yet. Be the first to reply.
                </p>
              ) : (
                comments.map((comment: any) => {
                  const initials =
                    ((comment.user?.firstName?.[0] ?? '') +
                      (comment.user?.lastName?.[0] ?? '')).toUpperCase() || '?';
                  return (
                    <div key={comment.id} className="px-5 py-4 flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-900">
                            {comment.user
                              ? `${comment.user.firstName} ${comment.user.lastName}`
                              : 'Unknown'}
                          </span>
                          {comment.isInternal && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                              Internal
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Form */}
            <div className="px-5 py-4 border-t border-slate-200">
              <form onSubmit={handleSubmitReply} className="flex flex-col gap-3">
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Write a reply..."
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Internal Note
                  </label>
                  <button
                    type="submit"
                    disabled={!replyBody.trim() || addComment.isPending}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {addComment.isPending ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Status
            </h3>
            <select
              value={t.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {TICKET_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {TICKET_STATUS_LABELS[s] ?? s}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Assignee
            </h3>
            {t.assignee ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                  {(t.assignee.firstName[0] + t.assignee.lastName[0]).toUpperCase()}
                </div>
                <span className="text-sm text-slate-900">
                  {t.assignee.firstName} {t.assignee.lastName}
                </span>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Unassigned</p>
            )}
          </div>

          {/* Contact */}
          {t.contact && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Contact
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {t.contact.firstName} {t.contact.lastName}
                  </p>
                  {t.contact.email && (
                    <p className="text-xs text-slate-500">{t.contact.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Account */}
          {t.account && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Account
              </h3>
              <p className="text-sm text-slate-900">{t.account.name}</p>
            </div>
          )}

          {/* SLA Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              SLA
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              {t.slaBreached && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 w-fit">
                  SLA Breached
                </span>
              )}
              <div>
                <p className="text-xs text-slate-500">First Response Due</p>
                <p className="text-slate-700">
                  {t.firstResponseDue ? formatDate(t.firstResponseDue) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Resolution Due</p>
                <p className="text-slate-700">
                  {t.resolutionDue ? formatDate(t.resolutionDue) : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Created */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Created
            </h3>
            <p className="text-sm text-slate-700">{formatDate(t.createdAt)}</p>
            <p className="text-xs text-slate-400 mt-0.5">{formatRelativeTime(t.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
