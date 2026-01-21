import { 
  BookOpen, 
  HelpCircle, 
  Calculator, 
  TrendingUp, 
  DollarSign,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

interface TermDefinition {
  term: string;
  definition: string;
  formula?: string;
  example?: string;
  interpretation?: string;
}

const costTerms: TermDefinition[] = [
  {
    term: 'TCO (Total Cost of Ownership)',
    definition: 'The complete annual cost of maintaining your Chef infrastructure, including all direct costs (licensing, infrastructure) and indirect costs (labor, technical debt, opportunity cost).',
    formula: 'TCO = Direct Costs + Labor Costs + Technical Debt Tax + Opportunity Cost',
    example: 'If your licensing is $11M, labor is $16M, debt tax is $4M, and opportunity cost is $2.5M, your TCO is $33.5M.',
    interpretation: 'A higher TCO per node suggests inefficiencies that could be addressed through consolidation or modernization.',
  },
  {
    term: 'Direct Costs',
    definition: 'Costs directly attributable to Chef infrastructure that appear on invoices: software licensing fees and infrastructure (servers, storage, network).',
    formula: 'Direct Costs = Licensing + Infrastructure',
    interpretation: 'Typically 30-50% of total TCO. If higher, you may be over-licensed or have inefficient infrastructure.',
  },
  {
    term: 'Labor Costs',
    definition: 'The fully-loaded cost of engineers maintaining Chef infrastructure, including dedicated platform team, part-time contributors, and incident response.',
    formula: 'Labor = (Dedicated FTEs × Salary × Benefits Multiplier) + (Part-time × Allocation% × Salary × Benefits) + Incident Costs',
    interpretation: 'Often the largest component of TCO (40-60%). High labor costs relative to node count suggests complexity.',
  },
  {
    term: 'Fully-Loaded Salary',
    definition: 'Total compensation cost including base salary plus benefits, taxes, equipment, and overhead. Typically 1.3-1.5x base salary.',
    formula: 'Fully-Loaded = Base Salary × Benefits Multiplier',
    example: '$165,000 base × 1.4 multiplier = $231,000 fully-loaded cost',
  },
  {
    term: 'Technical Debt Tax',
    definition: 'Additional labor cost incurred due to infrastructure complexity, measured by the debt multiplier. Represents the "hidden cost" of cookbook sprawl.',
    formula: 'Debt Tax = Base Labor Cost × (Debt Multiplier - 1)',
    example: 'With $16M labor and 1.25x multiplier: $16M × 0.25 = $4M annual debt tax',
    interpretation: 'This is money you could save by reducing complexity. A high debt tax is a strong argument for consolidation.',
  },
  {
    term: 'Opportunity Cost',
    definition: 'Value of work that could be done if engineers weren\'t maintaining Chef. Conservatively estimated at 15% of labor costs.',
    formula: 'Opportunity Cost = Labor Costs × 0.15',
    interpretation: 'Represents innovation and strategic projects that are delayed due to maintenance burden.',
  },
  {
    term: 'Cost per Node',
    definition: 'Annual TCO divided by total managed nodes. Key benchmark for comparing efficiency.',
    formula: 'Cost per Node = Annual TCO ÷ Total Nodes',
    interpretation: '$75-100 is healthy, $100-150 is acceptable, >$150 suggests inefficiency.',
  },
  {
    term: 'Cost per Cookbook',
    definition: 'Annual TCO divided by active cookbooks. Indicates maintenance cost per unit of configuration.',
    formula: 'Cost per Cookbook = Annual TCO ÷ Active Cookbooks',
    interpretation: 'Useful for understanding the true cost of maintaining each cookbook.',
  },
];

const healthTerms: TermDefinition[] = [
  {
    term: 'Cookbook Ratio',
    definition: 'Number of active cookbooks per 1,000 managed nodes. Primary indicator of infrastructure complexity and potential technical debt.',
    formula: 'Cookbook Ratio = (Active Cookbooks ÷ Total Nodes) × 1000',
    example: '12,000 cookbooks ÷ 200,000 nodes × 1000 = 60 per 1K nodes',
    interpretation: '<25 is healthy (well-consolidated), 25-100 is warning (needs attention), >100 is critical (severe fragmentation).',
  },
  {
    term: 'Debt Multiplier',
    definition: 'A factor applied to labor costs based on cookbook ratio. Higher ratios mean more complexity and higher maintenance overhead.',
    interpretation: '1.0x means no debt overhead. 1.25x means 25% extra labor cost. 2.5x means infrastructure is extremely complex.',
  },
  {
    term: 'Cookbooks per FTE',
    definition: 'Number of active cookbooks divided by effective full-time engineers. Measures team efficiency and workload.',
    formula: 'Cookbooks per FTE = Active Cookbooks ÷ (Dedicated + Part-time × Allocation%)',
    interpretation: '150-250 is healthy, 75-150 suggests complexity issues, <75 indicates severe inefficiency or understaffing.',
  },
  {
    term: 'Health Score',
    definition: 'Overall assessment of infrastructure health based on cookbook ratio and FTE efficiency.',
    interpretation: 'Healthy = metrics within target ranges. Warning = one or more metrics need attention. Critical = immediate action required.',
  },
  {
    term: 'Active Cookbooks',
    definition: 'Cookbooks that have been used in at least one node run-list within the last 90 days. Excludes dormant or legacy cookbooks.',
    interpretation: 'Focus on active cookbooks for TCO analysis. Dormant cookbooks still contribute to sprawl but have lower maintenance cost.',
  },
  {
    term: 'Cookbook Tiers',
    definition: 'Classification of cookbooks by complexity for migration effort estimation.',
    interpretation: 'Tier 1 (Simple): <100 lines, config only. Tier 2 (Standard): 100-500 lines, few dependencies. Tier 3 (Complex): >500 lines, many dependencies.',
  },
];

const scenarioTerms: TermDefinition[] = [
  {
    term: 'Migration Cost',
    definition: 'One-time investment required to transition from Chef to an alternative platform. Includes labor, training, and tooling.',
    formula: 'Migration = (Cookbook Hours × Hourly Rate × Platform Factor) + Training + Learning Curve Penalty',
    interpretation: 'Higher migration cost doesn\'t mean worse option—consider 3-year TCO and NPV for full picture.',
  },
  {
    term: 'NPV (Net Present Value)',
    definition: 'The current value of future savings, accounting for the time value of money. Positive NPV means the investment is worthwhile.',
    formula: 'NPV = Σ(Year N Savings ÷ (1 + Discount Rate)^N)',
    example: 'Saving $10M in Year 3 at 10% discount = $10M ÷ 1.33 = $7.5M in present value',
    interpretation: 'Positive NPV = good investment. Higher NPV = better return. Use NPV to compare options fairly.',
  },
  {
    term: 'Breakeven Period',
    definition: 'Time required for cumulative savings to exceed migration investment. Measured in months.',
    formula: 'Breakeven Months = (Migration Cost ÷ Annual Savings) × 12',
    interpretation: '<18 months is excellent, 18-24 is good, 24-36 is acceptable, >36 months may be risky.',
  },
  {
    term: '3-Year TCO',
    definition: 'Total cost over a 3-year planning horizon, including migration costs and ongoing operational costs.',
    interpretation: 'Standard planning horizon for infrastructure decisions. Accounts for migration payback period.',
  },
  {
    term: 'Risk Score',
    definition: 'Qualitative assessment of migration risk based on platform complexity and organizational change required.',
    interpretation: 'Low = minimal disruption (e.g., Puppet). Medium = moderate change (e.g., Ansible, Terraform). High = significant transformation (e.g., Kubernetes).',
  },
  {
    term: 'Discount Rate',
    definition: 'Rate used to calculate present value of future cash flows. Standard corporate rate is 10%.',
    interpretation: 'Higher discount rate means future savings are worth less today. Reflects opportunity cost of capital.',
  },
];

const benchmarkTerms: TermDefinition[] = [
  {
    term: 'FTE (Full-Time Equivalent)',
    definition: 'Standardized measure of employee workload. One FTE = one person working full-time (2,080 hours/year).',
    example: '3 part-time contributors at 20% allocation = 0.6 FTE',
  },
  {
    term: 'MTTR (Mean Time to Resolution)',
    definition: 'Average time to resolve a Chef-related incident, measured in hours.',
    interpretation: 'Lower is better. High MTTR suggests complexity, poor runbooks, or skill gaps.',
  },
  {
    term: 'CCR (Chef Client Run)',
    definition: 'Periodic execution of Chef recipes on a managed node. Typically runs every 30 minutes.',
    interpretation: 'CCRs per minute per server is a scaling metric. >333/min per server may require infrastructure scaling.',
  },
  {
    term: 'Run-list',
    definition: 'Ordered list of cookbooks and recipes applied to a node during a Chef Client Run.',
    interpretation: 'Larger run-lists increase complexity and run time. 5-15 cookbooks is typical, >30 suggests consolidation needed.',
  },
];

function TermCard({ term, definition, formula, example, interpretation }: TermDefinition) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
      <h4 className="font-semibold text-slate-900 mb-2">{term}</h4>
      <p className="text-sm text-slate-600 mb-3">{definition}</p>
      {formula && (
        <div className="bg-slate-50 rounded p-2 mb-2">
          <p className="text-xs text-slate-500 uppercase mb-1">Formula</p>
          <code className="text-sm text-slate-800 font-mono">{formula}</code>
        </div>
      )}
      {example && (
        <div className="bg-blue-50 rounded p-2 mb-2">
          <p className="text-xs text-blue-600 uppercase mb-1">Example</p>
          <p className="text-sm text-blue-800">{example}</p>
        </div>
      )}
      {interpretation && (
        <div className="bg-green-50 rounded p-2">
          <p className="text-xs text-green-600 uppercase mb-1">How to Interpret</p>
          <p className="text-sm text-green-800">{interpretation}</p>
        </div>
      )}
    </div>
  );
}

