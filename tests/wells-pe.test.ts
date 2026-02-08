import assert from "node:assert/strict";
import test from "node:test";
import { calculateWellsPe } from "@/lib/calculators";

test("calculateWellsPe returns low probability for minimal features", () => {
  const result = calculateWellsPe({
    clinicalSignsOfDvt: false,
    peMostLikelyDiagnosis: false,
    heartRate: 88,
    immobilizationOrRecentSurgery: false,
    previousDvtOrPe: false,
    hemoptysis: false,
    malignancy: false
  });

  assert.equal(result.totalScore, 0);
  assert.equal(result.pretestProbability, "low");
  assert.equal(result.twoTierLikelihood, "pe_unlikely");
  assert.equal(result.estimatedPrevalence, "~1.3%");
});

test("calculateWellsPe identifies high-likelihood PE profile", () => {
  const result = calculateWellsPe({
    clinicalSignsOfDvt: true,
    peMostLikelyDiagnosis: true,
    heartRate: 120,
    immobilizationOrRecentSurgery: true,
    previousDvtOrPe: true,
    hemoptysis: true,
    malignancy: true
  });

  assert.equal(result.totalScore, 12.5);
  assert.equal(result.pretestProbability, "high");
  assert.equal(result.twoTierLikelihood, "pe_likely");
});

test("calculateWellsPe captures moderate band", () => {
  const result = calculateWellsPe({
    clinicalSignsOfDvt: false,
    peMostLikelyDiagnosis: true,
    heartRate: 85,
    immobilizationOrRecentSurgery: false,
    previousDvtOrPe: false,
    hemoptysis: false,
    malignancy: false
  });

  assert.equal(result.totalScore, 3);
  assert.equal(result.pretestProbability, "moderate");
});
