export interface WellsPeParams {
  clinicalSignsOfDvt: boolean;
  peMostLikelyDiagnosis: boolean;
  heartRate: number;
  immobilizationOrRecentSurgery: boolean;
  previousDvtOrPe: boolean;
  hemoptysis: boolean;
  malignancy: boolean;
}

export interface WellsPeResult {
  totalScore: number;
  interpretation: string;
  pretestProbability: "low" | "moderate" | "high";
  twoTierLikelihood: "pe_unlikely" | "pe_likely";
  estimatedPrevalence: string;
  breakdown: {
    heartRateCriterionMet: boolean;
    criteriaPoints: {
      clinicalSignsOfDvt: number;
      peMostLikelyDiagnosis: number;
      heartRate: number;
      immobilizationOrRecentSurgery: number;
      previousDvtOrPe: number;
      hemoptysis: number;
      malignancy: number;
    };
  };
}

const classifyWellsPe = (score: number) => {
  if (score > 6) {
    return {
      interpretation: "High pretest probability for pulmonary embolism",
      pretestProbability: "high" as const,
      estimatedPrevalence: "~37.5%"
    };
  }
  if (score >= 2) {
    return {
      interpretation: "Moderate pretest probability for pulmonary embolism",
      pretestProbability: "moderate" as const,
      estimatedPrevalence: "~16.2%"
    };
  }
  return {
    interpretation: "Low pretest probability for pulmonary embolism",
    pretestProbability: "low" as const,
    estimatedPrevalence: "~1.3%"
  };
};

export const calculateWellsPe = (params: WellsPeParams): WellsPeResult => {
  const criteriaPoints = {
    clinicalSignsOfDvt: params.clinicalSignsOfDvt ? 3 : 0,
    peMostLikelyDiagnosis: params.peMostLikelyDiagnosis ? 3 : 0,
    heartRate: params.heartRate > 100 ? 1.5 : 0,
    immobilizationOrRecentSurgery: params.immobilizationOrRecentSurgery ? 1.5 : 0,
    previousDvtOrPe: params.previousDvtOrPe ? 1.5 : 0,
    hemoptysis: params.hemoptysis ? 1 : 0,
    malignancy: params.malignancy ? 1 : 0
  };
  const totalScore = Number(
    (
      criteriaPoints.clinicalSignsOfDvt +
      criteriaPoints.peMostLikelyDiagnosis +
      criteriaPoints.heartRate +
      criteriaPoints.immobilizationOrRecentSurgery +
      criteriaPoints.previousDvtOrPe +
      criteriaPoints.hemoptysis +
      criteriaPoints.malignancy
    ).toFixed(1)
  );

  const { interpretation, pretestProbability, estimatedPrevalence } = classifyWellsPe(totalScore);

  return {
    totalScore,
    interpretation,
    pretestProbability,
    twoTierLikelihood: totalScore > 4 ? "pe_likely" : "pe_unlikely",
    estimatedPrevalence,
    breakdown: {
      heartRateCriterionMet: params.heartRate > 100,
      criteriaPoints
    }
  };
};
