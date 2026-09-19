import { DEVILS_ADVOCATE_DISCLAIMER, DIMENSION_IDS, type Analysis, type Finding } from "../types.js";

export const SAMPLE_DRAFT =
  "Rapid growth brought complexity. Based on feedback from employees, we are eliminating roles to become leaner and more agile. These changes will help us focus on what matters most.";

export function sampleFinding(overrides: Partial<Finding> = {}): Finding {
  return {
    id: "F-001",
    dimension: "accountability_agency",
    severity: "High",
    excerpt: "Rapid growth brought complexity.",
    omission: null,
    claim_status: "Asserted",
    finding: "Growth is named as the cause; no decision-maker is identified.",
    why_it_matters: "Readers cannot tell who decided.",
    stakeholder_risk: "Employees may read this as evasive.",
    recommended_action: "The deciding body or role, and the reasons it owned the decision.",
    fact_validation_needed: false,
    specialist_review_needed: true,
    specialist_review_type: "HR",
    confidence_note: "A context field naming the decision-maker would change this.",
    ...overrides,
  };
}

export function sampleAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  const persona = {
    persona: "Affected employee",
    headline: "My job is gone and no one says who decided",
    may_hear: "My role is gone because of feedback.",
    may_question: "Who decided?",
    may_find_missing: "Selection criteria.",
    would_address_it: "State who decided and how roles were selected.",
  };
  return {
    schema_version: "1.0",
    executive_summary: {
      headline: "Job cuts announced with no owner, criteria, or support",
      assessment: "The draft announces a reduction without naming a decision-maker. It offers no support, verification, or learning.",
      risk_level: "Critical",
      readiness: "Do not issue until material gaps are resolved",
      context_supplied: false,
      strongest_elements: ["Short", "Direct", "Names a change"],
      priority_improvements: ["Name the decision owner", "State selection criteria", "Add verification"],
    },
    dimensions: DIMENSION_IDS.map((id) => ({
      id,
      score: 1.5,
      rationale: "Rationale sentence one. Rationale sentence two.",
      would_raise: "Name a specific actor.",
    })),
    findings: [sampleFinding()],
    agency_scan: [
      {
        phrase: "Rapid growth brought complexity",
        category: "Institutional abstraction",
        severity: "High",
        assessment: "Potential accountability gap",
        why: "Growth is a condition, not a decision-maker.",
        what_would_make_it_credible: "Name the leadership choices.",
        finding_id: "F-001",
      },
    ],
    devils_advocate: {
      disclaimer: DEVILS_ADVOCATE_DISCLAIMER,
      personas: [persona, { ...persona, persona: "Remaining employee" }, { ...persona, persona: "Manager" }, { ...persona, persona: "Journalist" }, { ...persona, persona: "Labor representative" }],
      most_damaging_interpretation: "Leadership is blaming employees for its own decision.",
    },
    questions_before_publication: ["Q1?", "Q2?", "Q3?", "Q4?", "Q5?"],
    specialist_review_summary: ["HR"],
    ...overrides,
  };
}
