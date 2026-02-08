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

test("rankScoringSystemsFromSearch returns empty when no parameters match", () => {
  const ranked = rankScoringSystemsFromSearch("troponin, st elevation, killip");
  assert.equal(ranked.length, 0);
});
