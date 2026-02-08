import assert from "node:assert/strict";
import test from "node:test";
import { calculateApacheII } from "@/lib/calculators";
import { apacheIISchema } from "@/lib/validators/parameter-schemas";

test("calculateApacheII returns minimal score for normal physiology", () => {
  const result = calculateApacheII({
    temperatureC: 37,
    meanArterialPressure: 90,
    heartRate: 88,
    respiratoryRate: 16,
    fio2: 0.21,
    pao2: 92,
    arterialPh: 7.4,
    sodium: 140,
    potassium: 4.1,
    creatinine: 1,
    acuteRenalFailure: false,
    hematocrit: 42,
    whiteBloodCellCount: 8,
    glasgowComaScale: 15,
    age: 35,
    chronicHealthState: "none"
  });

  assert.equal(result.totalScore, 0);
  assert.equal(result.breakdown.acutePhysiologyScore, 0);
  assert.equal(result.breakdown.oxygenationMethod, "pao2");
  assert.equal(result.breakdown.acidBaseMethod, "arterial_ph");
  assert.equal(result.estimatedHospitalMortality, "~4%");
});

test("calculateApacheII handles A-a gradient path, bicarbonate fallback, and renal-failure doubling", () => {
  const result = calculateApacheII({
    temperatureC: 40,
    meanArterialPressure: 45,
    heartRate: 150,
    respiratoryRate: 40,
    fio2: 0.7,
    aaGradient: 420,
    serumBicarbonate: 16,
    sodium: 160,
    potassium: 6.5,
    creatinine: 4,
    acuteRenalFailure: true,
    hematocrit: 25,
    whiteBloodCellCount: 22,
    glasgowComaScale: 7,
    age: 78,
    chronicHealthState: "nonoperative"
  });

  assert.equal(result.breakdown.componentPoints.creatinine, 8);
  assert.equal(result.breakdown.oxygenationMethod, "aa_gradient");
  assert.equal(result.breakdown.acidBaseMethod, "serum_bicarbonate");
  assert.equal(result.breakdown.acutePhysiologyScore, 45);
  assert.equal(result.breakdown.agePoints, 6);
  assert.equal(result.breakdown.chronicHealthPoints, 5);
  assert.equal(result.totalScore, 56);
  assert.equal(result.estimatedHospitalMortality, "~85%");
});

test("apacheIISchema enforces oxygenation branch requirement", () => {
  assert.throws(() =>
    apacheIISchema.parse({
      temperatureC: 37,
      meanArterialPressure: 90,
      heartRate: 88,
      respiratoryRate: 16,
      fio2: 0.21,
      arterialPh: 7.4,
      sodium: 140,
      potassium: 4.1,
      creatinine: 1,
      acuteRenalFailure: false,
      hematocrit: 42,
      whiteBloodCellCount: 8,
      glasgowComaScale: 15,
      age: 35,
      chronicHealthState: "none"
    })
  );

  const parsed = apacheIISchema.parse({
    temperatureC: 37,
    meanArterialPressure: 90,
    heartRate: 88,
    respiratoryRate: 16,
    fio2: 0.6,
    aaGradient: 180,
    serumBicarbonate: 25,
    sodium: 140,
    potassium: 4.1,
    creatinine: 1,
    acuteRenalFailure: false,
    hematocrit: 42,
    whiteBloodCellCount: 8,
    glasgowComaScale: 15,
    age: 35,
    chronicHealthState: "none"
  });

  assert.equal(parsed.aaGradient, 180);
  assert.equal(parsed.serumBicarbonate, 25);
});
