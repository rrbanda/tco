import { useState } from 'react';
import { 
  Server, 
  BookOpen, 
  Users, 
  AlertTriangle as AlertIcon, 
  CreditCard,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import type { OrganizationData } from '../lib/types';
import { sampleData, defaultData, presetScenarios } from '../data/sampleData';
import { formatNumber } from '../lib/calculator';
import clsx from 'clsx';

interface DataInputProps {
  data: OrganizationData;
  onDataChange: (data: OrganizationData) => void;
}

type Section = 'infrastructure' | 'cookbooks' | 'team' | 'incidents' | 'licensing';

const sections: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'infrastructure', label: 'Infrastructure', icon: Server },
  { id: 'cookbooks', label: 'Cookbooks', icon: BookOpen },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'incidents', label: 'Incidents', icon: AlertIcon },
  { id: 'licensing', label: 'Licensing', icon: CreditCard },
];

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
}

function InputField({ label, value, onChange, prefix, suffix, min = 0, max, step = 1, helpText }: InputFieldProps) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className={clsx('input tabular-nums', prefix && 'pl-8', suffix && 'pr-16')}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
            {suffix}
          </span>
        )}
      </div>
      {helpText && <p className="mt-1 text-xs text-slate-500">{helpText}</p>}
    </div>
  );
}

