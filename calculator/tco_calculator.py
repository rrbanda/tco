#!/usr/bin/env python3
"""
Chef Infrastructure TCO Calculator

A data-driven Total Cost of Ownership calculator for Chef infrastructure estates.
Supports current state analysis and migration scenario comparisons.

Usage:
    python tco_calculator.py --input data.yaml --output results.json
    python tco_calculator.py --interactive
"""

import argparse
import json
import sys
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Tuple
from pathlib import Path

try:
    import yaml
    YAML_AVAILABLE = True
except ImportError:
    YAML_AVAILABLE = False
    print("Warning: PyYAML not installed. YAML input not available.")


# =============================================================================
# Data Classes
# =============================================================================

@dataclass
class InfrastructureData:
    """Infrastructure configuration data."""
    total_managed_nodes: int = 0
    production_nodes: int = 0
    staging_nodes: int = 0
    development_nodes: int = 0
    chef_server_count: int = 1
    monthly_server_cost: float = 4000.0
    chef_run_interval_minutes: int = 30


@dataclass
class CookbookData:
    """Cookbook estate data."""
    total_cookbooks: int = 0
    unique_cookbook_names: int = 0
    active_cookbooks: int = 0
    tier1_simple: int = 0
    tier2_standard: int = 0
    tier3_complex: int = 0
    avg_cookbooks_per_node: int = 10


@dataclass
class TeamData:
    """Team and labor data."""
    dedicated_engineers: int = 0
    part_time_contributors: int = 0
    part_time_allocation_pct: float = 20.0
    average_salary: float = 165000.0
    benefits_multiplier: float = 1.4


@dataclass
class IncidentData:
    """Incident and reliability data."""
    monthly_incidents: int = 0
    average_mttr_hours: float = 6.0
    engineers_per_incident: float = 2.5


@dataclass
class LicensingData:
    """Licensing and financial data."""
    annual_license_cost: float = 0.0
    negotiated_rate_per_node: float = 55.0
    annual_training_budget: float = 0.0
    monthly_cicd_cost: float = 0.0
    annual_contractor_spend: float = 0.0


@dataclass
class OrganizationData:
    """Complete organization data for TCO analysis."""
    infrastructure: InfrastructureData = field(default_factory=InfrastructureData)
    cookbooks: CookbookData = field(default_factory=CookbookData)
    team: TeamData = field(default_factory=TeamData)
    incidents: IncidentData = field(default_factory=IncidentData)
    licensing: LicensingData = field(default_factory=LicensingData)


@dataclass
class TCOBreakdown:
    """Detailed TCO cost breakdown."""
    licensing_cost: float = 0.0
    infrastructure_cost: float = 0.0
    platform_labor_cost: float = 0.0
    distributed_labor_cost: float = 0.0
    incident_cost: float = 0.0
    technical_debt_tax: float = 0.0
    training_cost: float = 0.0
    contractor_cost: float = 0.0
    opportunity_cost: float = 0.0
    
    @property
    def direct_costs(self) -> float:
        return self.licensing_cost + self.infrastructure_cost
    
    @property
    def labor_costs(self) -> float:
        return self.platform_labor_cost + self.distributed_labor_cost + self.incident_cost
    
    @property
    def total_annual_tco(self) -> float:
        return (
            self.licensing_cost +
            self.infrastructure_cost +
            self.platform_labor_cost +
            self.distributed_labor_cost +
            self.incident_cost +
            self.technical_debt_tax +
            self.training_cost +
            self.contractor_cost +
            self.opportunity_cost
        )


@dataclass
class HealthMetrics:
    """Infrastructure health assessment metrics."""
    cookbook_ratio: float = 0.0  # per 1000 nodes
    cookbooks_per_fte: float = 0.0
    debt_multiplier: float = 1.0
    health_score: str = "unknown"  # healthy, warning, critical
    issues: List[str] = field(default_factory=list)


