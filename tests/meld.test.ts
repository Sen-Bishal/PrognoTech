import assert from "node:assert/strict";
import test from "node:test";
import { calculateMeld } from "@/lib/calculators";

test("calculateMeld returns bounded minimum score for low lab values", () => {
  const result = calculateMeld({
    bilirubin: 0.4,
    inr: 0.9,
    creatinine: 0.7
  });

  assert.equal(result.totalScore, 6);
  assert.equal(result.interpretation, "Lower short-term mortality risk");
  assert.equal(result.threeMonthMortality, "1.9%");
  assert.equal(result.breakdown.bilirubinUsed, 1);
  assert.equal(result.breakdown.inrUsed, 1);
  assert.equal(result.breakdown.creatinineUsed, 1);
});

test("calculateMeld returns high-risk score for severe lab values", () => {
  const result = calculateMeld({
    bilirubin: 4,
    inr: 3,
    creatinine: 3
  });

  assert.equal(result.totalScore, 34);
  assert.equal(result.interpretation, "Very high short-term mortality risk");
  assert.equal(result.threeMonthMortality, "52.6%");
});
