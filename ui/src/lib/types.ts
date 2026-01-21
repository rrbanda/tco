// TCO Calculator Types

export interface InfrastructureData {
  totalManagedNodes: number;
  productionNodes: number;
  stagingNodes: number;
  developmentNodes: number;
  chefServerCount: number;
  monthlyServerCost: number;
  chefRunIntervalMinutes: number;
}

export interface CookbookData {
  totalCookbooks: number;
  uniqueCookbookNames: number;
  activeCookbooks: number;
  tier1Simple: number;
  tier2Standard: number;
  tier3Complex: number;
  avgCookbooksPerNode: number;
}

export interface TeamData {
  dedicatedEngineers: number;
  partTimeContributors: number;
  partTimeAllocationPct: number;
  averageSalary: number;
  benefitsMultiplier: number;
}

export interface IncidentData {
  monthlyIncidents: number;
  averageMttrHours: number;
  engineersPerIncident: number;
}

export interface LicensingData {
  annualLicenseCost: number;
  negotiatedRatePerNode: number;
  annualTrainingBudget: number;
  monthlyCicdCost: number;
  annualContractorSpend: number;
}

export interface OrganizationData {
  infrastructure: InfrastructureData;
  cookbooks: CookbookData;
  team: TeamData;
  incidents: IncidentData;
  licensing: LicensingData;
}

export interface TCOBreakdown {
  licensingCost: number;
  infrastructureCost: number;
  platformLaborCost: number;
  distributedLaborCost: number;
  incidentCost: number;
  technicalDebtTax: number;
  trainingCost: number;
  contractorCost: number;
  opportunityCost: number;
  directCosts: number;
  laborCosts: number;
  totalAnnualTco: number;
}

export interface HealthMetrics {
  cookbookRatio: number;
  cookbooksPerFte: number;
  debtMultiplier: number;
  healthScore: 'healthy' | 'warning' | 'critical';
  issues: string[];
}

export interface ScenarioResult {
  name: string;
  platform: string;
  migrationCost: number;
  year1Cost: number;
  year2Cost: number;
  year3Cost: number;
  threeYearTotal: number;
  breakEvenMonths: number | null;
  npv3Year: number;
  riskScore: 'low' | 'medium' | 'high';
  annualSavings: number;
  savingsPercent: number;
}

export interface AnalysisReport {
  summary: {
    totalNodes: number;
    activeCookbooks: number;
    annualTco: number;
    perNodeCost: number;
    perCookbookCost: number;
    healthScore: string;
  };
  healthMetrics: HealthMetrics;
  costBreakdown: TCOBreakdown;
  perUnitCosts: {
    perNode: number;
    perCookbook: number;
    perFte: number;
  };
  scenarios: ScenarioResult[];
  recommendations: string[];
}

export interface Benchmark {
  metric: string;
  healthy: string;
  warning: string;
  critical: string;
  current: number;
  status: 'healthy' | 'warning' | 'critical';
}

export type TabId = 'dashboard' | 'data' | 'benchmarks' | 'scenarios' | 'report' | 'help';
