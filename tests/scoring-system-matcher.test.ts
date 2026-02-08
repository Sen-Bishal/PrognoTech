import assert from "node:assert/strict";
import test from "node:test";
import {
  guessScoringSystemFromParameterKeys,
  guessScoringSystemFromSearch,
  rankScoringSystemsFromSearch
} from "@/lib/scoring-system-matcher";

test("guessScoringSystemFromSearch detects Child-Pugh by manual parameter search", () => {
  const guess = guessScoringSystemFromSearch("bilirubin, albumin, inr, ascites");

  assert.ok(guess);
  assert.equal(guess.system.id, "child_pugh");
  assert.ok(guess.confidence >= 0.5);
  assert.ok(guess.matchedParameters.includes("bilirubin"));
  assert.ok(guess.matchedParameters.includes("ascites"));
});

test("guessScoringSystemFromParameterKeys detects Child-Pugh from payload keys", () => {
  const guess = guessScoringSystemFromParameterKeys({
    bilirubin: 1.2,
    albumin: 3.7,
    inr: 1.4,
    ascites: "none",
    encephalopathy: 0
  });

  assert.ok(guess);
  assert.equal(guess.system.id, "child_pugh");
  assert.equal(guess.missingParameters.length, 0);
});

test("guessScoringSystemFromSearch detects MELD by creatinine-driven query", () => {
  const guess = guessScoringSystemFromSearch("creatinine, bilirubin, inr");

  assert.ok(guess);
  assert.equal(guess.system.id, "meld");
  assert.ok(guess.confidence >= 0.8);
});

test("guessScoringSystemFromSearch detects SOFA from ICU organ-failure terms", () => {
  const guess = guessScoringSystemFromSearch("pao2fio2, norepinephrine, platelets");

  assert.ok(guess);
  assert.equal(guess.system.id, "sofa");
});

test("guessScoringSystemFromSearch detects Wells PE from clot-specific terms", () => {
  const guess = guessScoringSystemFromSearch("hemoptysis, peMostLikelyDiagnosis, previousDvtOrPe");

  assert.ok(guess);
  assert.equal(guess.system.id, "wells_pe");
});

test("guessScoringSystemFromParameterKeys detects CHA2DS2-VASc from AF stroke-risk payload keys", () => {
  const guess = guessScoringSystemFromParameterKeys({
    congestiveHeartFailureOrLeftVentricularDysfunction: false,
    hypertension: true,
    age: 70,
    diabetesMellitus: false,
    priorStrokeTiaOrThromboembolism: false,
    vascularDisease: true,
    sex: "male"
  });

  assert.ok(guess);
  assert.equal(guess.system.id, "cha2ds2_vasc");
});

test("rankScoringSystemsFromSearch returns empty when no parameters match", () => {
  const ranked = rankScoringSystemsFromSearch("troponin, st elevation, killip");
  assert.equal(ranked.length, 0);
});
