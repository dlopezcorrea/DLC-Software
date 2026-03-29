import { useForecastSummary, useForecastByStage } from '@/api/forecasting.api';
import MetricCard from '@/components/common/MetricCard';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/utils/formatters';
import { DollarSign, TrendingUp, CheckCircle2, XCircle, BarChart2 } from 'lucide-react';

export default function ForecastingPage() {
  const { data: summary, isLoading: summaryLoading } = useForecastSummary();
  const { data: byStage, isLoading: byStageLoading } = useForecastByStage();

  const stageRows = (byStage as any[]) ?? [];

  return (
    <div>
      <PageHeader
        title="Sales Forecasting"
        description="Pipeline performance and revenue predictions"
      />

      {/* Summary metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Pipeline Value"
          value={summaryLoading ? '-' : formatCurrency(summary?.totalPipelineValue ?? 0)}
          icon={DollarSign}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          subValue="All open opportunities"
          loading={summaryLoading}
        />
        <MetricCard
          title="Weighted Value"
          value={summaryLoading ? '-' : formatCurrency(summary?.weightedValue ?? 0)}
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          subValue="Probability-adjusted"
          loading={summaryLoading}
        />
        <MetricCard
          title="Won This Month"
          value={summaryLoading ? '-' : formatCurrency(summary?.wonThisMonth ?? 0)}
          icon={CheckCircle2}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          subValue="Closed and won"
          loading={summaryLoading}
        />
        <MetricCard
          title="Lost This Month"
          value={summaryLoading ? '-' : formatCurrency(summary?.lostThisMonth ?? 0)}
          icon={XCircle}
          iconColor="text-red-600"
          iconBg="bg-red-50"
          subValue="Closed and lost"
          loading={summaryLoading}
        />
      </div>

      {/* By Stage table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Opportunities by Stage</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Breakdown of open opportunities across pipeline stages
          </p>
        </div>

        {byStageLoading ? (
          <LoadingSpinner />
        ) : stageRows.length === 0 ? (
          <EmptyState
            icon={BarChart2}
            title="No stage data available"
            description="Add opportunities to your pipeline to see stage forecasts."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {['Stage', 'Pipeline', 'Count', 'Total Value', 'Weighted Value', 'Avg. Probability'].map(h => (
                    <th
                      key={h}
                      className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stageRows.map((row: any) => (
                  <tr key={row.stageId ?? row.stage} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {row.stageColor && (
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: row.stageColor }}
                          />
                        )}
                        <span className="font-medium text-slate-900">{row.stageName ?? row.stage}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{row.pipelineName ?? '-'}</td>
                    <td className="px-6 py-3 text-slate-900 font-semibold">
                      {row.count ?? 0}
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {formatCurrency(row.totalValue ?? 0)}
                    </td>
                    <td className="px-6 py-3 font-medium text-indigo-700">
                      {formatCurrency(row.weightedValue ?? 0)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-24">
                          <div
                            className="bg-indigo-500 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(row.avgProbability ?? row.probability ?? 0, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-slate-600 text-xs whitespace-nowrap">
                          {row.avgProbability ?? row.probability ?? 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Totals row */}
              {stageRows.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td className="px-6 py-3 font-semibold text-slate-900" colSpan={2}>
                      Total
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-900">
                      {stageRows.reduce((sum: number, r: any) => sum + (r.count ?? 0), 0)}
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-900">
                      {formatCurrency(
                        stageRows.reduce((sum: number, r: any) => sum + (r.totalValue ?? 0), 0)
                      )}
                    </td>
                    <td className="px-6 py-3 font-bold text-indigo-700">
                      {formatCurrency(
                        stageRows.reduce((sum: number, r: any) => sum + (r.weightedValue ?? 0), 0)
                      )}
                    </td>
                    <td className="px-6 py-3" />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
