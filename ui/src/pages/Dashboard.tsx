import {
  Server,
  BookOpen,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { HealthBadge } from '../components/HealthBadge';
import { TCOPieChart, NPVComparisonChart } from '../components/Charts';
import type { AnalysisReport } from '../lib/types';
import { formatCurrency, formatNumber } from '../lib/calculator';

interface DashboardProps {
  report: AnalysisReport;
  onNavigate: (tab: 'scenarios' | 'benchmarks' | 'report') => void;
}

export function Dashboard({ report, onNavigate }: DashboardProps) {
  const { summary, healthMetrics, costBreakdown, scenarios, recommendations } = report;
  const bestScenario = scenarios[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">TCO Analysis Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Comprehensive cost analysis for your Chef infrastructure
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Infrastructure Health:</span>
          <HealthBadge score={healthMetrics.healthScore} size="lg" />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Annual TCO"
          value={formatCurrency(summary.annualTco, true)}
          subtitle={`${formatCurrency(summary.perNodeCost)} per node`}
          icon={DollarSign}
        />
        <StatCard
          title="Managed Nodes"
          value={formatNumber(summary.totalNodes)}
          subtitle={`${formatNumber(report.costBreakdown.laborCosts / (report.perUnitCosts.perFte || 1))} FTEs`}
          icon={Server}
        />
        <StatCard
          title="Active Cookbooks"
          value={formatNumber(summary.activeCookbooks)}
          subtitle={`${healthMetrics.cookbookRatio.toFixed(1)} per 1K nodes`}
          icon={BookOpen}
          status={healthMetrics.cookbookRatio > 100 ? 'critical' : healthMetrics.cookbookRatio > 25 ? 'warning' : 'healthy'}
        />
        <StatCard
          title="Debt Multiplier"
          value={`${healthMetrics.debtMultiplier.toFixed(2)}x`}
          subtitle={`${formatCurrency(costBreakdown.technicalDebtTax, true)} annual tax`}
          icon={TrendingUp}
          status={healthMetrics.debtMultiplier > 1.5 ? 'critical' : healthMetrics.debtMultiplier > 1.0 ? 'warning' : 'healthy'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Cost Breakdown</h2>
            <span className="text-sm text-slate-500">Annual TCO: {formatCurrency(summary.annualTco, true)}</span>
          </div>
          <TCOPieChart data={costBreakdown} />
        </div>

        {/* Scenario Comparison */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Migration Scenarios</h2>
            <button
              onClick={() => onNavigate('scenarios')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              View Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <NPVComparisonChart scenarios={scenarios} />
        </div>
      </div>

      {/* Best Scenario Highlight */}
      {bestScenario && bestScenario.npv3Year > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Recommended: {bestScenario.name}
                </h3>
                <p className="text-slate-600 mt-1">
                  Highest 3-year NPV with {bestScenario.riskScore} risk profile
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 lg:gap-12">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(bestScenario.npv3Year, true)}
                </p>
                <p className="text-sm text-slate-500">3-Year NPV</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {bestScenario.breakEvenMonths?.toFixed(0) || 'N/A'} mo
                </p>
                <p className="text-sm text-slate-500">Breakeven</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {bestScenario.savingsPercent.toFixed(0)}%
                </p>
                <p className="text-sm text-slate-500">3-Year Savings</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health Issues & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Issues */}
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Health Issues</h2>
          {healthMetrics.issues.length > 0 ? (
            <div className="space-y-3">
              {healthMetrics.issues.map((issue, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">{issue}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">
                No critical issues detected. Your infrastructure is healthy.
              </p>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recommendations</h2>
          <div className="space-y-3">
            {recommendations.slice(0, 4).map((rec, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
              >
                <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {index + 1}
                </span>
                <p className="text-sm text-slate-700">{rec}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate('report')}
            className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            View Full Report <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-slate-900 rounded-xl p-6 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-slate-400 text-sm">Cost per Cookbook</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(summary.perCookbookCost)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Cookbooks per FTE</p>
            <p className="text-2xl font-bold mt-1">{healthMetrics.cookbooksPerFte.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Labor % of TCO</p>
            <p className="text-2xl font-bold mt-1">
              {((costBreakdown.laborCosts / costBreakdown.totalAnnualTco) * 100).toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">3-Year Current TCO</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(summary.annualTco * 3, true)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
