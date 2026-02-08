import assert from "node:assert/strict";
import test from "node:test";
import { calculateSofa } from "@/lib/calculators";

test("calculateSofa returns zero for normal organ function", () => {
  const result = calculateSofa({
    pao2fio2: 420,
    onRespiratorySupport: false,
    platelets: 220,
    bilirubin: 0.9,
    meanArterialPressure: 80,
    dopamine: 0,
    dobutamine: 0,
    epinephrine: 0,
    norepinephrine: 0,
    glasgowComaScale: 15,
    creatinine: 1,
    urineOutput: 1500
  });

  assert.equal(result.totalScore, 0);
  assert.equal(result.riskBand, "Very low ICU mortality risk");
  assert.equal(result.breakdown.renalMethod, "creatinine");
});

test("calculateSofa captures critical multi-organ dysfunction", () => {
  const result = calculateSofa({
    pao2fio2: 90,
    onRespiratorySupport: true,
    platelets: 40,
    bilirubin: 7,
    meanArterialPressure: 65,
    dopamine: 16,
    dobutamine: 0,
    epinephrine: 0.2,
    norepinephrine: 0.3,
    glasgowComaScale: 5,
    creatinine: 3,
    urineOutput: 100
  });

  assert.equal(result.breakdown.respiratory, 4);
  assert.equal(result.breakdown.cardiovascular, 4);
  assert.equal(result.breakdown.renal, 4);
  assert.equal(result.breakdown.renalMethod, "urine_output");
  assert.equal(result.totalScore, 22);
  assert.equal(result.interpretation, "Critical multi-organ dysfunction");
});

test("calculateSofa requires respiratory support for highest respiratory tiers", () => {
  const result = calculateSofa({
    pao2fio2: 150,
    onRespiratorySupport: false,
    platelets: 200,
    bilirubin: 1,
    meanArterialPressure: 80,
    dopamine: 0,
    dobutamine: 0,
    epinephrine: 0,
    norepinephrine: 0,
    glasgowComaScale: 15,
    creatinine: 1,
    urineOutput: 1000
  });

  assert.equal(result.breakdown.respiratory, 2);
});
