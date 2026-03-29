import { useState } from 'react';
import { usePipelines } from '@/api/pipelines.api';
import { useOpportunities } from '@/api/opportunities.api';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import { Kanban, ChevronDown, TrendingUp } from 'lucide-react';
import type { Pipeline, Stage } from '@/types/api.types';

export default function PipelinesPage() {
  const { data: pipelines, isLoading: pipelinesLoading } = usePipelines();
  const pipelineList = (pipelines as Pipeline[]) ?? [];

  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');

  // Determine active pipeline
  const activePipeline =
    pipelineList.find(p => p.id === selectedPipelineId) ??
    pipelineList.find(p => p.isDefault) ??
    pipelineList[0];

  const { data: opportunities, isLoading: oppsLoading } = useOpportunities(
    activePipeline ? { pipelineId: activePipeline.id, status: 'OPEN' } : undefined
  );
  const oppList = (opportunities as any[]) ?? [];

  if (pipelinesLoading) return <LoadingSpinner />;

  if (pipelineList.length === 0) {
    return (
      <div>
        <PageHeader title="Pipeline" description="Visualize your deals in a Kanban view" />
        <EmptyState
          icon={Kanban}
          title="No pipelines configured"
          description="Create a pipeline to start managing your deals visually."
        />
      </div>
    );
  }

  // Sort stages by order
  const stages: Stage[] = activePipeline
    ? [...activePipeline.stages].sort((a, b) => a.order - b.order)
    : [];

  // Group opportunities by stage
  const oppsByStage = stages.reduce<Record<string, any[]>>((acc, stage) => {
    acc[stage.id] = oppList.filter((o: any) => o.stageId === stage.id);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Pipeline"
        description="Visualize your deals in a Kanban view"
        action={
          pipelineList.length > 1 ? (
            <div className="relative">
              <select
                value={activePipeline?.id ?? ''}
                onChange={e => setSelectedPipelineId(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {pipelineList.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          ) : undefined
        }
      />

      {/* Pipeline info bar */}
      {activePipeline && (
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-base font-semibold text-slate-900">{activePipeline.name}</h2>
          {activePipeline.description && (
            <p className="text-sm text-slate-500">{activePipeline.description}</p>
          )}
          <span className="text-xs text-slate-400 ml-auto">
            Currency: {activePipeline.currency}
          </span>
        </div>
      )}

      {oppsLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {stages.map(stage => {
            const stageOpps = oppsByStage[stage.id] ?? [];
            const stageTotal = stageOpps.reduce((sum: number, o: any) => sum + (o.value ?? 0), 0);

            return (
              <div
                key={stage.id}
                className="flex flex-col shrink-0 w-72"
              >
                {/* Column header */}
                <div
                  className="rounded-t-lg px-3 py-2.5 mb-2"
                  style={{ backgroundColor: stage.color ? `${stage.color}20` : '#f1f5f9' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: stage.color || '#94a3b8' }}
                      />
                      <span className="text-sm font-semibold text-slate-800 truncate">
                        {stage.name}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium ml-2 shrink-0">
                      {stage.probability}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-500">
                      {stageOpps.length} deal{stageOpps.length !== 1 ? 's' : ''}
                    </span>
                    {stageTotal > 0 && (
                      <span className="text-xs font-medium text-slate-700">
                        {formatCurrency(stageTotal)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Opportunity cards */}
                <div className="flex flex-col gap-2 flex-1">
                  {stageOpps.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-slate-200 p-4 flex items-center justify-center">
                      <p className="text-xs text-slate-400">No deals</p>
                    </div>
                  ) : (
                    stageOpps.map((opp: any) => (
                      <div
                        key={opp.id}
                        className={cn(
                          'bg-white rounded-lg border border-slate-200 p-3 hover:shadow-md transition-shadow cursor-pointer',
                          opp.status === 'WON' && 'border-green-300 bg-green-50',
                          opp.status === 'LOST' && 'border-red-200 bg-red-50 opacity-75'
                        )}
                      >
                        <p className="text-sm font-semibold text-slate-900 truncate">{opp.name}</p>
                        {opp.account?.name && (
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{opp.account.name}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-indigo-600">
                            {formatCurrency(opp.value, opp.currency)}
                          </span>
                          {opp.assignee && (
                            <span
                              className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0"
                              title={`${opp.assignee.firstName} ${opp.assignee.lastName}`}
                            >
                              {opp.assignee.firstName[0]}
                              {opp.assignee.lastName[0]}
                            </span>
                          )}
                        </div>
                        {opp.expectedCloseDate && (
                          <p className="text-xs text-slate-400 mt-1.5">
                            Close: {new Date(opp.expectedCloseDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}

          {stages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={TrendingUp}
                title="No stages configured"
                description="Add stages to this pipeline to start tracking deals."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
