import assert from "node:assert/strict";
import test from "node:test";
import { calculateChildPugh } from "@/lib/calculators";

test("calculateChildPugh returns class A for low-risk values", () => {
  const result = calculateChildPugh({
    bilirubin: 1.1,
    albumin: 4.2,
    inr: 1.2,
    ascites: "none",
    encephalopathy: 0
  });

  assert.equal(result.totalScore, 5);
  assert.equal(result.class, "A");
  assert.equal(result.oneYearSurvival, "100%");
  assert.deepEqual(result.breakdown, {
    bilirubinPoints: 1,
    albuminPoints: 1,
    inrPoints: 1,
    ascitesPoints: 1,
    encephalopathyPoints: 1
  });
});

test("calculateChildPugh returns class B for mid-range values", () => {
  const result = calculateChildPugh({
    bilirubin: 2.5,
    albumin: 4.0,
    inr: 1.8,
    ascites: "none",
    encephalopathy: 1
  });

  assert.equal(result.totalScore, 8);
  assert.equal(result.class, "B");
  assert.equal(result.twoYearSurvival, "60%");
});

test("calculateChildPugh returns class C for severe values", () => {
  const result = calculateChildPugh({
    bilirubin: 6.2,
    albumin: 2.1,
    inr: 3.4,
    ascites: "moderate_to_severe",
    encephalopathy: 4
  });

  assert.equal(result.totalScore, 15);
  assert.equal(result.class, "C");
  assert.equal(result.interpretation, "Decompensated disease");
});
