import test from "node:test";
import assert from "node:assert/strict";
import { computeDocumentReadiness } from "../src/services/core/document-readiness.service.js";
import { optimizeBenefitStack } from "../src/services/core/benefit-optimization.service.js";
import { predictEligibilityTimeline } from "../src/services/ml/predictive-eligibility.service.js";

test("computeDocumentReadiness calculates missing and available documents", () => {
  const result = computeDocumentReadiness(["Aadhaar Card", "Income Certificate"], {
    documents_required: "Aadhaar Card, Income Certificate, Domicile Certificate",
  });

  assert.equal(result.requiredDocuments.length, 3);
  assert.equal(result.availableDocuments.length, 2);
  assert.equal(result.missingDocuments.length, 1);
  assert.equal(result.readinessScore, 67);
});

test("optimizeBenefitStack prioritizes highest dynamic benefit values", () => {
  const input = [
    {
      name: "Scheme A",
      eligibilityStatus: "Eligible",
      finalScore: 90,
      benefits: "Provides INR 50000 annual support",
      description: "General support",
    },
    {
      name: "Scheme B",
      eligibilityStatus: "Eligible",
      finalScore: 80,
      benefits: "Provides INR 120000 annual support",
      description: "General support",
    },
  ];

  const output = optimizeBenefitStack(input, 2);
  assert.equal(output.selectedSchemes.length, 2);
  assert.ok(output.totalEstimatedBenefit >= 170000);
});

test("predictEligibilityTimeline returns positive months for unmet age condition", () => {
  const result = predictEligibilityTimeline(
    { age: 30, income: 200000 },
    { age_min: 35, income_limit: 300000 },
    90
  );

  assert.ok(result.predictedEligibleInMonths >= 60);
});
