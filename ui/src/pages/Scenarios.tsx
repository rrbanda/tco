import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Calendar,
  Shield,
} from 'lucide-react';
import {
  ScenarioComparisonChart,
  TimelineChart,
} from '../components/Charts';
import type { AnalysisReport, ScenarioResult } from '../lib/types';
import { formatCurrency } from '../lib/calculator';
import clsx from 'clsx';

interface ScenariosProps {
  report: AnalysisReport;
}

const platformInfo: Record<string, { description: string; pros: string[]; cons: string[] }> = {
  ansible: {
    description:
      'Red Hat Ansible Automation Platform provides agentless configuration management with YAML-based playbooks.',
    pros: [
      'Agentless architecture',
      'Strong community and enterprise support',
      'Easy learning curve',
      'Good skill availability',
    ],
    cons: [
      'Performance at ultra-scale',
      'Less mature for complex orchestration',
      'Licensing costs at scale',
    ],
  },
  kubernetes: {
    description:
      'Container orchestration with GitOps (ArgoCD/Flux) for declarative, version-controlled infrastructure.',
    pros: [
      'Cloud-native ready',
      'Declarative and version-controlled',
      'Strong ecosystem',
      'No licensing costs',
    ],
    cons: [
      'Steep learning curve',
      'Significant migration effort',
      'Requires containerization',
      'Complex operations',
    ],
  },
  terraform: {
    description:
      'HashiCorp Terraform for infrastructure as code with multi-cloud support and state management.',
    pros: [
      'Multi-cloud support',
      'Strong ecosystem',
      'Declarative syntax',
      'Good for cloud-native',
    ],
    cons: [
      'State management complexity',
      'Limited for config management',
      'May need complementary tools',
    ],
  },
  puppet: {
    description:
      'Puppet Enterprise offers similar functionality to Chef with a different DSL approach.',
    pros: [
      'Similar paradigm to Chef',
      'Lower migration effort',
      'Mature enterprise features',
      'Strong compliance features',
    ],
    cons: [
      'Similar cost structure to Chef',
      'Skill availability declining',
      'Less cloud-native',
    ],
  },
};

const riskColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200',
};

