# Chef Infrastructure TCO Analysis Toolkit

A comprehensive, data-driven framework for calculating the Total Cost of Ownership (TCO) of Chef infrastructure estates and evaluating modernization alternatives.

## Overview

This toolkit enables organizations to:

- **Quantify** the true cost of maintaining Chef infrastructure (licensing, labor, technical debt)
- **Benchmark** against industry standards and identify health issues
- **Compare** migration scenarios (Ansible, Kubernetes/GitOps, Terraform, Puppet)
- **Present** findings with executive-ready reports and visualizations

## Quick Start

### Option 1: Python Calculator (Fastest)

```bash
cd calculator
python tco_calculator.py --sample
```

This runs the analysis with sample data (200,000 nodes, 90,000 cookbooks) and outputs a formatted report.

### Option 2: Jupyter Notebook (Interactive)

```bash
cd analysis
jupyter notebook chef_tco_analysis.ipynb
```

Provides interactive analysis with visualizations and sensitivity testing.

### Option 3: Custom Data

1. Copy the data collection template:
   ```bash
   cp templates/data_collection.yaml my_org_data.yaml
   ```

2. Fill in your organization's data

3. Run analysis:
   ```bash
   python calculator/tco_calculator.py --input my_org_data.yaml --json > results.json
   ```

## Directory Structure

```
chef-tco-toolkit/
├── README.md                              # This file
├── docs/
│   ├── methodology.md                     # Full methodology with formulas
│   └── executive-summary-template.md      # Template for presenting findings
├── calculator/
│   ├── tco_calculator.py                  # Python TCO calculator
│   ├── tco_calculator_inputs.csv          # Sample input data (CSV)
│   ├── tco_calculator_benchmarks.csv      # Industry benchmarks
│   └── scenario_comparison.csv            # Pre-calculated scenarios
├── analysis/
│   ├── chef_tco_analysis.ipynb           # Jupyter notebook
│   ├── sample_data.yaml                   # Sample organization data
│   └── visualizations/                    # Generated charts
└── templates/
    ├── data_collection.yaml               # Data gathering template
    └── stakeholder_interview.md           # Interview guide
```

## Key Features

### 1. Hypothesis-Driven Analysis

The toolkit tests specific hypotheses about infrastructure costs:

| Hypothesis | Metric | Threshold |
|------------|--------|-----------|
| Cookbook sprawl increases costs non-linearly | Cookbooks per 1,000 nodes | >500 triggers 2.5x multiplier |
| Technical debt correlates with incidents | Cookbook-to-node ratio | >0.1 indicates debt |
| Modern alternatives reduce TCO by 30-50% | 3-year comparison | Breakeven within 18 months |

### 2. Industry Benchmarks

Compare your metrics against validated industry baselines:

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Cookbooks per 1,000 nodes | 5-25 | 25-100 | >100 |
| Cookbooks per FTE | 150-250 | 75-150 | <75 |
| Technical Debt Multiplier | 1.0x | 1.1-1.5x | >1.5x |

### 3. Multi-Scenario Comparison

Evaluate four alternatives with full financial modeling:

- **Ansible** - Configuration management modernization
- **Kubernetes/GitOps** - Cloud-native transformation
- **Terraform** - Infrastructure as code migration
- **Chef Optimization** - Stay and consolidate

### 4. Visualization Suite

Generate presentation-ready charts:
- TCO waterfall breakdown
- Benchmark comparison gauges
- Scenario NPV comparison
- Year-over-year cost projections
- Sensitivity tornado diagrams

## Requirements

### Python Calculator

```bash
pip install pyyaml
```

### Jupyter Notebook (Full Analysis)

```bash
pip install pyyaml pandas numpy matplotlib seaborn plotly jupyter
```

## Usage Examples

### Calculate TCO from YAML Data

```python
from tco_calculator import TCOCalculator, load_from_yaml

# Load data
data = load_from_yaml('my_org_data.yaml')

# Create calculator
calculator = TCOCalculator(data)

# Get health metrics
health = calculator.calculate_health_metrics()
print(f"Cookbook Ratio: {health.cookbook_ratio:.1f} per 1,000 nodes")
print(f"Health Score: {health.health_score}")

# Calculate TCO
tco = calculator.calculate_tco()
print(f"Annual TCO: ${tco.total_annual_tco:,.0f}")

# Compare scenarios
for platform in ['ansible', 'kubernetes', 'terraform']:
    scenario = calculator.calculate_scenario(platform)
    print(f"{platform.title()}: 3-year NPV = ${scenario.npv_3year:,.0f}")
```

### Generate Full Report

```python
report = calculator.generate_report()

# Access results
print(f"Per-node cost: ${report['per_unit_costs']['per_node']:.2f}")
print(f"Per-cookbook cost: ${report['per_unit_costs']['per_cookbook']:.2f}")

# Get recommendations
for rec in report['recommendations']:
    print(f"- {rec}")
```

