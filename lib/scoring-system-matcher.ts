import { scoringSystems } from "@/lib/db/seed-data";
import type { ScoringSystemDefinition } from "@/lib/types/scoring";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const toSearchTerms = (query: string | string[]) => {
  const source = Array.isArray(query) ? query.join(",") : query;
  const chunks = source
    .split(/[,\n;]+/)
    .map((item) => normalize(item))
    .filter(Boolean);

  const words = chunks
    .flatMap((chunk) => chunk.split(" "))
    .map((item) => item.trim())
    .filter((item) => item.length > 1);

  return unique([...chunks, ...words]);
};

const isPartialMatch = (term: string, parameter: string) => {
  if (term.length < 3) {
    return false;
  }
  return parameter.includes(term) || term.includes(parameter);
};

export interface ScoringSystemGuess {
  system: ScoringSystemDefinition;
  confidence: number;
  matchedParameters: string[];
  missingParameters: string[];
}

const scoreSystemMatch = (
  system: ScoringSystemDefinition,
  terms: string[]
): ScoringSystemGuess | null => {
  const normalizedParams = system.parameters.map((param) => ({
    raw: param.name,
    normalized: normalize(param.name)
  }));

  const matches = new Map<string, "exact" | "partial">();

  for (const term of terms) {
    for (const parameter of normalizedParams) {
      if (term === parameter.normalized) {
        matches.set(parameter.raw, "exact");
        continue;
      }

      if (!matches.has(parameter.raw) && isPartialMatch(term, parameter.normalized)) {
        matches.set(parameter.raw, "partial");
      }
    }
  }

  const matchedParameters = normalizedParams
    .filter((parameter) => matches.has(parameter.raw))
    .map((parameter) => parameter.raw);
  if (matchedParameters.length === 0) {
    return null;
  }

  const exactCount = Array.from(matches.values()).filter((item) => item === "exact").length;
  const partialCount = matchedParameters.length - exactCount;
  const parameterCoverage = matchedParameters.length / normalizedParams.length;
  const termPrecision = matchedParameters.length / Math.max(terms.length, 1);
  const exactness = (exactCount + partialCount * 0.6) / matchedParameters.length;
  const confidence = Number(
    (parameterCoverage * 0.55 + termPrecision * 0.35 + exactness * 0.1).toFixed(2)
  );

  return {
    system,
    confidence,
    matchedParameters,
    missingParameters: normalizedParams
      .filter((parameter) => !matches.has(parameter.raw))
      .map((parameter) => parameter.raw)
  };
};

const getRankedMatches = (terms: string[]) => {
  if (terms.length === 0) {
    return [];
  }

  return scoringSystems
    .map((system) => scoreSystemMatch(system, terms))
    .filter((match): match is ScoringSystemGuess => match !== null)
    .sort((a, b) => {
      if (b.confidence === a.confidence) {
        return b.matchedParameters.length - a.matchedParameters.length;
      }
      return b.confidence - a.confidence;
    });
};

export const guessScoringSystemFromSearch = (query: string | string[]) => {
  const terms = toSearchTerms(query);
  const ranked = getRankedMatches(terms);
  if (ranked.length === 0) {
    return null;
  }

  const best = ranked[0];
  return best.confidence >= 0.2 ? best : null;
};

export const guessScoringSystemFromParameterKeys = (
  parameters: Record<string, unknown>
) => {
  return guessScoringSystemFromSearch(Object.keys(parameters));
};

export const rankScoringSystemsFromSearch = (query: string | string[]) => {
  return getRankedMatches(toSearchTerms(query));
};