function ScenarioCard({
  scenario,
  currentTco,
  isRecommended,
  isSelected,
  onSelect,
}: {
  scenario: ScenarioResult;
  currentTco: number;
  isRecommended: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const info = platformInfo[scenario.platform];
  const savingsVsCurrent = currentTco * 3 - scenario.threeYearTotal;
  const isPositiveNpv = scenario.npv3Year > 0;

  return (
    <div
      className={clsx(
        'card cursor-pointer transition-all duration-200',
        isSelected
          ? 'ring-2 ring-primary-500 border-primary-300'
          : 'hover:border-slate-300 hover:shadow-md',
        isRecommended && !isSelected && 'border-green-300 bg-green-50/30'
      )}
      onClick={onSelect}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-4 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
          Recommended
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{scenario.name}</h3>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{info.description}</p>
        </div>
        <span className={clsx('px-2 py-1 rounded-full text-xs font-medium border', riskColors[scenario.riskScore])}>
          {scenario.riskScore.toUpperCase()} Risk
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-slate-100">
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase">Migration</p>
          <p className="text-lg font-bold text-slate-900 mt-1">
            {formatCurrency(scenario.migrationCost, true)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase">3-Year TCO</p>
          <p className="text-lg font-bold text-slate-900 mt-1">
            {formatCurrency(scenario.threeYearTotal, true)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase">NPV</p>
          <p className={clsx('text-lg font-bold mt-1', isPositiveNpv ? 'text-green-600' : 'text-red-600')}>
            {formatCurrency(scenario.npv3Year, true)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">
              {scenario.breakEvenMonths ? `${scenario.breakEvenMonths.toFixed(0)} mo` : 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {savingsVsCurrent > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={clsx('text-sm font-medium', savingsVsCurrent > 0 ? 'text-green-600' : 'text-red-600')}>
              {formatCurrency(Math.abs(savingsVsCurrent), true)}
            </span>
          </div>
        </div>
        <ArrowRight className={clsx('w-5 h-5', isSelected ? 'text-primary-600' : 'text-slate-400')} />
      </div>
    </div>
  );
}

export function Scenarios({ report }: ScenariosProps) {
  const { scenarios, costBreakdown } = report;
  const [selectedPlatform, setSelectedPlatform] = useState<string>(scenarios[0]?.platform || 'ansible');
  
  const selectedScenario = scenarios.find((s) => s.platform === selectedPlatform);
  const selectedInfo = platformInfo[selectedPlatform];
  const currentTco = costBreakdown.totalAnnualTco;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Migration Scenarios</h1>
        <p className="text-slate-600 mt-1">
          Compare modernization options with detailed financial analysis
        </p>
      </div>

      {/* Current State Banner */}
      <div className="bg-slate-900 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-slate-400 text-sm uppercase tracking-wide">Current State (Chef)</p>
            <p className="text-3xl font-bold mt-2">{formatCurrency(currentTco, true)}</p>
            <p className="text-slate-400 mt-1">Annual TCO</p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-slate-400 text-sm">3-Year Projection</p>
              <p className="text-xl font-semibold mt-1">{formatCurrency(currentTco * 3.15, true)}</p>
              <p className="text-xs text-slate-500">With 5% annual increase</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Per Node</p>
              <p className="text-xl font-semibold mt-1">{formatCurrency(report.perUnitCosts.perNode)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Trend</p>
              <p className="text-xl font-semibold mt-1 text-red-400">+5%/yr</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario, index) => (
          <ScenarioCard
            key={scenario.platform}
            scenario={scenario}
            currentTco={currentTco}
            isRecommended={index === 0}
            isSelected={selectedPlatform === scenario.platform}
            onSelect={() => setSelectedPlatform(scenario.platform)}
          />
        ))}
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Year-over-Year Comparison</h2>
          <ScenarioComparisonChart scenarios={scenarios} currentTco={currentTco} />
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Cumulative Cost Timeline</h2>
          <TimelineChart scenarios={scenarios} currentTco={currentTco} />
        </div>
      </div>

      {/* Selected Scenario Details */}
      {selectedScenario && selectedInfo && (
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            {selectedScenario.name} - Detailed Analysis
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cost Breakdown */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <DollarSign className="w-4 h-4" />
                    Migration Cost
                  </div>
                  <p className="text-xl font-bold text-slate-900 mt-2">
                    {formatCurrency(selectedScenario.migrationCost, true)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    Year 1
                  </div>
                  <p className="text-xl font-bold text-slate-900 mt-2">
                    {formatCurrency(selectedScenario.year1Cost, true)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    Year 2
                  </div>
                  <p className="text-xl font-bold text-slate-900 mt-2">
                    {formatCurrency(selectedScenario.year2Cost, true)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    Year 3
                  </div>
                  <p className="text-xl font-bold text-slate-900 mt-2">
                    {formatCurrency(selectedScenario.year3Cost, true)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pros */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Advantages
                  </h4>
                  <ul className="space-y-2">
                    {selectedInfo.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Cons */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    Considerations
                  </h4>
                  <ul className="space-y-2">
                    {selectedInfo.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Summary Panel */}
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-200">
              <h4 className="font-semibold text-slate-900 mb-4">Financial Summary</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-primary-200">
                  <span className="text-slate-600">3-Year Total</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(selectedScenario.threeYearTotal, true)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-primary-200">
                  <span className="text-slate-600">vs Current (3yr)</span>
                  <span
                    className={clsx(
                      'font-bold',
                      selectedScenario.savingsPercent > 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {selectedScenario.savingsPercent > 0 ? '-' : '+'}
                    {Math.abs(selectedScenario.savingsPercent).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-primary-200">
                  <span className="text-slate-600">Breakeven</span>
                  <span className="font-bold text-slate-900">
                    {selectedScenario.breakEvenMonths
                      ? `${selectedScenario.breakEvenMonths.toFixed(0)} months`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-primary-200">
                  <span className="text-slate-600">3-Year NPV</span>
                  <span
                    className={clsx(
                      'font-bold',
                      selectedScenario.npv3Year > 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {formatCurrency(selectedScenario.npv3Year, true)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Risk Level
                  </span>
                  <span
                    className={clsx(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      riskColors[selectedScenario.riskScore]
                    )}
                  >
                    {selectedScenario.riskScore.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