@dataclass
class ScenarioResult:
    """Result of a migration scenario analysis."""
    name: str
    migration_cost: float
    year1_cost: float
    year2_cost: float
    year3_cost: float
    three_year_total: float
    breakeven_months: Optional[float]
    npv_3year: float
    risk_score: str  # low, medium, high


# =============================================================================
# Benchmark Data
# =============================================================================

BENCHMARKS = {
    "health_thresholds": {
        "cookbook_ratio": {"healthy": 25, "warning": 100, "critical": 500},
        "cookbooks_per_fte": {"healthy": 150, "warning": 75, "critical": 50},
        "runlist_size": {"healthy": 15, "warning": 30, "critical": 50},
    },
    "debt_multipliers": {
        25: 1.0,
        50: 1.1,
        100: 1.25,
        250: 1.5,
        500: 2.0,
        float('inf'): 2.5,
    },
    "migration": {
        "tier1_hours": 4,
        "tier2_hours": 16,
        "tier3_hours": 40,
        "learning_curve_months": 6,
        "learning_curve_penalty": 0.20,
    },
    "alternatives": {
        "ansible": {"per_node_cost": 75, "migration_factor": 1.0},
        "kubernetes": {"per_node_cost": 30, "migration_factor": 1.8},
        "terraform": {"per_node_cost": 20, "migration_factor": 1.2},
        "puppet": {"per_node_cost": 125, "migration_factor": 0.7},
    },
}


# =============================================================================
# Calculator Engine
# =============================================================================

