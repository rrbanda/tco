import { CheckCircle, AlertTriangle, XCircle, Info, TrendingUp } from 'lucide-react';
import { HealthBadge } from '../components/HealthBadge';
import { BenchmarkGauge } from '../components/Charts';
import type { AnalysisReport } from '../lib/types';
import { BENCHMARKS } from '../lib/calculator';
import clsx from 'clsx';

interface BenchmarksProps {
  report: AnalysisReport;
}

interface BenchmarkRowProps {
  metric: string;
  currentValue: number;
  healthyRange: string;
  warningRange: string;
  criticalThreshold: string;
  status: 'healthy' | 'warning' | 'critical';
  format?: (v: number) => string;
}

function BenchmarkRow({
  metric,
  currentValue,
  healthyRange,
  warningRange,
  criticalThreshold,
  status,
  format,
}: BenchmarkRowProps) {
  const StatusIcon = {
    healthy: CheckCircle,
    warning: AlertTriangle,
    critical: XCircle,
  }[status];

  const statusColors = {
    healthy: 'text-green-600 bg-green-50',
    warning: 'text-yellow-600 bg-yellow-50',
    critical: 'text-red-600 bg-red-50',
  };

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-4 px-6">
        <span className="font-medium text-slate-900">{metric}</span>
      </td>
      <td className="py-4 px-6">
        <span className="font-mono text-lg font-semibold text-slate-900">
          {format ? format(currentValue) : currentValue.toFixed(1)}
        </span>
      </td>
      <td className="py-4 px-6 text-sm text-green-700">{healthyRange}</td>
      <td className="py-4 px-6 text-sm text-yellow-700">{warningRange}</td>
      <td className="py-4 px-6 text-sm text-red-700">{criticalThreshold}</td>
      <td className="py-4 px-6">
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
            statusColors[status]
          )}
        >
          <StatusIcon className="w-4 h-4" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </td>
    </tr>
  );
}

