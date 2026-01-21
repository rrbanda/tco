import type {
  OrganizationData,
  TCOBreakdown,
  HealthMetrics,
  ScenarioResult,
  AnalysisReport,
} from './types';

// Benchmarks and constants
export const BENCHMARKS = {
  healthThresholds: {
    cookbookRatio: { healthy: 25, warning: 100, critical: 500 },
    cookbooksPerFte: { healthy: 150, warning: 75, critical: 50 },
    runListSize: { healthy: 15, warning: 30, critical: 50 },
  },
  debtMultipliers: [
    { threshold: 25, multiplier: 1.0 },
    { threshold: 50, multiplier: 1.1 },
    { threshold: 100, multiplier: 1.25 },
    { threshold: 250, multiplier: 1.5 },
    { threshold: 500, multiplier: 2.0 },
    { threshold: Infinity, multiplier: 2.5 },
  ],
  migration: {
    tier1Hours: 4,
    tier2Hours: 16,
    tier3Hours: 40,
    learningCurveMonths: 6,
    learningCurvePenalty: 0.2,
  },
  alternatives: {
    ansible: { perNodeCost: 75, migrationFactor: 1.0, label: 'Ansible' },
    kubernetes: { perNodeCost: 30, migrationFactor: 1.8, label: 'Kubernetes/GitOps' },
    terraform: { perNodeCost: 20, migrationFactor: 1.2, label: 'Terraform' },
    puppet: { perNodeCost: 125, migrationFactor: 0.7, label: 'Puppet' },
  },
} as const;

export function getDebtMultiplier(cookbookRatio: number): number {
  for (const { threshold, multiplier } of BENCHMARKS.debtMultipliers) {
    if (cookbookRatio <= threshold) {
      return multiplier;
    }
  }
  return 2.5;
}

export function calculateHealthMetrics(data: OrganizationData): HealthMetrics {
  const metrics: HealthMetrics = {
    cookbookRatio: 0,
    cookbooksPerFte: 0,
    debtMultiplier: 1.0,
    healthScore: 'healthy',
    issues: [],
  };

  // Calculate cookbook ratio (per 1000 nodes)
  if (data.infrastructure.totalManagedNodes > 0) {
    metrics.cookbookRatio =
      (data.cookbooks.activeCookbooks / data.infrastructure.totalManagedNodes) * 1000;
  }

  // Calculate cookbooks per FTE
  const totalFte =
    data.team.dedicatedEngineers +
    data.team.partTimeContributors * (data.team.partTimeAllocationPct / 100);
  
  if (totalFte > 0) {
    metrics.cookbooksPerFte = data.cookbooks.activeCookbooks / totalFte;
  }

  // Get debt multiplier
  metrics.debtMultiplier = getDebtMultiplier(metrics.cookbookRatio);

  // Determine health score
  const thresholds = BENCHMARKS.healthThresholds;

  if (metrics.cookbookRatio > thresholds.cookbookRatio.critical) {
    metrics.healthScore = 'critical';
    metrics.issues.push(
      `Cookbook ratio (${metrics.cookbookRatio.toFixed(1)}/1K nodes) is critical. Target: <${thresholds.cookbookRatio.healthy}`
    );
  } else if (metrics.cookbookRatio > thresholds.cookbookRatio.healthy) {
    metrics.healthScore = 'warning';
    metrics.issues.push(
      `Cookbook ratio (${metrics.cookbookRatio.toFixed(1)}/1K nodes) exceeds healthy threshold. Target: <${thresholds.cookbookRatio.healthy}`
    );
  }

  if (metrics.cookbooksPerFte > 300) {
    metrics.issues.push(
      `FTE efficiency (${metrics.cookbooksPerFte.toFixed(0)} cookbooks/FTE) may indicate understaffing`
    );
  } else if (metrics.cookbooksPerFte < thresholds.cookbooksPerFte.critical) {
    if (metrics.healthScore === 'healthy') {
      metrics.healthScore = 'warning';
    }
    metrics.issues.push(
      `Low FTE efficiency (${metrics.cookbooksPerFte.toFixed(0)} cookbooks/FTE) suggests complexity`
    );
  }

  return metrics;
}

