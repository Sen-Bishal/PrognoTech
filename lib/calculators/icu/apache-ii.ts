export interface ApacheIIParams {
  temperatureC: number;
  meanArterialPressure: number;
  heartRate: number;
  respiratoryRate: number;
  fio2: number;
  pao2?: number;
  aaGradient?: number;
  arterialPh?: number;
  serumBicarbonate?: number;
  sodium: number;
  potassium: number;
  creatinine: number;
  acuteRenalFailure: boolean;
  hematocrit: number;
  whiteBloodCellCount: number;
  glasgowComaScale: number;
  age: number;
  chronicHealthState: "none" | "elective_postop" | "emergency_postop" | "nonoperative";
}

export interface ApacheIIResult {
  totalScore: number;
  interpretation: string;
  estimatedHospitalMortality: string;
  breakdown: {
    acutePhysiologyScore: number;
    agePoints: number;
    chronicHealthPoints: number;
    componentPoints: {
      temperature: number;
      meanArterialPressure: number;
      heartRate: number;
      respiratoryRate: number;
      oxygenation: number;
      acidBase: number;
      sodium: number;
      potassium: number;
      creatinine: number;
      hematocrit: number;
      whiteBloodCellCount: number;
      glasgowComaScale: number;
    };
    oxygenationMethod: "pao2" | "aa_gradient";
    acidBaseMethod: "arterial_ph" | "serum_bicarbonate";
  };
}

const getTemperaturePoints = (value: number) => {
  if (value >= 41) return 4;
  if (value >= 39) return 3;
  if (value >= 38.5) return 1;
  if (value >= 36) return 0;
  if (value >= 34) return 1;
  if (value >= 32) return 2;
  if (value >= 30) return 3;
  return 4;
};

const getMapPoints = (value: number) => {
  if (value >= 160) return 4;
  if (value >= 130) return 3;
  if (value >= 110) return 2;
  if (value >= 70) return 0;
  if (value >= 50) return 2;
  return 4;
};

const getHeartRatePoints = (value: number) => {
  if (value >= 180) return 4;
  if (value >= 140) return 3;
  if (value >= 110) return 2;
  if (value >= 70) return 0;
  if (value >= 55) return 2;
  if (value >= 40) return 3;
  return 4;
};

const getRespiratoryRatePoints = (value: number) => {
  if (value >= 50) return 4;
  if (value >= 35) return 3;
  if (value >= 25) return 1;
  if (value >= 12) return 0;
  if (value >= 10) return 1;
  if (value >= 6) return 2;
  return 4;
};

const getOxygenationPoints = (params: ApacheIIParams) => {
  if (params.fio2 >= 0.5) {
    const aaGradient = params.aaGradient ?? 0;
    if (aaGradient >= 500) {
      return { points: 4, method: "aa_gradient" as const };
    }
    if (aaGradient >= 350) {
      return { points: 3, method: "aa_gradient" as const };
    }
    if (aaGradient >= 200) {
      return { points: 2, method: "aa_gradient" as const };
    }
    return { points: 0, method: "aa_gradient" as const };
  }

  const pao2 = params.pao2 ?? 0;
  if (pao2 >= 70) {
    return { points: 0, method: "pao2" as const };
  }
  if (pao2 >= 61) {
    return { points: 1, method: "pao2" as const };
  }
  if (pao2 >= 55) {
    return { points: 3, method: "pao2" as const };
  }
  return { points: 4, method: "pao2" as const };
};

const getArterialPhPoints = (value: number) => {
  if (value >= 7.7) return 4;
  if (value >= 7.6) return 3;
  if (value >= 7.5) return 1;
  if (value >= 7.33) return 0;
  if (value >= 7.25) return 2;
  if (value >= 7.15) return 3;
  return 4;
};

const getBicarbonatePoints = (value: number) => {
  if (value >= 52) return 4;
  if (value >= 41) return 3;
  if (value >= 32) return 1;
  if (value >= 22) return 0;
  if (value >= 18) return 2;
  if (value >= 15) return 3;
  return 4;
};

const getAcidBasePoints = (params: ApacheIIParams) => {
  if (typeof params.arterialPh === "number") {
    return {
      points: getArterialPhPoints(params.arterialPh),
      method: "arterial_ph" as const
    };
  }

  return {
    points: getBicarbonatePoints(params.serumBicarbonate ?? 0),
    method: "serum_bicarbonate" as const
  };
};

const getSodiumPoints = (value: number) => {
  if (value >= 180) return 4;
  if (value >= 160) return 3;
  if (value >= 155) return 2;
  if (value >= 150) return 1;
  if (value >= 130) return 0;
  if (value >= 120) return 2;
  if (value >= 111) return 3;
  return 4;
};

const getPotassiumPoints = (value: number) => {
  if (value >= 7) return 4;
  if (value >= 6) return 3;
  if (value >= 5.5) return 1;
  if (value >= 3.5) return 0;
  if (value >= 3) return 1;
  if (value >= 2.5) return 2;
  return 4;
};