function TermSection({ 
  title, 
  icon: Icon, 
  terms 
}: { 
  title: string; 
  icon: React.ElementType; 
  terms: TermDefinition[] 
}) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary-600" />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {terms.map((term) => (
          <TermCard key={term.term} {...term} />
        ))}
      </div>
    </div>
  );
}

export function Help() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Terminology Guide</h1>
        <p className="text-slate-600 mt-1">
          Understand the metrics, formulas, and benchmarks used in this analysis
        </p>
      </div>

      {/* Quick Reference Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Quick Reference: Key Thresholds
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-slate-400 text-sm uppercase mb-2">Cookbook Ratio (per 1K nodes)</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>&lt; 25 = Healthy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span>25-100 = Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span>&gt; 100 = Critical</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-sm uppercase mb-2">Cost per Node (Annual)</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>&lt; $100 = Healthy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span>$100-200 = Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span>&gt; $200 = Critical</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-sm uppercase mb-2">Debt Multiplier</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>1.0x = No debt</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span>1.1-1.5x = Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span>&gt; 1.5x = Severe</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debt Multiplier Scale */}
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          Technical Debt Multiplier Scale
        </h3>
        <p className="text-slate-600 mb-4">
          The debt multiplier increases labor costs based on cookbook sprawl. It reflects the additional 
          effort required to maintain complex, fragmented infrastructure.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-2 px-4 text-left font-semibold text-slate-600">Cookbook Ratio</th>
                <th className="py-2 px-4 text-left font-semibold text-slate-600">Multiplier</th>
                <th className="py-2 px-4 text-left font-semibold text-slate-600">Extra Cost</th>
                <th className="py-2 px-4 text-left font-semibold text-slate-600">Assessment</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 px-4">&lt; 25 per 1K nodes</td>
                <td className="py-2 px-4 font-mono">1.00x</td>
                <td className="py-2 px-4 text-green-600">+0%</td>
                <td className="py-2 px-4"><span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Healthy</span></td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 px-4">25-50 per 1K nodes</td>
                <td className="py-2 px-4 font-mono">1.10x</td>
                <td className="py-2 px-4 text-yellow-600">+10%</td>
                <td className="py-2 px-4"><span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">Minor Debt</span></td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 px-4">50-100 per 1K nodes</td>
                <td className="py-2 px-4 font-mono">1.25x</td>
                <td className="py-2 px-4 text-yellow-600">+25%</td>
                <td className="py-2 px-4"><span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">Moderate Debt</span></td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 px-4">100-250 per 1K nodes</td>
                <td className="py-2 px-4 font-mono">1.50x</td>
                <td className="py-2 px-4 text-orange-600">+50%</td>
                <td className="py-2 px-4"><span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs">Significant Debt</span></td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 px-4">250-500 per 1K nodes</td>
                <td className="py-2 px-4 font-mono">2.00x</td>
                <td className="py-2 px-4 text-red-600">+100%</td>
                <td className="py-2 px-4"><span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">Severe Debt</span></td>
              </tr>
              <tr>
                <td className="py-2 px-4">&gt; 500 per 1K nodes</td>
                <td className="py-2 px-4 font-mono">2.50x</td>
                <td className="py-2 px-4 text-red-600">+150%</td>
                <td className="py-2 px-4"><span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">Critical</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Term Sections */}
      <TermSection title="Cost Metrics" icon={DollarSign} terms={costTerms} />
      <TermSection title="Health Indicators" icon={AlertTriangle} terms={healthTerms} />
      <TermSection title="Scenario Analysis" icon={Calculator} terms={scenarioTerms} />
      <TermSection title="Industry Benchmarks" icon={BookOpen} terms={benchmarkTerms} />

      {/* Methodology Link */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Full Methodology Documentation</h3>
            <p className="text-sm text-slate-600 mt-1 mb-3">
              For detailed information about data sources, assumptions, and calculation methods, 
              see the complete methodology document in the toolkit repository.
            </p>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View Methodology
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