class TCOCalculator:
    """Main TCO calculation engine."""
    
    def __init__(self, data: OrganizationData):
        self.data = data
        self.health_metrics: Optional[HealthMetrics] = None
        self.tco_breakdown: Optional[TCOBreakdown] = None
    
    def calculate_health_metrics(self) -> HealthMetrics:
        """Calculate infrastructure health metrics."""
        metrics = HealthMetrics()
        
        # Calculate cookbook ratio (per 1000 nodes)
        if self.data.infrastructure.total_managed_nodes > 0:
            metrics.cookbook_ratio = (
                self.data.cookbooks.active_cookbooks / 
                self.data.infrastructure.total_managed_nodes
            ) * 1000
        
        # Calculate cookbooks per FTE
        total_fte = (
            self.data.team.dedicated_engineers +
            self.data.team.part_time_contributors * 
            (self.data.team.part_time_allocation_pct / 100)
        )
        if total_fte > 0:
            metrics.cookbooks_per_fte = self.data.cookbooks.active_cookbooks / total_fte
        
        # Calculate debt multiplier
        metrics.debt_multiplier = self._get_debt_multiplier(metrics.cookbook_ratio)
        
        # Determine health score and issues
        thresholds = BENCHMARKS["health_thresholds"]
        
        if metrics.cookbook_ratio > thresholds["cookbook_ratio"]["critical"]:
            metrics.health_score = "critical"
            metrics.issues.append(
                f"Cookbook ratio ({metrics.cookbook_ratio:.1f}/1K nodes) is critical. "
                f"Target: <{thresholds['cookbook_ratio']['healthy']}"
            )
        elif metrics.cookbook_ratio > thresholds["cookbook_ratio"]["healthy"]:
            # Between healthy and critical thresholds = warning
            metrics.health_score = "warning"
            metrics.issues.append(
                f"Cookbook ratio ({metrics.cookbook_ratio:.1f}/1K nodes) exceeds healthy threshold. "
                f"Target: <{thresholds['cookbook_ratio']['healthy']}"
            )
        else:
            metrics.health_score = "healthy"
        
        if metrics.cookbooks_per_fte > 300:
            metrics.issues.append(
                f"FTE efficiency ({metrics.cookbooks_per_fte:.0f} cookbooks/FTE) may indicate understaffing"
            )
        elif metrics.cookbooks_per_fte < thresholds["cookbooks_per_fte"]["critical"]:
            if metrics.health_score == "healthy":
                metrics.health_score = "warning"
            metrics.issues.append(
                f"Low FTE efficiency ({metrics.cookbooks_per_fte:.0f} cookbooks/FTE) suggests complexity"
            )
        
        self.health_metrics = metrics
        return metrics
    
    def _get_debt_multiplier(self, cookbook_ratio: float) -> float:
        """Get the technical debt multiplier based on cookbook ratio."""
        for threshold, multiplier in sorted(BENCHMARKS["debt_multipliers"].items()):
            if cookbook_ratio <= threshold:
                return multiplier
        return 2.5  # Maximum multiplier
    
    def calculate_tco(self) -> TCOBreakdown:
        """Calculate complete TCO breakdown."""
        if self.health_metrics is None:
            self.calculate_health_metrics()
        
        breakdown = TCOBreakdown()
        
        # Direct Costs
        breakdown.licensing_cost = self.data.licensing.annual_license_cost
        breakdown.infrastructure_cost = (
            self.data.infrastructure.chef_server_count *
            self.data.infrastructure.monthly_server_cost * 12 +
            self.data.licensing.monthly_cicd_cost * 12
        )
        
        # Labor Costs
        fully_loaded_salary = (
            self.data.team.average_salary * 
            self.data.team.benefits_multiplier
        )
        
        breakdown.platform_labor_cost = (
            self.data.team.dedicated_engineers * fully_loaded_salary
        )
        
        breakdown.distributed_labor_cost = (
            self.data.team.part_time_contributors *
            (self.data.team.part_time_allocation_pct / 100) *
            fully_loaded_salary
        )
        
        # Incident Costs
        hourly_rate = fully_loaded_salary / 2080  # Hours per year
        breakdown.incident_cost = (
            self.data.incidents.monthly_incidents * 12 *
            self.data.incidents.average_mttr_hours *
            self.data.incidents.engineers_per_incident *
            hourly_rate
        )
        
        # Technical Debt Tax (applied to labor costs)
        base_labor = breakdown.platform_labor_cost + breakdown.distributed_labor_cost
        breakdown.technical_debt_tax = base_labor * (self.health_metrics.debt_multiplier - 1)
        
        # Other Costs
        breakdown.training_cost = self.data.licensing.annual_training_budget
        breakdown.contractor_cost = self.data.licensing.annual_contractor_spend
        
        # Opportunity Cost (conservative 15% of labor)
        breakdown.opportunity_cost = breakdown.labor_costs * 0.15
        
        self.tco_breakdown = breakdown
        return breakdown
    
    def calculate_per_unit_costs(self) -> Dict[str, float]:
        """Calculate per-node and per-cookbook costs."""
        if self.tco_breakdown is None:
            self.calculate_tco()
        
        total_tco = self.tco_breakdown.total_annual_tco
        
        return {
            "per_node": total_tco / max(1, self.data.infrastructure.total_managed_nodes),
            "per_cookbook": total_tco / max(1, self.data.cookbooks.active_cookbooks),
            "per_fte": total_tco / max(1, self.data.team.dedicated_engineers),
        }
    
    def calculate_migration_cost(self, target_platform: str) -> float:
        """Calculate one-time migration cost to target platform."""
        if target_platform not in BENCHMARKS["alternatives"]:
            raise ValueError(f"Unknown platform: {target_platform}")
        
        migration_config = BENCHMARKS["migration"]
        platform_config = BENCHMARKS["alternatives"][target_platform]
        
        # Calculate hours needed based on cookbook complexity
        total_hours = (
            self.data.cookbooks.tier1_simple * migration_config["tier1_hours"] +
            self.data.cookbooks.tier2_standard * migration_config["tier2_hours"] +
            self.data.cookbooks.tier3_complex * migration_config["tier3_hours"]
        )
        
        # Apply platform-specific migration factor
        total_hours *= platform_config["migration_factor"]
        
        # Calculate labor cost
        hourly_rate = (
            self.data.team.average_salary * 
            self.data.team.benefits_multiplier / 2080
        )
        labor_cost = total_hours * hourly_rate
        
        # Add training cost (2 weeks per engineer)
        training_cost = self.data.team.dedicated_engineers * 80 * hourly_rate
        
        # Add learning curve penalty (6 months at 20% reduced productivity)
        learning_cost = (
            self.data.team.dedicated_engineers *
            (self.data.team.average_salary * self.data.team.benefits_multiplier / 2) *
            migration_config["learning_curve_penalty"]
        )
        
        # Add tooling and setup (estimated at 10% of labor)
        tooling_cost = labor_cost * 0.10
        
        return labor_cost + training_cost + learning_cost + tooling_cost
    
    def calculate_scenario(
        self, 
        target_platform: str,
        discount_rate: float = 0.10
    ) -> ScenarioResult:
        """Calculate complete scenario analysis for migration to target platform."""
        if self.tco_breakdown is None:
            self.calculate_tco()
        
        current_tco = self.tco_breakdown.total_annual_tco
        migration_cost = self.calculate_migration_cost(target_platform)
        platform_config = BENCHMARKS["alternatives"][target_platform]
        
        # Estimate post-migration costs
        new_license_cost = (
            self.data.infrastructure.total_managed_nodes *
            platform_config["per_node_cost"]
        )
        
        # Assume 30% labor reduction after migration stabilizes
        labor_reduction = 0.30
        new_labor_cost = self.tco_breakdown.labor_costs * (1 - labor_reduction)
        
        # Reduced infrastructure (estimate 70% of current)
        new_infra_cost = self.tco_breakdown.infrastructure_cost * 0.70
        
        # Year 1: Migration cost + partial new costs + partial old costs
        year1_cost = (
            migration_cost +
            new_license_cost * 0.5 +  # Half year on new
            self.tco_breakdown.licensing_cost * 0.5 +  # Half year on old
            self.tco_breakdown.labor_costs * 1.2 +  # 20% overhead during migration
            new_infra_cost
        )
        
        # Year 2: Stabilization
        year2_cost = (
            new_license_cost +
            new_labor_cost * 1.1 +  # 10% overhead
            new_infra_cost +
            self.tco_breakdown.training_cost * 0.5
        )
        
        # Year 3: Steady state
        year3_cost = (
            new_license_cost +
            new_labor_cost +
            new_infra_cost * 0.9
        )
        
        three_year_total = year1_cost + year2_cost + year3_cost
        
        # Calculate breakeven
        annual_savings = current_tco - year3_cost
        if annual_savings > 0:
            breakeven_months = (migration_cost / annual_savings) * 12
        else:
            breakeven_months = None
        
        # Calculate NPV
        current_3yr = current_tco * 3
        savings_y1 = (current_tco - year1_cost) / (1 + discount_rate)
        savings_y2 = (current_tco - year2_cost) / ((1 + discount_rate) ** 2)
        savings_y3 = (current_tco - year3_cost) / ((1 + discount_rate) ** 3)
        npv = savings_y1 + savings_y2 + savings_y3
        
        # Risk assessment
        if target_platform == "kubernetes":
            risk_score = "high"
        elif target_platform in ["ansible", "terraform"]:
            risk_score = "medium"
        else:
            risk_score = "low"
        
        return ScenarioResult(
            name=f"Migration to {target_platform.title()}",
            migration_cost=migration_cost,
            year1_cost=year1_cost,
            year2_cost=year2_cost,
            year3_cost=year3_cost,
            three_year_total=three_year_total,
            breakeven_months=breakeven_months,
            npv_3year=npv,
            risk_score=risk_score,
        )
    
    def generate_report(self) -> Dict:
        """Generate complete TCO analysis report."""
        if self.health_metrics is None:
            self.calculate_health_metrics()
        if self.tco_breakdown is None:
            self.calculate_tco()
        
        per_unit = self.calculate_per_unit_costs()
        
        scenarios = {}
        for platform in BENCHMARKS["alternatives"].keys():
            scenarios[platform] = asdict(self.calculate_scenario(platform))
        
        return {
            "summary": {
                "total_nodes": self.data.infrastructure.total_managed_nodes,
                "active_cookbooks": self.data.cookbooks.active_cookbooks,
                "annual_tco": self.tco_breakdown.total_annual_tco,
                "per_node_cost": per_unit["per_node"],
                "per_cookbook_cost": per_unit["per_cookbook"],
                "health_score": self.health_metrics.health_score,
            },
            "health_metrics": asdict(self.health_metrics),
            "cost_breakdown": asdict(self.tco_breakdown),
            "per_unit_costs": per_unit,
            "scenarios": scenarios,
            "recommendations": self._generate_recommendations(),
        }
    
    def _generate_recommendations(self) -> List[str]:
        """Generate actionable recommendations based on analysis."""
        recommendations = []
        
        if self.health_metrics.cookbook_ratio > 100:
            recommendations.append(
                f"CRITICAL: Consolidate cookbooks. Current ratio of "
                f"{self.health_metrics.cookbook_ratio:.0f}/1K nodes is unsustainable. "
                f"Target: <25/1K nodes through wrapper cookbook consolidation."
            )
        
        if self.health_metrics.debt_multiplier >= 1.5:
            savings = self.tco_breakdown.technical_debt_tax
            recommendations.append(
                f"Technical debt is costing ${savings:,.0f}/year. "
                f"Invest in cookbook consolidation to reduce multiplier from "
                f"{self.health_metrics.debt_multiplier:.2f}x to 1.0x."
            )
        
        # Find best scenario
        best_scenario = None
        best_npv = float('-inf')
        for platform in BENCHMARKS["alternatives"].keys():
            scenario = self.calculate_scenario(platform)
            if scenario.npv_3year > best_npv:
                best_npv = scenario.npv_3year
                best_scenario = scenario
        
        if best_scenario and best_scenario.npv_3year > 0:
            recommendations.append(
                f"Consider {best_scenario.name}. 3-year NPV: ${best_scenario.npv_3year:,.0f}. "
                f"Breakeven: {best_scenario.breakeven_months:.0f} months. "
                f"Risk: {best_scenario.risk_score}."
            )
        
        if self.data.incidents.monthly_incidents > 20:
            recommendations.append(
                f"High incident rate ({self.data.incidents.monthly_incidents}/month) suggests "
                f"stability issues. Prioritize reliability improvements before migration."
            )
        
        return recommendations


