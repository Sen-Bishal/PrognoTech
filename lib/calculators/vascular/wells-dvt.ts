export interface WellsDvtParams {
  activeCancer: boolean;
  paralysisOrRecentImmobilization: boolean;
  recentlyBedriddenOrMajorSurgery: boolean;
  localizedTendernessAlongDeepVenousSystem: boolean;
  entireLegSwollen: boolean;
  calfSwellingAtLeast3cm: boolean;
  pittingEdemaConfinedToSymptomaticLeg: boolean;
  collateralSuperficialVeins: boolean;
  previousDvt: boolean;
  alternativeDiagnosisAsLikelyOrMoreLikely: boolean;
}

export interface WellsDvtResult {
  totalScore: number;
  interpretation: string;
  pretestProbability: "low" | "moderate" | "high";
  twoTierLikelihood: "dvt_unlikely" | "dvt_likely";
  breakdown: {
    positiveCriteriaCount: number;
    alternativeDiagnosisPenalty: number;
  };
}

const classifyWellsDvt = (score: number) => {
  if (score >= 3) {
    return {
      interpretation: "High pretest probability for lower-extremity DVT",
      pretestProbability: "high" as const
    };
  }
  if (score >= 1) {
    return {
      interpretation: "Moderate pretest probability for lower-extremity DVT",
      pretestProbability: "moderate" as const
    };
  }
  return {
    interpretation: "Low pretest probability for lower-extremity DVT",
    pretestProbability: "low" as const
  };
};

export const calculateWellsDvt = (params: WellsDvtParams): WellsDvtResult => {
  const positiveCriteriaCount =
    Number(params.activeCancer) +
    Number(params.paralysisOrRecentImmobilization) +
    Number(params.recentlyBedriddenOrMajorSurgery) +
    Number(params.localizedTendernessAlongDeepVenousSystem) +
    Number(params.entireLegSwollen) +
    Number(params.calfSwellingAtLeast3cm) +
    Number(params.pittingEdemaConfinedToSymptomaticLeg) +
    Number(params.collateralSuperficialVeins) +
    Number(params.previousDvt);
  const alternativeDiagnosisPenalty = params.alternativeDiagnosisAsLikelyOrMoreLikely ? -2 : 0;
  const totalScore = positiveCriteriaCount + alternativeDiagnosisPenalty;
  const { interpretation, pretestProbability } = classifyWellsDvt(totalScore);

  return {
    totalScore,
    interpretation,
    pretestProbability,
    twoTierLikelihood: totalScore >= 2 ? "dvt_likely" : "dvt_unlikely",
    breakdown: {
      positiveCriteriaCount,
      alternativeDiagnosisPenalty
    }
  };
};