export function calculateTCO(data: OrganizationData, healthMetrics: HealthMetrics): TCOBreakdown {
  const fullyLoadedSalary = data.team.averageSalary * data.team.benefitsMultiplier;

  // Direct costs
  const licensingCost = data.licensing.annualLicenseCost;
  const infrastructureCost =
    data.infrastructure.chefServerCount * data.infrastructure.monthlyServerCost * 12 +
    data.licensing.monthlyCicdCost * 12;

  // Labor costs
  const platformLaborCost = data.team.dedicatedEngineers * fullyLoadedSalary;
  const distributedLaborCost =
    data.team.partTimeContributors *
    (data.team.partTimeAllocationPct / 100) *
    fullyLoadedSalary;

  // Incident cost
  const hourlyRate = fullyLoadedSalary / 2080;
  const incidentCost =
    data.incidents.monthlyIncidents *
    12 *
    data.incidents.averageMttrHours *
    data.incidents.engineersPerIncident *
    hourlyRate;

  // Technical debt tax
  const baseLaborCost = platformLaborCost + distributedLaborCost;
  const technicalDebtTax = baseLaborCost * (healthMetrics.debtMultiplier - 1);

  // Other costs
  const trainingCost = data.licensing.annualTrainingBudget;
  const contractorCost = data.licensing.annualContractorSpend;

  // Derived values
  const directCosts = licensingCost + infrastructureCost;
  const laborCosts = platformLaborCost + distributedLaborCost + incidentCost;
  const opportunityCost = laborCosts * 0.15;

  const totalAnnualTco =
    licensingCost +
    infrastructureCost +
    platformLaborCost +
    distributedLaborCost +
    incidentCost +
    technicalDebtTax +
    trainingCost +
    contractorCost +
    opportunityCost;

  return {
    licensingCost,
    infrastructureCost,
    platformLaborCost,
    distributedLaborCost,
    incidentCost,
    technicalDebtTax,
    trainingCost,
    contractorCost,
    opportunityCost,
    directCosts,
    laborCosts,
    totalAnnualTco,
  };
}

export function calculateMigrationCost(
  data: OrganizationData,
  platform: keyof typeof BENCHMARKS.alternatives
): number {
  const migrationConfig = BENCHMARKS.migration;
  const platformConfig = BENCHMARKS.alternatives[platform];

  // Calculate hours based on cookbook complexity
  let totalHours =
    data.cookbooks.tier1Simple * migrationConfig.tier1Hours +
    data.cookbooks.tier2Standard * migrationConfig.tier2Hours +
    data.cookbooks.tier3Complex * migrationConfig.tier3Hours;

  // Apply platform factor
  totalHours *= platformConfig.migrationFactor;

  // Calculate costs
  const hourlyRate = (data.team.averageSalary * data.team.benefitsMultiplier) / 2080;
  const laborCost = totalHours * hourlyRate;
  const trainingCost = data.team.dedicatedEngineers * 80 * hourlyRate;
  const learningCost =
    data.team.dedicatedEngineers *
    ((data.team.averageSalary * data.team.benefitsMultiplier) / 2) *
    migrationConfig.learningCurvePenalty;
  const toolingCost = laborCost * 0.1;

  return laborCost + trainingCost + learningCost + toolingCost;
}