# =============================================================================
# Data Loading
# =============================================================================

def load_from_yaml(filepath: str) -> OrganizationData:
    """Load organization data from YAML file."""
    if not YAML_AVAILABLE:
        raise ImportError("PyYAML required for YAML input. Install with: pip install pyyaml")
    
    with open(filepath, 'r') as f:
        raw_data = yaml.safe_load(f)
    
    # Parse the data into our dataclasses
    data = OrganizationData()
    
    if 'infrastructure' in raw_data:
        infra = raw_data['infrastructure']
        data.infrastructure.total_managed_nodes = _get_value(infra, 'total_managed_nodes')
        if 'node_breakdown' in infra:
            data.infrastructure.production_nodes = _get_value(infra['node_breakdown'], 'production')
            data.infrastructure.staging_nodes = _get_value(infra['node_breakdown'], 'staging')
            data.infrastructure.development_nodes = _get_value(infra['node_breakdown'], 'development')
        if 'chef_server_topology' in infra:
            data.infrastructure.chef_server_count = _get_value(infra['chef_server_topology'], 'server_count')
    
    if 'cookbooks' in raw_data:
        cb = raw_data['cookbooks']
        data.cookbooks.total_cookbooks = _get_value(cb, 'total_cookbooks')
        data.cookbooks.unique_cookbook_names = _get_value(cb, 'unique_cookbook_names')
        data.cookbooks.active_cookbooks = _get_value(cb, 'active_cookbooks')
        if 'complexity_distribution' in cb:
            data.cookbooks.tier1_simple = _get_value(cb['complexity_distribution'], 'tier1_simple')
            data.cookbooks.tier2_standard = _get_value(cb['complexity_distribution'], 'tier2_standard')
            data.cookbooks.tier3_complex = _get_value(cb['complexity_distribution'], 'tier3_complex')
    
    if 'team' in raw_data:
        team = raw_data['team']
        data.team.dedicated_engineers = _get_value(team, 'dedicated_chef_engineers')
        if 'compensation' in team:
            data.team.average_salary = _get_value(team['compensation'], 'average_engineer_salary')
            data.team.benefits_multiplier = _get_value(team['compensation'], 'benefits_multiplier')
    
    if 'incidents' in raw_data:
        inc = raw_data['incidents']
        if 'chef_related_incidents' in inc:
            data.incidents.monthly_incidents = _get_value(inc['chef_related_incidents'], 'monthly_average')
    
    if 'licensing' in raw_data:
        lic = raw_data['licensing']
        if 'current_chef_license' in lic:
            data.licensing.annual_license_cost = _get_value(lic['current_chef_license'], 'annual_cost')
    
    return data