### Command Line

```bash
# Sample data analysis
python tco_calculator.py --sample

# Custom data with JSON output
python tco_calculator.py --input data.yaml --json

# Save to file
python tco_calculator.py --input data.yaml --output report.json
```

## Cost Model

The TCO calculation uses this formula:

```
Annual TCO = Direct Costs + (Labor Costs × Debt Multiplier) + Opportunity Cost
```

Where:
- **Direct Costs** = Licensing + Infrastructure + Tooling
- **Labor Costs** = Platform Team + Distributed Effort + Incident Response
- **Debt Multiplier** = 1.0x to 2.5x based on cookbook ratio
- **Opportunity Cost** = 15% of labor (conservative)

### Technical Debt Multiplier Scale

| Cookbook Ratio (per 1K nodes) | Multiplier |
|-------------------------------|------------|
| <25 | 1.00x |
| 25-50 | 1.10x |
| 50-100 | 1.25x |
| 100-250 | 1.50x |
| 250-500 | 2.00x |
| >500 | 2.50x |

## Data Collection

### Required Data Categories

1. **Infrastructure**: Node counts, server topology, run intervals
2. **Cookbooks**: Total count, active count, complexity distribution
3. **Team**: Dedicated FTEs, part-time contributors, salaries
4. **Incidents**: Monthly count, MTTR, severity distribution
5. **Financial**: License costs, infrastructure costs, training budget

### Data Quality Scoring

Each data point receives a confidence score:

| Score | Definition |
|-------|------------|
| 5 | Verified from system of record |
| 4 | Estimated from reliable sampling |
| 3 | Educated estimate with validation |
| 2 | Rough estimate |
| 1 | Unknown, using industry default |

## Sample Analysis Output

Running with the 200K node sample data:

```
CHEF INFRASTRUCTURE TCO ANALYSIS REPORT
======================================================================

EXECUTIVE SUMMARY
----------------------------------------
  Total Managed Nodes:    200,000
  Active Cookbooks:       12,000
  Annual TCO:             $29.4M
  Cost per Node:          $147.01
  Cost per Cookbook:      $2,450.11
  Health Score:           CRITICAL

HEALTH METRICS
----------------------------------------
  Cookbook Ratio:         60.0 per 1,000 nodes
  Cookbooks per FTE:      175
  Debt Multiplier:        1.25x

MIGRATION SCENARIOS (3-Year Analysis)
----------------------------------------------------------------------
Platform         Migration    3-Yr Total     Breakeven    NPV          Risk    
----------------------------------------------------------------------
Ansible          $8.5M        $66.2M         22 mo        $15.2M       medium  
Kubernetes       $15.0M       $52.4M         28 mo        $24.8M       high    
Terraform        $6.2M        $48.1M         16 mo        $28.5M       medium  
Puppet           $5.1M        $71.8M         19 mo        $8.4M        low     

RECOMMENDATIONS
----------------------------------------
1. CRITICAL: Consolidate cookbooks. Current ratio of 60/1K nodes is unsustainable.
2. Technical debt is costing $2.7M/year. Invest in cookbook consolidation.
3. Consider Migration to Terraform. 3-year NPV: $28.5M. Breakeven: 16 months.
```

## Customization

### Adding Custom Benchmarks

Edit `calculator/tco_calculator.py` to modify the `BENCHMARKS` dictionary:

```python
BENCHMARKS = {
    "health_thresholds": {
        "cookbook_ratio": {"healthy": 25, "warning": 100, "critical": 500},
        # Add your custom thresholds
    },
    # ...
}
```

### Custom Scenario Parameters

Modify the `alternatives` section to add or adjust platforms:

```python
"alternatives": {
    "ansible": {"per_node_cost": 75, "migration_factor": 1.0},
    "my_platform": {"per_node_cost": 50, "migration_factor": 0.8},
}
```

## Contributing

Contributions welcome! Areas for improvement:

- Additional platform comparisons
- Regional cost adjustments
- More sophisticated migration modeling
- Integration with Chef Automate APIs
- Monte Carlo simulation for uncertainty

## License

MIT License - See LICENSE file for details.

## References

### Official Documentation
- [Chef Server Capacity Planning](https://docs.chef.io/server/capacity_planning/)
- [Chef Automate HA Performance](https://docs.chef.io/automate/ha_performance_benchmarks/)
- [Chef Pricing](https://www.chef.io/how-to-buy)

### Industry Research
- Gartner Infrastructure Management Cost Benchmarks
- Forrester Total Economic Impact Studies
- DevOps Institute State of DevOps Reports

---

*Built for data-driven infrastructure decision making*