export function calculateScenario(
  data: OrganizationData,
  tco: TCOBreakdown,
  platform: keyof typeof BENCHMARKS.alternatives,
  discountRate: number = 0.1
): ScenarioResult {
  const currentTco = tco.totalAnnualTco;
  const migrationCost = calculateMigrationCost(data, platform);
  const platformConfig = BENCHMARKS.alternatives[platform];

  // New platform costs
  const newLicenseCost = data.infrastructure.totalManagedNodes * platformConfig.perNodeCost;
  const laborReduction = 0.3;
  const newLaborCost = tco.laborCosts * (1 - laborReduction);
  const newInfraCost = tco.infrastructureCost * 0.7;

  // Year costs
  const year1Cost =
    migrationCost +
    newLicenseCost * 0.5 +
    tco.licensingCost * 0.5 +
    tco.laborCosts * 1.2 +
    newInfraCost;

  const year2Cost =
    newLicenseCost + newLaborCost * 1.1 + newInfraCost + tco.trainingCost * 0.5;

  const year3Cost = newLicenseCost + newLaborCost + newInfraCost * 0.9;

  const threeYearTotal = year1Cost + year2Cost + year3Cost;

  // Breakeven
  const annualSavings = currentTco - year3Cost;
  const breakEvenMonths = annualSavings > 0 ? (migrationCost / annualSavings) * 12 : null;

  // NPV
  const savingsY1 = (currentTco - year1Cost) / (1 + discountRate);
  const savingsY2 = (currentTco - year2Cost) / Math.pow(1 + discountRate, 2);
  const savingsY3 = (currentTco - year3Cost) / Math.pow(1 + discountRate, 3);
  const npv3Year = savingsY1 + savingsY2 + savingsY3;

  // Risk
  const riskScore: 'low' | 'medium' | 'high' =
    platform === 'kubernetes' ? 'high' : platform === 'puppet' ? 'low' : 'medium';

  const current3Year = currentTco * 3;
  const savingsPercent = ((current3Year - threeYearTotal) / current3Year) * 100;

  return {
    name: `Migration to ${platformConfig.label}`,
    platform,
    migrationCost,
    year1Cost,
    year2Cost,
    year3Cost,
    threeYearTotal,
    breakEvenMonths,
    npv3Year,
    riskScore,
    annualSavings,
    savingsPercent,
  };
}

export function generateAnalysisReport(data: OrganizationData): AnalysisReport {
  const healthMetrics = calculateHealthMetrics(data);
  const costBreakdown = calculateTCO(data, healthMetrics);

  const perUnitCosts = {
    perNode: costBreakdown.totalAnnualTco / Math.max(1, data.infrastructure.totalManagedNodes),
    perCookbook: costBreakdown.totalAnnualTco / Math.max(1, data.cookbooks.activeCookbooks),
    perFte: costBreakdown.totalAnnualTco / Math.max(1, data.team.dedicatedEngineers),
  };

  const scenarios = (
    Object.keys(BENCHMARKS.alternatives) as Array<keyof typeof BENCHMARKS.alternatives>
  ).map((platform) => calculateScenario(data, costBreakdown, platform));

  // Sort by NPV
  scenarios.sort((a, b) => b.npv3Year - a.npv3Year);

  // Generate recommendations
  const recommendations: string[] = [];

  if (healthMetrics.cookbookRatio > 100) {
    recommendations.push(
      `CRITICAL: Consolidate cookbooks. Current ratio of ${healthMetrics.cookbookRatio.toFixed(0)}/1K nodes is unsustainable. Target: <25/1K nodes.`
    );
  }

  if (healthMetrics.debtMultiplier >= 1.5) {
    recommendations.push(
      `Technical debt is costing $${(costBreakdown.technicalDebtTax / 1e6).toFixed(1)}M/year. Invest in cookbook consolidation.`
    );
  }

  const bestScenario = scenarios[0];
  if (bestScenario && bestScenario.npv3Year > 0) {
    recommendations.push(
      `Consider ${bestScenario.name}. 3-year NPV: $${(bestScenario.npv3Year / 1e6).toFixed(1)}M. Breakeven: ${bestScenario.breakEvenMonths?.toFixed(0) || 'N/A'} months.`
    );
  }

  if (data.incidents.monthlyIncidents > 20) {
    recommendations.push(
      `High incident rate (${data.incidents.monthlyIncidents}/month) suggests stability issues. Prioritize reliability improvements.`
    );
  }

  return {
    summary: {
      totalNodes: data.infrastructure.totalManagedNodes,
      activeCookbooks: data.cookbooks.activeCookbooks,
      annualTco: costBreakdown.totalAnnualTco,
      perNodeCost: perUnitCosts.perNode,
      perCookbookCost: perUnitCosts.perCookbook,
      healthScore: healthMetrics.healthScore,
    },
    healthMetrics,
    costBreakdown,
    perUnitCosts,
    scenarios,
    recommendations,
  };
}

// Format helpers
export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}
