import type { OrganizationData } from '../lib/types';

export const sampleData: OrganizationData = {
  infrastructure: {
    totalManagedNodes: 200000,
    productionNodes: 150000,
    stagingNodes: 30000,
    developmentNodes: 20000,
    chefServerCount: 12,
    monthlyServerCost: 4000,
    chefRunIntervalMinutes: 30,
  },
  cookbooks: {
    totalCookbooks: 90000,
    uniqueCookbookNames: 15000,
    activeCookbooks: 12000,
    tier1Simple: 7200,
    tier2Standard: 3600,
    tier3Complex: 1200,
    avgCookbooksPerNode: 8,
  },
  team: {
    dedicatedEngineers: 45,
    partTimeContributors: 120,
    partTimeAllocationPct: 20,
    averageSalary: 165000,
    benefitsMultiplier: 1.4,
  },
  incidents: {
    monthlyIncidents: 25,
    averageMttrHours: 6,
    engineersPerIncident: 2.5,
  },
  licensing: {
    annualLicenseCost: 11000000,
    negotiatedRatePerNode: 55,
    annualTrainingBudget: 150000,
    monthlyCicdCost: 15000,
    annualContractorSpend: 500000,
  },
};

export const defaultData: OrganizationData = {
  infrastructure: {
    totalManagedNodes: 10000,
    productionNodes: 7000,
    stagingNodes: 2000,
    developmentNodes: 1000,
    chefServerCount: 3,
    monthlyServerCost: 4000,
    chefRunIntervalMinutes: 30,
  },
  cookbooks: {
    totalCookbooks: 500,
    uniqueCookbookNames: 200,
    activeCookbooks: 150,
    tier1Simple: 90,
    tier2Standard: 45,
    tier3Complex: 15,
    avgCookbooksPerNode: 10,
  },
  team: {
    dedicatedEngineers: 5,
    partTimeContributors: 15,
    partTimeAllocationPct: 20,
    averageSalary: 165000,
    benefitsMultiplier: 1.4,
  },
  incidents: {
    monthlyIncidents: 5,
    averageMttrHours: 4,
    engineersPerIncident: 2,
  },
  licensing: {
    annualLicenseCost: 550000,
    negotiatedRatePerNode: 55,
    annualTrainingBudget: 25000,
    monthlyCicdCost: 2000,
    annualContractorSpend: 50000,
  },
};

export const presetScenarios = [
  {
    id: 'small',
    name: 'Small Enterprise',
    description: '5,000 nodes, 100 cookbooks',
    nodes: 5000,
    cookbooks: 100,
  },
  {
    id: 'medium',
    name: 'Medium Enterprise',
    description: '25,000 nodes, 500 cookbooks',
    nodes: 25000,
    cookbooks: 500,
  },
  {
    id: 'large',
    name: 'Large Enterprise',
    description: '100,000 nodes, 5,000 cookbooks',
    nodes: 100000,
    cookbooks: 5000,
  },
  {
    id: 'ultra',
    name: 'Ultra-Scale (Sample)',
    description: '200,000 nodes, 90,000 cookbooks',
    nodes: 200000,
    cookbooks: 90000,
  },
];
