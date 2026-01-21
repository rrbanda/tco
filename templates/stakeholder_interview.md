# Chef TCO Analysis - Stakeholder Interview Guide

## Purpose

This guide provides structured questions for gathering data from key stakeholders during a Chef infrastructure TCO assessment. Use these interviews to supplement automated data collection and capture qualitative insights.

---

## Interview Preparation

### Before the Interview
- [ ] Review available Chef Automate dashboards
- [ ] Gather preliminary metrics (node counts, cookbook counts)
- [ ] Identify known pain points from support tickets
- [ ] Prepare organization-specific context questions

### Materials to Bring
- Data collection template (data_collection.yaml)
- Organization chart for Chef responsibilities
- Recent incident reports (last 12 months)
- Current licensing agreement summary

---

## Interview Sections

### 1. Platform Engineering Lead (45-60 min)

**Infrastructure Overview**
1. How many nodes are currently managed by Chef? (Verify against Automate data)
2. What is the Chef server topology? (HA, regions, etc.)
3. What is the default Chef Client run interval?
4. Are there any known performance issues with the Chef infrastructure?

**Cookbook Management**
5. Approximately how many cookbooks are in active use?
6. What governance process exists for cookbook creation and versioning?
7. What percentage of cookbooks would you classify as:
   - Simple configuration (Tier 1)
   - Standard application deployment (Tier 2)
   - Complex with many dependencies (Tier 3)
8. What is the average run-list size per node?

**Team & Process**
9. How many engineers are dedicated full-time to Chef platform work?
10. What is the process for cookbook testing and promotion?
11. What CI/CD tools are used for cookbook development?
12. What are the biggest pain points in managing the Chef estate?

**Technical Debt**
13. How many cookbooks have not been updated in the last 12 months?
14. Are there known deprecated patterns still in use?
15. What would be required to reduce the cookbook count by 50%?

---

### 2. DevOps/Application Teams (30-45 min per team)

**Usage Patterns**
1. How many cookbooks does your team maintain?
2. How much time does your team spend on Chef-related work weekly?
3. Do you create custom cookbooks or use shared/library cookbooks?
4. What triggers cookbook updates in your team?

**Pain Points**
5. What are the most frustrating aspects of working with Chef?
6. How often do Chef-related issues block deployments?
7. How confident are you in making changes to cookbooks?
8. What training or documentation gaps exist?

**Alternatives**
9. Does your team use any non-Chef configuration management?
10. If you could choose, what tools would you prefer?
11. What would migration to a new platform mean for your team?

---

### 3. Finance/Procurement (30 min)

**Licensing**
1. What is the current annual Chef license cost?
2. What tier are we licensed at? (Business/Enterprise/Enterprise Plus)
3. When does the current contract expire?
4. What volume discounts are in the current agreement?
5. What is the year-over-year cost trend?

**Related Costs**
6. What infrastructure costs are allocated to Chef? (servers, storage, network)
7. Are there separate costs for Habitat, InSpec, or Automate?
8. What is the annual training budget for Chef?
9. Are there any contractor or consulting costs for Chef work?

**Budget Context**
10. What is the total infrastructure management budget?
11. What cost reduction targets exist for the next 3 years?
12. What is the approved budget for modernization initiatives?

---

### 4. IT Operations/SRE (30-45 min)

**Incident Management**
1. How many Chef-related incidents occur per month on average?
2. What is the average time to resolve Chef-related incidents?
3. What are the most common root causes?
4. How many engineers typically work on a Chef incident?

**Reliability**
5. How would you rate the overall reliability of Chef infrastructure? (1-10)
6. What percentage of outages involve Chef components?
7. Are there specific cookbooks that cause repeated issues?
8. What monitoring exists for Chef infrastructure?

**On-Call**
9. How often is Chef the cause of on-call pages?
10. What is the estimated cost of after-hours Chef support?
11. What improvements would most reduce incident volume?

---

### 5. Security/Compliance (30 min)

**Security Posture**
1. How are secrets managed in Chef cookbooks?
2. What security scanning is performed on cookbooks?
3. Are there known security vulnerabilities in current cookbooks?
4. What is the process for security patching cookbooks?

**Compliance**
5. What compliance frameworks apply? (SOC2, PCI, HIPAA, etc.)
6. How does Chef factor into compliance audits?
7. What audit trail exists for cookbook changes?
8. Are there compliance gaps in current Chef implementation?

**Migration Considerations**
9. What security/compliance requirements must any replacement meet?
10. What approval process exists for platform changes?
11. What is the typical timeline for security review of new tools?

---

### 6. Executive Sponsor (30 min)

**Strategic Context**
1. What are the primary drivers for evaluating Chef alternatives?
2. What is the expected timeline for making a decision?
3. What would success look like for a modernization initiative?
4. What are the non-negotiable requirements?

**Constraints**
5. What is the budget ceiling for migration/modernization?
6. Are there timeline constraints (contract renewals, etc.)?
7. What organizational changes are planned that might affect this?
8. What other initiatives compete for the same resources?

**Risk Tolerance**
9. What level of risk is acceptable during transition?
10. What would cause the project to be cancelled?
11. How important is maintaining status quo vs. innovation?

---

## Post-Interview Actions

### Data Consolidation
- [ ] Enter all quantitative data into data_collection.yaml
- [ ] Assign confidence scores to each data point
- [ ] Cross-validate conflicting information
- [ ] Document gaps for follow-up

### Qualitative Synthesis
- [ ] Summarize pain points and themes
- [ ] Identify political/organizational factors
- [ ] Note concerns about specific alternatives
- [ ] Capture quotes for executive summary

### Follow-Up Needed
- [ ] List specific data requests
- [ ] Schedule follow-up conversations
- [ ] Request access to systems/reports
- [ ] Clarify ambiguous responses

---

## Interview Notes Template

```
Interview: [Role/Team]
Date: [YYYY-MM-DD]
Attendees: [Names]
Duration: [X minutes]

Key Data Points:
- [Data point 1]: [Value] (Confidence: X/5)
- [Data point 2]: [Value] (Confidence: X/5)

Key Insights:
- [Insight 1]
- [Insight 2]

Pain Points Mentioned:
- [Pain point 1]
- [Pain point 2]

Quotes:
- "[Notable quote]" - [Speaker]

Follow-Up Items:
- [ ] [Action item 1]
- [ ] [Action item 2]

Confidence Assessment:
- Data reliability: [High/Medium/Low]
- Stakeholder engagement: [High/Medium/Low]
- Potential bias: [None/Some/Significant]
```