export function DataInput({ data, onDataChange }: DataInputProps) {
  const [activeSection, setActiveSection] = useState<Section>('infrastructure');

  const updateInfrastructure = (key: keyof typeof data.infrastructure, value: number) => {
    onDataChange({
      ...data,
      infrastructure: { ...data.infrastructure, [key]: value },
    });
  };

  const updateCookbooks = (key: keyof typeof data.cookbooks, value: number) => {
    onDataChange({
      ...data,
      cookbooks: { ...data.cookbooks, [key]: value },
    });
  };

  const updateTeam = (key: keyof typeof data.team, value: number) => {
    onDataChange({
      ...data,
      team: { ...data.team, [key]: value },
    });
  };

  const updateIncidents = (key: keyof typeof data.incidents, value: number) => {
    onDataChange({
      ...data,
      incidents: { ...data.incidents, [key]: value },
    });
  };

  const updateLicensing = (key: keyof typeof data.licensing, value: number) => {
    onDataChange({
      ...data,
      licensing: { ...data.licensing, [key]: value },
    });
  };

  const loadPreset = (presetId: string) => {
    if (presetId === 'ultra') {
      onDataChange(sampleData);
    } else if (presetId === 'default') {
      onDataChange(defaultData);
    } else {
      // Scale default data based on preset
      const preset = presetScenarios.find((p) => p.id === presetId);
      if (preset) {
        onDataChange({
          ...defaultData,
          infrastructure: {
            ...defaultData.infrastructure,
            totalManagedNodes: preset.nodes,
            productionNodes: Math.round(preset.nodes * 0.7),
            stagingNodes: Math.round(preset.nodes * 0.2),
            developmentNodes: Math.round(preset.nodes * 0.1),
            chefServerCount: Math.max(1, Math.ceil(preset.nodes / 15000)),
          },
          cookbooks: {
            ...defaultData.cookbooks,
            totalCookbooks: preset.cookbooks * 3,
            activeCookbooks: preset.cookbooks,
            uniqueCookbookNames: Math.round(preset.cookbooks * 0.6),
            tier1Simple: Math.round(preset.cookbooks * 0.6),
            tier2Standard: Math.round(preset.cookbooks * 0.3),
            tier3Complex: Math.round(preset.cookbooks * 0.1),
          },
          team: {
            ...defaultData.team,
            dedicatedEngineers: Math.max(2, Math.round(preset.nodes / 5000)),
            partTimeContributors: Math.round(preset.nodes / 2000),
          },
          licensing: {
            ...defaultData.licensing,
            annualLicenseCost: preset.nodes * 55,
          },
        });
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Input</h1>
          <p className="text-slate-600 mt-1">
            Enter your organization's infrastructure data for TCO analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onDataChange(defaultData)}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={() => onDataChange(sampleData)}
            className="btn-primary flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Load Sample (200K nodes)
          </button>
        </div>
      </div>

      {/* Preset Quick Load */}
      <div className="card">
        <h3 className="text-sm font-medium text-slate-700 mb-3">Quick Load Presets</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {presetScenarios.map((preset) => (
            <button
              key={preset.id}
              onClick={() => loadPreset(preset.id)}
              className="p-4 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
            >
              <p className="font-medium text-slate-900">{preset.name}</p>
              <p className="text-sm text-slate-500 mt-1">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                activeSection === section.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300'
              )}
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Input Sections */}
      <div className="card">
        {/* Infrastructure Section */}
        {activeSection === 'infrastructure' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-primary-600" />
              Infrastructure Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField
                label="Total Managed Nodes"
                value={data.infrastructure.totalManagedNodes}
                onChange={(v) => updateInfrastructure('totalManagedNodes', v)}
                helpText="Total servers/VMs managed by Chef"
              />
              <InputField
                label="Production Nodes"
                value={data.infrastructure.productionNodes}
                onChange={(v) => updateInfrastructure('productionNodes', v)}
              />
              <InputField
                label="Staging Nodes"
                value={data.infrastructure.stagingNodes}
                onChange={(v) => updateInfrastructure('stagingNodes', v)}
              />
              <InputField
                label="Development Nodes"
                value={data.infrastructure.developmentNodes}
                onChange={(v) => updateInfrastructure('developmentNodes', v)}
              />
              <InputField
                label="Chef Server Count"
                value={data.infrastructure.chefServerCount}
                onChange={(v) => updateInfrastructure('chefServerCount', v)}
                helpText="Number of Chef Infra Servers"
              />
              <InputField
                label="Monthly Server Cost"
                value={data.infrastructure.monthlyServerCost}
                onChange={(v) => updateInfrastructure('monthlyServerCost', v)}
                prefix="$"
                helpText="Per Chef server (compute + storage)"
              />
              <InputField
                label="Chef Run Interval"
                value={data.infrastructure.chefRunIntervalMinutes}
                onChange={(v) => updateInfrastructure('chefRunIntervalMinutes', v)}
                suffix="minutes"
              />
            </div>
          </div>
        )}

        {/* Cookbooks Section */}
        {activeSection === 'cookbooks' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-600" />
              Cookbook Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField
                label="Total Cookbooks (All Versions)"
                value={data.cookbooks.totalCookbooks}
                onChange={(v) => updateCookbooks('totalCookbooks', v)}
                helpText="Including all historical versions"
              />
              <InputField
                label="Unique Cookbook Names"
                value={data.cookbooks.uniqueCookbookNames}
                onChange={(v) => updateCookbooks('uniqueCookbookNames', v)}
                helpText="Excluding version numbers"
              />
              <InputField
                label="Active Cookbooks"
                value={data.cookbooks.activeCookbooks}
                onChange={(v) => updateCookbooks('activeCookbooks', v)}
                helpText="Used in last 90 days"
              />
              <InputField
                label="Tier 1 (Simple)"
                value={data.cookbooks.tier1Simple}
                onChange={(v) => updateCookbooks('tier1Simple', v)}
                helpText="Simple config, <100 lines"
              />
              <InputField
                label="Tier 2 (Standard)"
                value={data.cookbooks.tier2Standard}
                onChange={(v) => updateCookbooks('tier2Standard', v)}
                helpText="100-500 lines, few dependencies"
              />
              <InputField
                label="Tier 3 (Complex)"
                value={data.cookbooks.tier3Complex}
                onChange={(v) => updateCookbooks('tier3Complex', v)}
                helpText=">500 lines, many dependencies"
              />
              <InputField
                label="Avg Cookbooks per Node"
                value={data.cookbooks.avgCookbooksPerNode}
                onChange={(v) => updateCookbooks('avgCookbooksPerNode', v)}
                helpText="Average run-list size"
              />
            </div>
          </div>
        )}

        {/* Team Section */}
        {activeSection === 'team' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              Team Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField
                label="Dedicated Engineers"
                value={data.team.dedicatedEngineers}
                onChange={(v) => updateTeam('dedicatedEngineers', v)}
                helpText="Full-time Chef platform engineers"
              />
              <InputField
                label="Part-time Contributors"
                value={data.team.partTimeContributors}
                onChange={(v) => updateTeam('partTimeContributors', v)}
                helpText="App team members contributing to Chef"
              />
              <InputField
                label="Part-time Allocation"
                value={data.team.partTimeAllocationPct}
                onChange={(v) => updateTeam('partTimeAllocationPct', v)}
                suffix="%"
                max={100}
                helpText="Average % time on Chef work"
              />
              <InputField
                label="Average Salary"
                value={data.team.averageSalary}
                onChange={(v) => updateTeam('averageSalary', v)}
                prefix="$"
                step={5000}
                helpText="Base salary before benefits"
              />
              <InputField
                label="Benefits Multiplier"
                value={data.team.benefitsMultiplier}
                onChange={(v) => updateTeam('benefitsMultiplier', v)}
                step={0.05}
                min={1}
                max={2}
                helpText="Typically 1.3-1.5x"
              />
            </div>
          </div>
        )}

        {/* Incidents Section */}
        {activeSection === 'incidents' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertIcon className="w-5 h-5 text-primary-600" />
              Incident Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField
                label="Monthly Incidents"
                value={data.incidents.monthlyIncidents}
                onChange={(v) => updateIncidents('monthlyIncidents', v)}
                helpText="Chef-related incidents per month"
              />
              <InputField
                label="Average MTTR"
                value={data.incidents.averageMttrHours}
                onChange={(v) => updateIncidents('averageMttrHours', v)}
                suffix="hours"
                step={0.5}
                helpText="Mean Time to Resolution"
              />
              <InputField
                label="Engineers per Incident"
                value={data.incidents.engineersPerIncident}
                onChange={(v) => updateIncidents('engineersPerIncident', v)}
                step={0.5}
                helpText="Average engineers involved"
              />
            </div>
          </div>
        )}

        {/* Licensing Section */}
        {activeSection === 'licensing' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary-600" />
              Licensing & Costs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField
                label="Annual License Cost"
                value={data.licensing.annualLicenseCost}
                onChange={(v) => updateLicensing('annualLicenseCost', v)}
                prefix="$"
                step={10000}
                helpText="Total Chef licensing"
              />
              <InputField
                label="Negotiated Rate per Node"
                value={data.licensing.negotiatedRatePerNode}
                onChange={(v) => updateLicensing('negotiatedRatePerNode', v)}
                prefix="$"
                helpText="Your contract rate"
              />
              <InputField
                label="Annual Training Budget"
                value={data.licensing.annualTrainingBudget}
                onChange={(v) => updateLicensing('annualTrainingBudget', v)}
                prefix="$"
                step={5000}
              />
              <InputField
                label="Monthly CI/CD Cost"
                value={data.licensing.monthlyCicdCost}
                onChange={(v) => updateLicensing('monthlyCicdCost', v)}
                prefix="$"
                helpText="Cookbook testing infrastructure"
              />
              <InputField
                label="Annual Contractor Spend"
                value={data.licensing.annualContractorSpend}
                onChange={(v) => updateLicensing('annualContractorSpend', v)}
                prefix="$"
                step={10000}
                helpText="External Chef consultants"
              />
            </div>
          </div>
        )}
      </div>

      {/* Current Data Summary */}
      <div className="bg-slate-900 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Current Configuration Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div>
            <p className="text-slate-400 text-sm">Nodes</p>
            <p className="text-xl font-bold mt-1">{formatNumber(data.infrastructure.totalManagedNodes)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Cookbooks</p>
            <p className="text-xl font-bold mt-1">{formatNumber(data.cookbooks.activeCookbooks)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Engineers</p>
            <p className="text-xl font-bold mt-1">{data.team.dedicatedEngineers}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Incidents/mo</p>
            <p className="text-xl font-bold mt-1">{data.incidents.monthlyIncidents}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">License Cost</p>
            <p className="text-xl font-bold mt-1">${(data.licensing.annualLicenseCost / 1e6).toFixed(1)}M</p>
          </div>
        </div>
      </div>
    </div>
  );
}
