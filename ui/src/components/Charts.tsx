import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import type { TCOBreakdown, ScenarioResult } from '../lib/types';
import { formatCurrency } from '../lib/calculator';

const COLORS = {
  primary: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
  categorical: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
  status: {
    healthy: '#22c55e',
    warning: '#f59e0b',
    critical: '#ef4444',
  },
};

interface TCOPieChartProps {
  data: TCOBreakdown;
}

export function TCOPieChart({ data }: TCOPieChartProps) {
  const chartData = [
    { name: 'Licensing', value: data.licensingCost, color: '#3b82f6' },
    { name: 'Infrastructure', value: data.infrastructureCost, color: '#60a5fa' },
    { name: 'Platform Labor', value: data.platformLaborCost, color: '#22c55e' },
    { name: 'Distributed Labor', value: data.distributedLaborCost, color: '#4ade80' },
    { name: 'Incident Response', value: data.incidentCost, color: '#f59e0b' },
    { name: 'Technical Debt', value: data.technicalDebtTax, color: '#ef4444' },
    { name: 'Training', value: data.trainingCost, color: '#8b5cf6' },
    { name: 'Contractors', value: data.contractorCost, color: '#ec4899' },
    { name: 'Opportunity Cost', value: data.opportunityCost, color: '#94a3b8' },
  ].filter((item) => item.value > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={{ strokeWidth: 1 }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface CostBreakdownBarChartProps {
  data: TCOBreakdown;
}

export function CostBreakdownBarChart({ data }: CostBreakdownBarChartProps) {
  const chartData = [
    { category: 'Direct', Licensing: data.licensingCost, Infrastructure: data.infrastructureCost },
    {
      category: 'Labor',
      'Platform Team': data.platformLaborCost,
      'Distributed': data.distributedLaborCost,
      'Incidents': data.incidentCost,
    },
    {
      category: 'Hidden',
      'Tech Debt': data.technicalDebtTax,
      'Opportunity': data.opportunityCost,
    },
    { category: 'Other', Training: data.trainingCost, Contractors: data.contractorCost },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          type="number"
          tickFormatter={(value) => formatCurrency(value, true)}
          tick={{ fontSize: 12 }}
        />
        <YAxis type="category" dataKey="category" tick={{ fontSize: 12 }} width={80} />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar dataKey="Licensing" stackId="a" fill="#3b82f6" />
        <Bar dataKey="Infrastructure" stackId="a" fill="#60a5fa" />
        <Bar dataKey="Platform Team" stackId="a" fill="#22c55e" />
        <Bar dataKey="Distributed" stackId="a" fill="#4ade80" />
        <Bar dataKey="Incidents" stackId="a" fill="#f59e0b" />
        <Bar dataKey="Tech Debt" stackId="a" fill="#ef4444" />
        <Bar dataKey="Opportunity" stackId="a" fill="#94a3b8" />
        <Bar dataKey="Training" stackId="a" fill="#8b5cf6" />
        <Bar dataKey="Contractors" stackId="a" fill="#ec4899" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ScenarioComparisonChartProps {
  scenarios: ScenarioResult[];
  currentTco: number;
}

export function ScenarioComparisonChart({ scenarios, currentTco }: ScenarioComparisonChartProps) {
  const chartData = [
    {
      name: 'Current\n(Chef)',
      'Year 1': currentTco,
      'Year 2': currentTco * 1.05,
      'Year 3': currentTco * 1.1,
      total: currentTco * 3.15,
    },
    ...scenarios.map((s) => ({
      name: s.platform.charAt(0).toUpperCase() + s.platform.slice(1),
      'Year 1': s.year1Cost,
      'Year 2': s.year2Cost,
      'Year 3': s.year3Cost,
      total: s.threeYearTotal,
    })),
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(value) => formatCurrency(value, true)} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar dataKey="Year 1" fill="#3b82f6" />
        <Bar dataKey="Year 2" fill="#22c55e" />
        <Bar dataKey="Year 3" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface NPVComparisonChartProps {
  scenarios: ScenarioResult[];
}

export function NPVComparisonChart({ scenarios }: NPVComparisonChartProps) {
  const chartData = scenarios.map((s) => ({
    name: s.platform.charAt(0).toUpperCase() + s.platform.slice(1),
    NPV: s.npv3Year,
    fill: s.npv3Year > 0 ? '#22c55e' : '#ef4444',
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          type="number"
          tickFormatter={(value) => formatCurrency(value, true)}
          tick={{ fontSize: 12 }}
        />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Bar dataKey="NPV" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface TimelineChartProps {
  scenarios: ScenarioResult[];
  currentTco: number;
}

export function TimelineChart({ scenarios, currentTco }: TimelineChartProps) {
  const years = ['Year 0', 'Year 1', 'Year 2', 'Year 3'];
  
  const chartData = years.map((year, index) => {
    const point: Record<string, number | string> = { year };
    
    // Current state cumulative
    if (index === 0) {
      point['Current (Chef)'] = 0;
      scenarios.forEach((s) => {
        point[s.platform] = 0;
      });
    } else {
      const currentCumulative = currentTco * index * (1 + (index - 1) * 0.025);
      point['Current (Chef)'] = currentCumulative;
      
      scenarios.forEach((s) => {
        let cumulative = 0;
        if (index >= 1) cumulative += s.year1Cost;
        if (index >= 2) cumulative += s.year2Cost;
        if (index >= 3) cumulative += s.year3Cost;
        point[s.platform] = cumulative;
      });
    }
    
    return point;
  });

  const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(value) => formatCurrency(value, true)} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="Current (Chef)"
          stroke={colors[0]}
          strokeWidth={2}
          dot={{ r: 4 }}
        />
        {scenarios.map((s, index) => (
          <Line
            key={s.platform}
            type="monotone"
            dataKey={s.platform}
            stroke={colors[(index % 4) + 1]}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

interface BenchmarkGaugeProps {
  value: number;
  min: number;
  max: number;
  thresholds: { healthy: number; warning: number };
  label: string;
  format?: (v: number) => string;
}

export function BenchmarkGauge({ value, min, max, thresholds, label, format }: BenchmarkGaugeProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const healthyPct = ((thresholds.healthy - min) / (max - min)) * 100;
  const warningPct = ((thresholds.warning - min) / (max - min)) * 100;

  let color = COLORS.status.healthy;
  if (value > thresholds.warning) color = COLORS.status.critical;
  else if (value > thresholds.healthy) color = COLORS.status.warning;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>
          {format ? format(value) : value.toFixed(1)}
        </span>
      </div>
      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
        {/* Healthy zone */}
        <div
          className="absolute h-full bg-green-200"
          style={{ width: `${healthyPct}%` }}
        />
        {/* Warning zone */}
        <div
          className="absolute h-full bg-yellow-200"
          style={{ left: `${healthyPct}%`, width: `${warningPct - healthyPct}%` }}
        />
        {/* Critical zone */}
        <div
          className="absolute h-full bg-red-200"
          style={{ left: `${warningPct}%`, right: 0 }}
        />
        {/* Value indicator */}
        <div
          className="absolute top-0 w-1 h-full bg-slate-800 rounded-full shadow-lg transition-all duration-500"
          style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>{min}</span>
        <span>Healthy: &lt;{thresholds.healthy}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
