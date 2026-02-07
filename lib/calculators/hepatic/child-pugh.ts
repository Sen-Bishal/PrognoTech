export interface ChildPughParams {
  bilirubin: number;
  albumin: number;
  inr: number;
  ascites: "none" | "mild" | "moderate_to_severe";
  encephalopathy: 0 | 1 | 2 | 3 | 4;
}

export interface ChildPughResult {
  totalScore: number;
  class: "A" | "B" | "C";
  interpretation: string;
  oneYearSurvival: string;
  twoYearSurvival: string;
  breakdown: {
    bilirubinPoints: number;
    albuminPoints: number;
    inrPoints: number;
    ascitesPoints: number;
    encephalopathyPoints: number;
  };
}

const getBilirubinPoints = (value: number): number => {
  if (value < 2) return 1;
  if (value <= 3) return 2;
  return 3;
};

const getAlbuminPoints = (value: number): number => {
  if (value > 3.5) return 1;
  if (value >= 2.8) return 2;
  return 3;
};

const getInrPoints = (value: number): number => {
  if (value < 1.7) return 1;
  if (value <= 2.3) return 2;
  return 3;
};

const getAscitesPoints = (value: ChildPughParams["ascites"]): number => {
  switch (value) {
    case "none":
      return 1;
    case "mild":
      return 2;
    case "moderate_to_severe":
      return 3;
  }
};

const getEncephalopathyPoints = (value: ChildPughParams["encephalopathy"]): number => {
  if (value === 0) return 1;
  if (value === 1 || value === 2) return 2;
  return 3;
};

const getClassAndInterpretation = (totalScore: number) => {
  if (totalScore <= 6) {
    return {
      class: "A" as const,
      interpretation: "Well-compensated disease",
      oneYearSurvival: "100%",
      twoYearSurvival: "85%"
    };
  }

  if (totalScore <= 9) {
    return {
      class: "B" as const,
      interpretation: "Significant functional compromise",
      oneYearSurvival: "80%",
      twoYearSurvival: "60%"
    };
  }

  return {
    class: "C" as const,
    interpretation: "Decompensated disease",
    oneYearSurvival: "45%",
    twoYearSurvival: "35%"
  };
};

export const calculateChildPugh = (params: ChildPughParams): ChildPughResult => {
  const bilirubinPoints = getBilirubinPoints(params.bilirubin);
  const albuminPoints = getAlbuminPoints(params.albumin);
  const inrPoints = getInrPoints(params.inr);
  const ascitesPoints = getAscitesPoints(params.ascites);
  const encephalopathyPoints = getEncephalopathyPoints(params.encephalopathy);

  const totalScore =
    bilirubinPoints + albuminPoints + inrPoints + ascitesPoints + encephalopathyPoints;

  const { class: classValue, interpretation, oneYearSurvival, twoYearSurvival } =
    getClassAndInterpretation(totalScore);

  return {
    totalScore,
    class: classValue,
    interpretation,
    oneYearSurvival,
    twoYearSurvival,
    breakdown: {
      bilirubinPoints,
      albuminPoints,
      inrPoints,
      ascitesPoints,
      encephalopathyPoints
    }
  };
};