const getCreatininePoints = (value: number, acuteRenalFailure: boolean) => {
  let basePoints = 0;
  if (value >= 3.5) {
    basePoints = 4;
  } else if (value >= 2) {
    basePoints = 3;
  } else if (value >= 1.5) {
    basePoints = 2;
  } else if (value < 0.6) {
    basePoints = 2;
  }
  return acuteRenalFailure ? basePoints * 2 : basePoints;
};

const getHematocritPoints = (value: number) => {
  if (value >= 60) return 4;
  if (value >= 50) return 2;
  if (value >= 46) return 1;
  if (value >= 30) return 0;
  if (value >= 20) return 2;
  return 4;
};

const getWbcPoints = (value: number) => {
  if (value >= 40) return 4;
  if (value >= 20) return 2;
  if (value >= 15) return 1;
  if (value >= 3) return 0;
  if (value >= 1) return 2;
  return 4;
};

const getGcsPoints = (value: number) => 15 - value;

const getAgePoints = (age: number) => {
  if (age >= 75) return 6;
  if (age >= 65) return 5;
  if (age >= 55) return 3;
  if (age >= 45) return 2;
  return 0;
};

const getChronicHealthPoints = (state: ApacheIIParams["chronicHealthState"]) => {
  switch (state) {
    case "none":
      return 0;
    case "elective_postop":
      return 2;
    case "emergency_postop":
    case "nonoperative":
      return 5;
  }
};

const classifyApacheII = (totalScore: number) => {
  if (totalScore <= 4) {
    return {
      interpretation: "Low severity of illness",
      estimatedHospitalMortality: "~4%"
    };
  }
  if (totalScore <= 9) {
    return {
      interpretation: "Mild severity of illness",
      estimatedHospitalMortality: "~8%"
    };
  }
  if (totalScore <= 14) {
    return {
      interpretation: "Moderate severity of illness",
      estimatedHospitalMortality: "~15%"
    };
  }
  if (totalScore <= 19) {
    return {
      interpretation: "Substantial severity of illness",
      estimatedHospitalMortality: "~25%"
    };
  }
  if (totalScore <= 24) {
    return {
      interpretation: "High severity of illness",
      estimatedHospitalMortality: "~40%"
    };
  }
  if (totalScore <= 29) {
    return {
      interpretation: "Very high severity of illness",
      estimatedHospitalMortality: "~55%"
    };
  }
  if (totalScore <= 34) {
    return {
      interpretation: "Critical severity of illness",
      estimatedHospitalMortality: "~75%"
    };
  }
  return {
    interpretation: "Extremely critical severity of illness",
    estimatedHospitalMortality: "~85%"
  };
};

export const calculateApacheII = (params: ApacheIIParams): ApacheIIResult => {
  const temperature = getTemperaturePoints(params.temperatureC);
  const meanArterialPressure = getMapPoints(params.meanArterialPressure);
  const heartRate = getHeartRatePoints(params.heartRate);
  const respiratoryRate = getRespiratoryRatePoints(params.respiratoryRate);
  const oxygenation = getOxygenationPoints(params);
  const acidBase = getAcidBasePoints(params);
  const sodium = getSodiumPoints(params.sodium);
  const potassium = getPotassiumPoints(params.potassium);
  const creatinine = getCreatininePoints(params.creatinine, params.acuteRenalFailure);
  const hematocrit = getHematocritPoints(params.hematocrit);
  const whiteBloodCellCount = getWbcPoints(params.whiteBloodCellCount);
  const glasgowComaScale = getGcsPoints(params.glasgowComaScale);

  const acutePhysiologyScore =
    temperature +
    meanArterialPressure +
    heartRate +
    respiratoryRate +
    oxygenation.points +
    acidBase.points +
    sodium +
    potassium +
    creatinine +
    hematocrit +
    whiteBloodCellCount +
    glasgowComaScale;

  const agePoints = getAgePoints(params.age);
  const chronicHealthPoints = getChronicHealthPoints(params.chronicHealthState);
  const totalScore = acutePhysiologyScore + agePoints + chronicHealthPoints;
  const { interpretation, estimatedHospitalMortality } = classifyApacheII(totalScore);

  return {
    totalScore,
    interpretation,
    estimatedHospitalMortality,
    breakdown: {
      acutePhysiologyScore,
      agePoints,
      chronicHealthPoints,
      componentPoints: {
        temperature,
        meanArterialPressure,
        heartRate,
        respiratoryRate,
        oxygenation: oxygenation.points,
        acidBase: acidBase.points,
        sodium,
        potassium,
        creatinine,
        hematocrit,
        whiteBloodCellCount,
        glasgowComaScale
      },
      oxygenationMethod: oxygenation.method,
      acidBaseMethod: acidBase.method
    }
  };
};
