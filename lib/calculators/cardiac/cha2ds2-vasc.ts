export interface Cha2ds2VascParams {
  congestiveHeartFailureOrLeftVentricularDysfunction: boolean;
  hypertension: boolean;
  age: number;
  diabetesMellitus: boolean;
  priorStrokeTiaOrThromboembolism: boolean;
  vascularDisease: boolean;
  sex: "male" | "female";
}

export interface Cha2ds2VascResult {
  totalScore: number;
  interpretation: string;
  recommendation: string;
  riskCategory: "low" | "intermediate" | "high";
  breakdown: {
    congestiveHeartFailureOrLeftVentricularDysfunction: number;
    hypertension: number;
    age: number;
    diabetesMellitus: number;
    priorStrokeTiaOrThromboembolism: number;
    vascularDisease: number;
    sexCategory: number;
    nonSexScore: number;
  };
}

const classifyCha2ds2Vasc = (
  score: number,
  nonSexScore: number,
  sex: Cha2ds2VascParams["sex"]
) => {
  const isFemale = sex === "female";
  const lowRisk = (isFemale && nonSexScore === 0) || (!isFemale && score === 0);
  if (lowRisk) {
    return {
      interpretation: "Low annual thromboembolic risk by CHA2DS2-VASc",
      recommendation: "No anticoagulation is recommended based on CHA2DS2-VASc alone.",
      riskCategory: "low" as const
    };
  }

  const intermediateRisk = (!isFemale && score === 1) || (isFemale && score === 2);
  if (intermediateRisk) {
    return {
      interpretation: "Intermediate annual thromboembolic risk by CHA2DS2-VASc",
      recommendation:
        "Consider anticoagulation after shared decision-making and bleeding-risk assessment.",
      riskCategory: "intermediate" as const
    };
  }

  return {
    interpretation: "High annual thromboembolic risk by CHA2DS2-VASc",
    recommendation: "Anticoagulation is generally recommended unless contraindicated.",
    riskCategory: "high" as const
  };
};

export const calculateCha2ds2Vasc = (params: Cha2ds2VascParams): Cha2ds2VascResult => {
  const agePoints = params.age >= 75 ? 2 : params.age >= 65 ? 1 : 0;
  const sexCategory = params.sex === "female" ? 1 : 0;
  const breakdown = {
    congestiveHeartFailureOrLeftVentricularDysfunction:
      params.congestiveHeartFailureOrLeftVentricularDysfunction ? 1 : 0,
    hypertension: params.hypertension ? 1 : 0,
    age: agePoints,
    diabetesMellitus: params.diabetesMellitus ? 1 : 0,
    priorStrokeTiaOrThromboembolism: params.priorStrokeTiaOrThromboembolism ? 2 : 0,
    vascularDisease: params.vascularDisease ? 1 : 0,
    sexCategory,
    nonSexScore: 0
  };

  const nonSexScore =
    breakdown.congestiveHeartFailureOrLeftVentricularDysfunction +
    breakdown.hypertension +
    breakdown.age +
    breakdown.diabetesMellitus +
    breakdown.priorStrokeTiaOrThromboembolism +
    breakdown.vascularDisease;
  breakdown.nonSexScore = nonSexScore;

  const totalScore = nonSexScore + sexCategory;
  const { interpretation, recommendation, riskCategory } = classifyCha2ds2Vasc(
    totalScore,
    nonSexScore,
    params.sex
  );

  return {
    totalScore,
    interpretation,
    recommendation,
    riskCategory,
    breakdown
  };
};