def _get_value(data: dict, key: str, default=0):
    """Extract value from nested dict, handling confidence-wrapped values."""
    if key not in data:
        return default
    val = data[key]
    if isinstance(val, dict) and 'value' in val:
        return val['value']
    return val


def create_sample_data() -> OrganizationData:
    """Create sample data for 200K node / 90K cookbook scenario."""
    return OrganizationData(
        infrastructure=InfrastructureData(
            total_managed_nodes=200000,
            production_nodes=150000,
            staging_nodes=30000,
            development_nodes=20000,
            chef_server_count=12,
            monthly_server_cost=4000.0,
            chef_run_interval_minutes=30,
        ),
        cookbooks=CookbookData(
            total_cookbooks=90000,
            unique_cookbook_names=15000,
            active_cookbooks=12000,
            tier1_simple=7200,  # 60%
            tier2_standard=3600,  # 30%
            tier3_complex=1200,  # 10%
            avg_cookbooks_per_node=8,
        ),
        team=TeamData(
            dedicated_engineers=45,
            part_time_contributors=120,
            part_time_allocation_pct=20.0,
            average_salary=165000.0,
            benefits_multiplier=1.4,
        ),
        incidents=IncidentData(
            monthly_incidents=25,
            average_mttr_hours=6.0,
            engineers_per_incident=2.5,
        ),
        licensing=LicensingData(
            annual_license_cost=11000000.0,
            negotiated_rate_per_node=55.0,
            annual_training_budget=150000.0,
            monthly_cicd_cost=15000.0,
            annual_contractor_spend=500000.0,
        ),
    )


