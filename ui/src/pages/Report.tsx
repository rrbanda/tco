import { 
  Download, 
  Printer, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Server,
  BookOpen,
} from 'lucide-react';
import { HealthBadge } from '../components/HealthBadge';
import { TCOPieChart, CostBreakdownBarChart } from '../components/Charts';
import type { AnalysisReport } from '../lib/types';
import { formatCurrency, formatNumber } from '../lib/calculator';
import clsx from 'clsx';

interface ReportProps {
  report: AnalysisReport;
}

export function Report({ report }: ReportProps) {
  const { summary, healthMetrics, costBreakdown, scenarios, recommendations } = report;
  const bestScenario = scenarios[0];
  const current3Year = summary.annualTco * 3;

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chef-tco-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Executive Report</h1>
          <p className="text-slate-600 mt-1">
            Comprehensive TCO analysis and recommendations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button onClick={handleExport} className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Report Header (for print) */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 text-white print:rounded-none">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Chef Infrastructure TCO Analysis</h2>
            <p className="text-slate-300">
              Generated on {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          <div>
            <p className="text-slate-400 text-sm uppercase">Total Nodes</p>
            <p className="text-3xl font-bold mt-1">{formatNumber(summary.totalNodes)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm uppercase">Annual TCO</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(summary.annualTco, true)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm uppercase">Cost per Node</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(summary.perNodeCost)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm uppercase">Health Status</p>
            <div className="mt-2">
              <HealthBadge score={healthMetrics.healthScore} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Findings */}
      <div className="card">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Key Findings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Server className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Infrastructure</p>
              <p className="text-lg font-semibold text-slate-900">{formatNumber(summary.totalNodes)} nodes</p>
              <p className="text-sm text-slate-600 mt-1">
                Across {Math.round(summary.totalNodes * 0.75 / 1000)}K production
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Cookbook Sprawl</p>
              <p className="text-lg font-semibold text-slate-900">
                {healthMetrics.cookbookRatio.toFixed(1)} per 1K nodes
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {healthMetrics.cookbookRatio > 25 ? 'Exceeds healthy threshold' : 'Within healthy range'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Technical Debt</p>
              <p className="text-lg font-semibold text-slate-900">{healthMetrics.debtMultiplier.toFixed(2)}x multiplier</p>
              <p className="text-sm text-slate-600 mt-1">
                {formatCurrency(costBreakdown.technicalDebtTax, true)}/year overhead
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Potential Savings</p>
              <p className="text-lg font-semibold text-slate-900">
                {formatCurrency(Math.max(0, bestScenario?.npv3Year || 0), true)}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                3-year NPV with {bestScenario?.platform}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Annual Cost Distribution</h3>
          <TCOPieChart data={costBreakdown} />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Cost by Category</h3>
          <CostBreakdownBarChart data={costBreakdown} />
        </div>
      </div>

      {/* Detailed Cost Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Annual Cost Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-slate-600">Category</th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-slate-600">Amount</th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-slate-600">% of Total</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-slate-600">Type</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Software Licensing', value: costBreakdown.licensingCost, type: 'Direct' },
                { name: 'Infrastructure', value: costBreakdown.infrastructureCost, type: 'Direct' },
                { name: 'Platform Team Labor', value: costBreakdown.platformLaborCost, type: 'Labor' },
                { name: 'Distributed Team Labor', value: costBreakdown.distributedLaborCost, type: 'Labor' },
                { name: 'Incident Response', value: costBreakdown.incidentCost, type: 'Labor' },
                { name: 'Technical Debt Tax', value: costBreakdown.technicalDebtTax, type: 'Hidden' },
                { name: 'Training', value: costBreakdown.trainingCost, type: 'Other' },
                { name: 'Contractors', value: costBreakdown.contractorCost, type: 'Other' },
                { name: 'Opportunity Cost', value: costBreakdown.opportunityCost, type: 'Hidden' },
              ].map((item, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="py-3 px-4 text-slate-900">{item.name}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {formatCurrency(item.value)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    {((item.value / costBreakdown.totalAnnualTco) * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4">
                    <span className={clsx(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      item.type === 'Direct' && 'bg-blue-100 text-blue-800',
                      item.type === 'Labor' && 'bg-green-100 text-green-800',
                      item.type === 'Hidden' && 'bg-red-100 text-red-800',
                      item.type === 'Other' && 'bg-purple-100 text-purple-800'
                    )}>
                      {item.type}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-900 text-white font-semibold">
                <td className="py-3 px-4">TOTAL ANNUAL TCO</td>
                <td className="py-3 px-4 text-right font-mono tabular-nums">
                  {formatCurrency(costBreakdown.totalAnnualTco)}
                </td>
                <td className="py-3 px-4 text-right">100%</td>
                <td className="py-3 px-4"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Scenario Comparison */}
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Migration Scenario Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-slate-600">Scenario</th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-slate-600">Migration</th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-slate-600">3-Year TCO</th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-slate-600">Savings</th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-slate-600">NPV</th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-slate-600">Breakeven</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-slate-600">Risk</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 bg-slate-50">
                <td className="py-3 px-4 font-medium text-slate-900">Current (Chef)</td>
                <td className="py-3 px-4 text-right">$0</td>
                <td className="py-3 px-4 text-right font-mono tabular-nums">
                  {formatCurrency(current3Year)}
                </td>
                <td className="py-3 px-4 text-right text-slate-500">Baseline</td>
                <td className="py-3 px-4 text-right text-slate-500">Baseline</td>
                <td className="py-3 px-4 text-right text-slate-500">—</td>
                <td className="py-3 px-4 text-center">
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                    LOW
                  </span>
                </td>
              </tr>
              {scenarios.map((scenario, index) => (
                <tr key={scenario.platform} className={clsx('border-b border-slate-100', index === 0 && 'bg-green-50/50')}>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-900">{scenario.name}</span>
                    {index === 0 && (
                      <span className="ml-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs">
                        Recommended
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {formatCurrency(scenario.migrationCost, true)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {formatCurrency(scenario.threeYearTotal, true)}
                  </td>
                  <td className={clsx('py-3 px-4 text-right font-medium', scenario.savingsPercent > 0 ? 'text-green-600' : 'text-red-600')}>
                    {scenario.savingsPercent > 0 ? '+' : ''}{scenario.savingsPercent.toFixed(1)}%
                  </td>
                  <td className={clsx('py-3 px-4 text-right font-mono tabular-nums', scenario.npv3Year > 0 ? 'text-green-600' : 'text-red-600')}>
                    {formatCurrency(scenario.npv3Year, true)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {scenario.breakEvenMonths ? `${scenario.breakEvenMonths.toFixed(0)} mo` : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={clsx(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      scenario.riskScore === 'low' && 'bg-green-100 text-green-800',
                      scenario.riskScore === 'medium' && 'bg-yellow-100 text-yellow-800',
                      scenario.riskScore === 'high' && 'bg-red-100 text-red-800'
                    )}>
                      {scenario.riskScore.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recommendations</h3>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={clsx(
                'flex items-start gap-4 p-4 rounded-lg',
                rec.startsWith('CRITICAL') ? 'bg-red-50 border border-red-200' : 'bg-slate-50'
              )}
            >
              <span className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                rec.startsWith('CRITICAL') ? 'bg-red-200 text-red-800' : 'bg-primary-100 text-primary-700'
              )}>
                {index + 1}
              </span>
              <p className="text-slate-700">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Health Issues */}
      {healthMetrics.issues.length > 0 && (
        <div className="card border-yellow-200 bg-yellow-50/50">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Health Issues Identified
          </h3>
          <div className="space-y-3">
            {healthMetrics.issues.map((issue, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-200">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">{issue}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className="bg-slate-900 rounded-xl p-8 text-white print:break-before-page">
        <h3 className="text-xl font-bold mb-6">Executive Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-slate-400 text-sm uppercase tracking-wide mb-4">Current State</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-slate-400" />
                <span>Managing {formatNumber(summary.totalNodes)} nodes across infrastructure</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-slate-400" />
                <span>Annual TCO of {formatCurrency(summary.annualTco, true)}</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-slate-400" />
                <span>{formatNumber(summary.activeCookbooks)} active cookbooks maintained</span>
              </li>
              <li className="flex items-center gap-3">
                <AlertTriangle className={clsx('w-5 h-5', healthMetrics.healthScore === 'healthy' ? 'text-green-400' : 'text-yellow-400')} />
                <span>Health status: {healthMetrics.healthScore.toUpperCase()}</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-400 text-sm uppercase tracking-wide mb-4">Recommended Action</h4>
            {bestScenario && bestScenario.npv3Year > 0 ? (
              <div className="bg-white/10 rounded-lg p-4">
                <p className="font-semibold text-lg">{bestScenario.name}</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-slate-400 text-sm">3-Year NPV</p>
                    <p className="text-xl font-bold text-green-400">
                      {formatCurrency(bestScenario.npv3Year, true)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Breakeven</p>
                    <p className="text-xl font-bold">
                      {bestScenario.breakEvenMonths?.toFixed(0) || 'N/A'} months
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 rounded-lg p-4">
                <p className="font-semibold text-lg">Optimize Current Chef Estate</p>
                <p className="text-slate-300 mt-2">
                  Focus on cookbook consolidation and technical debt reduction before considering migration.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Footer */}
      <div className="text-center text-sm text-slate-500 print:block hidden">
        <p>Generated by Chef TCO Analysis Toolkit</p>
        <p>{new Date().toISOString()}</p>
      </div>
    </div>
  );
}
