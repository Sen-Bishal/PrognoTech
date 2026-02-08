import assert from "node:assert/strict";
import test from "node:test";
import { calculateWellsDvt } from "@/lib/calculators";

test("calculateWellsDvt identifies high-risk profile", () => {
  const result = calculateWellsDvt({
    activeCancer: true,
    paralysisOrRecentImmobilization: true,
    recentlyBedriddenOrMajorSurgery: false,
    localizedTendernessAlongDeepVenousSystem: true,
    entireLegSwollen: true,
    calfSwellingAtLeast3cm: true,
    pittingEdemaConfinedToSymptomaticLeg: true,
    collateralSuperficialVeins: false,
    previousDvt: true,
    alternativeDiagnosisAsLikelyOrMoreLikely: false
  });

  assert.equal(result.totalScore, 7);
  assert.equal(result.pretestProbability, "high");
  assert.equal(result.twoTierLikelihood, "dvt_likely");
});

test("calculateWellsDvt applies alternative diagnosis penalty", () => {
  const result = calculateWellsDvt({
    activeCancer: false,
    paralysisOrRecentImmobilization: false,
    recentlyBedriddenOrMajorSurgery: false,
    localizedTendernessAlongDeepVenousSystem: true,
    entireLegSwollen: false,
    calfSwellingAtLeast3cm: false,
    pittingEdemaConfinedToSymptomaticLeg: false,
    collateralSuperficialVeins: false,
    previousDvt: false,
    alternativeDiagnosisAsLikelyOrMoreLikely: true
  });

  assert.equal(result.breakdown.positiveCriteriaCount, 1);
  assert.equal(result.breakdown.alternativeDiagnosisPenalty, -2);
  assert.equal(result.totalScore, -1);
  assert.equal(result.pretestProbability, "low");
  assert.equal(result.twoTierLikelihood, "dvt_unlikely");
});