# =============================================================================
# CLI Interface
# =============================================================================

def format_currency(value: float) -> str:
    """Format value as currency string."""
    if value >= 1_000_000:
        return f"${value/1_000_000:.2f}M"
    elif value >= 1_000:
        return f"${value/1_000:.1f}K"
    else:
        return f"${value:.2f}"


def print_report(report: Dict):
    """Print formatted report to console."""
    print("\n" + "=" * 70)
    print("CHEF INFRASTRUCTURE TCO ANALYSIS REPORT")
    print("=" * 70)
    
    # Summary
    print("\n📊 EXECUTIVE SUMMARY")
    print("-" * 40)
    s = report["summary"]
    print(f"  Total Managed Nodes:    {s['total_nodes']:,}")
    print(f"  Active Cookbooks:       {s['active_cookbooks']:,}")
    print(f"  Annual TCO:             {format_currency(s['annual_tco'])}")
    print(f"  Cost per Node:          {format_currency(s['per_node_cost'])}")
    print(f"  Cost per Cookbook:      {format_currency(s['per_cookbook_cost'])}")
    print(f"  Health Score:           {s['health_score'].upper()}")
    
    # Health Metrics
    print("\n🏥 HEALTH METRICS")
    print("-" * 40)
    h = report["health_metrics"]
    print(f"  Cookbook Ratio:         {h['cookbook_ratio']:.1f} per 1,000 nodes")
    print(f"  Cookbooks per FTE:      {h['cookbooks_per_fte']:.0f}")
    print(f"  Debt Multiplier:        {h['debt_multiplier']:.2f}x")
    if h["issues"]:
        print("\n  Issues:")
        for issue in h["issues"]:
            print(f"    ⚠️  {issue}")
    
    # Cost Breakdown
    print("\n💰 ANNUAL COST BREAKDOWN")
    print("-" * 40)
    c = report["cost_breakdown"]
    print(f"  Licensing:              {format_currency(c['licensing_cost'])}")
    print(f"  Infrastructure:         {format_currency(c['infrastructure_cost'])}")
    print(f"  Platform Labor:         {format_currency(c['platform_labor_cost'])}")
    print(f"  Distributed Labor:      {format_currency(c['distributed_labor_cost'])}")
    print(f"  Incident Response:      {format_currency(c['incident_cost'])}")
    print(f"  Technical Debt Tax:     {format_currency(c['technical_debt_tax'])}")
    print(f"  Training:               {format_currency(c['training_cost'])}")
    print(f"  Contractors:            {format_currency(c['contractor_cost'])}")
    print(f"  Opportunity Cost:       {format_currency(c['opportunity_cost'])}")
    print(f"  {'─' * 38}")
    print(f"  TOTAL:                  {format_currency(c['licensing_cost'] + c['infrastructure_cost'] + c['platform_labor_cost'] + c['distributed_labor_cost'] + c['incident_cost'] + c['technical_debt_tax'] + c['training_cost'] + c['contractor_cost'] + c['opportunity_cost'])}")
    
    # Scenarios
    print("\n🔄 MIGRATION SCENARIOS (3-Year Analysis)")
    print("-" * 70)
    print(f"{'Platform':<15} {'Migration':<12} {'3-Yr Total':<14} {'Breakeven':<12} {'NPV':<12} {'Risk':<8}")
    print("-" * 70)
    for platform, scenario in report["scenarios"].items():
        breakeven = f"{scenario['breakeven_months']:.0f} mo" if scenario['breakeven_months'] else "N/A"
        print(f"{platform.title():<15} {format_currency(scenario['migration_cost']):<12} "
              f"{format_currency(scenario['three_year_total']):<14} {breakeven:<12} "
              f"{format_currency(scenario['npv_3year']):<12} {scenario['risk_score']:<8}")
    
    # Current state comparison
    current_3yr = s['annual_tco'] * 3
    print(f"\n  Current Chef (3-year):  {format_currency(current_3yr)}")
    
    # Recommendations
    print("\n📋 RECOMMENDATIONS")
    print("-" * 40)
    for i, rec in enumerate(report["recommendations"], 1):
        print(f"  {i}. {rec}")
    
    print("\n" + "=" * 70)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Chef Infrastructure TCO Calculator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python tco_calculator.py --sample                    # Run with sample data
  python tco_calculator.py --input data.yaml           # Load from YAML
  python tco_calculator.py --input data.yaml --json    # Output as JSON
        """
    )
    parser.add_argument("--input", "-i", help="Input YAML file path")
    parser.add_argument("--output", "-o", help="Output file path for JSON results")
    parser.add_argument("--sample", "-s", action="store_true", help="Use sample data (200K nodes)")
    parser.add_argument("--json", "-j", action="store_true", help="Output as JSON")
    
    args = parser.parse_args()
    
    # Load data
    if args.sample:
        data = create_sample_data()
        print("Using sample data: 200,000 nodes, 90,000 cookbooks")
    elif args.input:
        data = load_from_yaml(args.input)
    else:
        # Default to sample data if no input
        data = create_sample_data()
        print("No input specified. Using sample data: 200,000 nodes, 90,000 cookbooks")
    
    # Calculate TCO
    calculator = TCOCalculator(data)
    report = calculator.generate_report()
    
    # Output results
    if args.json or args.output:
        json_output = json.dumps(report, indent=2, default=str)
        if args.output:
            with open(args.output, 'w') as f:
                f.write(json_output)
            print(f"Report saved to: {args.output}")
        else:
            print(json_output)
    else:
        print_report(report)


if __name__ == "__main__":
    main()