export function Benchmarks({ report }: BenchmarksProps) {
  const { healthMetrics, costBreakdown, summary } = report;
  const thresholds = BENCHMARKS.healthThresholds;

  const getCookbookRatioStatus = (): 'healthy' | 'warning' | 'critical' => {
    if (healthMetrics.cookbookRatio > thresholds.cookbookRatio.critical) return 'critical';
    if (healthMetrics.cookbookRatio > thresholds.cookbookRatio.healthy) return 'warning';
    return 'healthy';
  };

  const getFteEfficiencyStatus = (): 'healthy' | 'warning' | 'critical' => {
    if (healthMetrics.cookbooksPerFte < thresholds.cookbooksPerFte.critical) return 'critical';
    if (healthMetrics.cookbooksPerFte < thresholds.cookbooksPerFte.healthy) return 'warning';
    return 'healthy';
  };

  const getDebtMultiplierStatus = (): 'healthy' | 'warning' | 'critical' => {
    if (healthMetrics.debtMultiplier > 1.5) return 'critical';
    if (healthMetrics.debtMultiplier > 1.0) return 'warning';
    return 'healthy';
  };

  const perNodeCostStatus = (): 'healthy' | 'warning' | 'critical' => {
    if (summary.perNodeCost > 200) return 'critical';
    if (summary.perNodeCost > 100) return 'warning';
    return 'healthy';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Benchmark Analysis</h1>
          <p className="text-slate-600 mt-1">
            Compare your infrastructure against industry standards
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Overall Health:</span>
          <HealthBadge score={healthMetrics.healthScore} size="lg" />
        </div>
      </div>

      {/* Visual Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <BenchmarkGauge
            value={healthMetrics.cookbookRatio}
            min={0}
            max={200}
            thresholds={{ healthy: 25, warning: 100 }}
            label="Cookbook Ratio (per 1K nodes)"
          />
        </div>
        <div className="card">
          <BenchmarkGauge
            value={healthMetrics.cookbooksPerFte}
            min={0}
            max={300}
            thresholds={{ healthy: 150, warning: 75 }}
            label="Cookbooks per FTE"
          />
        </div>
        <div className="card">
          <BenchmarkGauge
            value={healthMetrics.debtMultiplier}
            min={1}
            max={3}
            thresholds={{ healthy: 1.1, warning: 1.5 }}
            label="Technical Debt Multiplier"
            format={(v) => `${v.toFixed(2)}x`}
          />
        </div>
        <div className="card">
          <BenchmarkGauge
            value={summary.perNodeCost}
            min={0}
            max={300}
            thresholds={{ healthy: 100, warning: 200 }}
            label="Cost per Node"
            format={(v) => `$${v.toFixed(0)}`}
          />
        </div>
      </div>

      {/* Benchmark Table */}
      <div className="card overflow-hidden">
        <h2 className="text-lg font-semibold text-slate-900 p-6 pb-4">
          Detailed Benchmark Comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-semibold text-slate-600">
                  Metric
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-slate-600">
                  Your Value
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-green-700">
                  Healthy
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-yellow-700">
                  Warning
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-red-700">
                  Critical
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-slate-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              <BenchmarkRow
                metric="Cookbooks per 1,000 Nodes"
                currentValue={healthMetrics.cookbookRatio}
                healthyRange="< 25"
                warningRange="25 - 100"
                criticalThreshold="> 100"
                status={getCookbookRatioStatus()}
              />
              <BenchmarkRow
                metric="Cookbooks per FTE"
                currentValue={healthMetrics.cookbooksPerFte}
                healthyRange="> 150"
                warningRange="75 - 150"
                criticalThreshold="< 75"
                status={getFteEfficiencyStatus()}
              />
              <BenchmarkRow
                metric="Technical Debt Multiplier"
                currentValue={healthMetrics.debtMultiplier}
                healthyRange="1.0x"
                warningRange="1.1 - 1.5x"
                criticalThreshold="> 1.5x"
                status={getDebtMultiplierStatus()}
                format={(v) => `${v.toFixed(2)}x`}
              />
              <BenchmarkRow
                metric="Cost per Node (Annual)"
                currentValue={summary.perNodeCost}
                healthyRange="< $100"
                warningRange="$100 - $200"
                criticalThreshold="> $200"
                status={perNodeCostStatus()}
                format={(v) => `$${v.toFixed(0)}`}
              />
              <BenchmarkRow
                metric="Labor % of TCO"
                currentValue={(costBreakdown.laborCosts / costBreakdown.totalAnnualTco) * 100}
                healthyRange="< 40%"
                warningRange="40 - 60%"
                criticalThreshold="> 60%"
                status={
                  (costBreakdown.laborCosts / costBreakdown.totalAnnualTco) > 0.6
                    ? 'critical'
                    : (costBreakdown.laborCosts / costBreakdown.totalAnnualTco) > 0.4
                    ? 'warning'
                    : 'healthy'
                }
                format={(v) => `${v.toFixed(0)}%`}
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Debt Multiplier Scale */}
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          Technical Debt Multiplier Scale
        </h2>
        <p className="text-slate-600 mb-6">
          The debt multiplier increases labor costs based on cookbook complexity. Higher cookbook
          ratios indicate more fragmentation and technical debt, requiring more effort to maintain.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {BENCHMARKS.debtMultipliers.map((level, index) => {
            const prevThreshold = index > 0 ? BENCHMARKS.debtMultipliers[index - 1].threshold : 0;
            const isActive =
              healthMetrics.cookbookRatio > prevThreshold &&
              healthMetrics.cookbookRatio <= level.threshold;
            
            const colorClass =
              level.multiplier <= 1.0
                ? 'bg-green-50 border-green-200'
                : level.multiplier <= 1.25
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200';

            return (
              <div
                key={index}
                className={clsx(
                  'p-4 rounded-lg border-2 text-center transition-all',
                  isActive ? 'ring-2 ring-primary-500 ring-offset-2' : '',
                  colorClass
                )}
              >
                <p className="text-2xl font-bold text-slate-900">{level.multiplier}x</p>
                <p className="text-sm text-slate-600 mt-1">
                  {level.threshold === Infinity
                    ? `> ${BENCHMARKS.debtMultipliers[index - 1]?.threshold || 500}`
                    : `≤ ${level.threshold}`}
                </p>
                <p className="text-xs text-slate-500 mt-1">per 1K nodes</p>
                {isActive && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                    Current
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Industry Context */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 text-white">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Industry Context</h3>
            <p className="text-slate-300 mt-1">
              These benchmarks are derived from Chef documentation, enterprise case studies, and
              2025-2026 market data.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-slate-300 text-sm">Typical Enterprise</p>
            <p className="text-xl font-semibold mt-1">5-25 cookbooks per 1K nodes</p>
            <p className="text-sm text-slate-400 mt-2">
              Well-governed with consolidated wrapper cookbooks
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-slate-300 text-sm">Healthy FTE Ratio</p>
            <p className="text-xl font-semibold mt-1">150-250 cookbooks per FTE</p>
            <p className="text-sm text-slate-400 mt-2">
              Balanced workload with automation
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-slate-300 text-sm">Target TCO per Node</p>
            <p className="text-xl font-semibold mt-1">$75-150 per year</p>
            <p className="text-sm text-slate-400 mt-2">
              Including all labor and infrastructure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
