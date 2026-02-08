export interface MeldParams {
  bilirubin: number;
  inr: number;
  creatinine: number;
}

export interface MeldResult {
  totalScore: number;
  interpretation: string;
  threeMonthMortality: string;
  breakdown: {
    bilirubinUsed: number;
    inrUsed: number;
    creatinineUsed: number;
    rawScore: number;
  };
}

const boundForMeld = (value: number) => {
  if (value < 1) return 1;
  if (value > 4) return 4;
  return value;
};

const classifyMeld = (score: number) => {
  if (score <= 9) {
    return {
      interpretation: "Lower short-term mortality risk",
      threeMonthMortality: "1.9%"
    };
  }

  if (score <= 19) {
    return {
      interpretation: "Moderate short-term mortality risk",
      threeMonthMortality: "6.0%"
    };
  }

  if (score <= 29) {
    return {
      interpretation: "High short-term mortality risk",
      threeMonthMortality: "19.6%"
    };
  }

  if (score <= 39) {
    return {
      interpretation: "Very high short-term mortality risk",
      threeMonthMortality: "52.6%"
    };
  }

  return {
    interpretation: "Critical short-term mortality risk",
    threeMonthMortality: "71.3%"
  };
};

export const calculateMeld = (params: MeldParams): MeldResult => {
  const bilirubinUsed = boundForMeld(params.bilirubin);
  const inrUsed = boundForMeld(params.inr);
  const creatinineUsed = boundForMeld(params.creatinine);

  const rawScore =
    3.78 * Math.log(bilirubinUsed) +
    11.2 * Math.log(inrUsed) +
    9.57 * Math.log(creatinineUsed) +
    6.43;
  const boundedScore = Math.min(40, Math.max(6, Math.round(rawScore)));
  const { interpretation, threeMonthMortality } = classifyMeld(boundedScore);

  return {
    totalScore: boundedScore,
    interpretation,
    threeMonthMortality,
    breakdown: {
      bilirubinUsed,
      inrUsed,
      creatinineUsed,
      rawScore: Number(rawScore.toFixed(2))
    }
  };
};
