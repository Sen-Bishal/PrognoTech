import assert from "node:assert/strict";
import test from "node:test";
import { calculateCha2ds2Vasc } from "@/lib/calculators";

test("calculateCha2ds2Vasc returns low risk for male score 0", () => {
  const result = calculateCha2ds2Vasc({
    congestiveHeartFailureOrLeftVentricularDysfunction: false,
    hypertension: false,
    age: 42,
    diabetesMellitus: false,
    priorStrokeTiaOrThromboembolism: false,
    vascularDisease: false,
    sex: "male"
  });

  assert.equal(result.totalScore, 0);
  assert.equal(result.riskCategory, "low");
});

test("calculateCha2ds2Vasc keeps female sex-only profile in low-risk bucket", () => {
  const result = calculateCha2ds2Vasc({
    congestiveHeartFailureOrLeftVentricularDysfunction: false,
    hypertension: false,
    age: 36,
    diabetesMellitus: false,
    priorStrokeTiaOrThromboembolism: false,
    vascularDisease: false,
    sex: "female"
  });

  assert.equal(result.totalScore, 1);
  assert.equal(result.breakdown.nonSexScore, 0);
  assert.equal(result.riskCategory, "low");
});

test("calculateCha2ds2Vasc identifies high-risk profile", () => {
  const result = calculateCha2ds2Vasc({
    congestiveHeartFailureOrLeftVentricularDysfunction: true,
    hypertension: true,
    age: 78,
    diabetesMellitus: true,
    priorStrokeTiaOrThromboembolism: true,
    vascularDisease: true,
    sex: "female"
  });

  assert.equal(result.totalScore, 9);
  assert.equal(result.riskCategory, "high");
  assert.equal(result.breakdown.nonSexScore, 8);
  assert.equal(result.breakdown.sexCategory, 1);
});
