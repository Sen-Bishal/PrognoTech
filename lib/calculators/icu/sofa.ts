export interface SofaParams {
  pao2fio2: number;
  onRespiratorySupport: boolean;
  platelets: number;
  bilirubin: number;
  meanArterialPressure: number;
  dopamine: number;
  dobutamine: number;
  epinephrine: number;
  norepinephrine: number;
  glasgowComaScale: number;
  creatinine: number;
  urineOutput?: number;
}

export interface SofaResult {
  totalScore: number;
  interpretation: string;
  riskBand: string;
  breakdown: {
    respiratory: number;
    coagulation: number;
    liver: number;
    cardiovascular: number;
    centralNervousSystem: number;
    renal: number;
    renalMethod: "creatinine" | "urine_output" | "both";
  };
}

const getRespiratoryPoints = (pao2fio2: number, onRespiratorySupport: boolean) => {
  if (pao2fio2 < 100 && onRespiratorySupport) return 4;
  if (pao2fio2 < 200 && onRespiratorySupport) return 3;
  if (pao2fio2 < 300) return 2;
  if (pao2fio2 < 400) return 1;
  return 0;
};

const getCoagulationPoints = (platelets: number) => {
  if (platelets < 20) return 4;
  if (platelets < 50) return 3;
  if (platelets < 100) return 2;
  if (platelets < 150) return 1;
  return 0;
};

const getLiverPoints = (bilirubin: number) => {
  if (bilirubin >= 12) return 4;
  if (bilirubin >= 6) return 3;
  if (bilirubin >= 2) return 2;
  if (bilirubin >= 1.2) return 1;
  return 0;
};

const getCardiovascularPoints = (
  meanArterialPressure: number,
  dopamine: number,
  dobutamine: number,
  epinephrine: number,
  norepinephrine: number
) => {
  if (dopamine > 15 || epinephrine > 0.1 || norepinephrine > 0.1) {
    return 4;
  }

  if (
    (dopamine > 5 && dopamine <= 15) ||
    (epinephrine > 0 && epinephrine <= 0.1) ||
    (norepinephrine > 0 && norepinephrine <= 0.1)
  ) {
    return 3;
  }

  if ((dopamine > 0 && dopamine <= 5) || dobutamine > 0) {
    return 2;
  }

  if (meanArterialPressure < 70) {
    return 1;
  }

  return 0;
};

const getCentralNervousSystemPoints = (glasgowComaScale: number) => {
  if (glasgowComaScale < 6) return 4;
  if (glasgowComaScale <= 9) return 3;
  if (glasgowComaScale <= 12) return 2;
  if (glasgowComaScale <= 14) return 1;
  return 0;
};

const getCreatinineRenalPoints = (creatinine: number) => {
  if (creatinine >= 5) return 4;
  if (creatinine >= 3.5) return 3;
  if (creatinine >= 2) return 2;
  if (creatinine >= 1.2) return 1;
  return 0;
};

const getUrineOutputRenalPoints = (urineOutput?: number) => {
  if (typeof urineOutput !== "number") {
    return 0;
  }
  if (urineOutput < 200) return 4;
  if (urineOutput < 500) return 3;
  return 0;
};

const classifySofa = (totalScore: number) => {
  if (totalScore <= 1) {
    return {
      interpretation: "No significant organ dysfunction by SOFA",
      riskBand: "Very low ICU mortality risk"
    };
  }
  if (totalScore <= 5) {
    return {
      interpretation: "Mild organ dysfunction",
      riskBand: "Low ICU mortality risk"
    };
  }
  if (totalScore <= 9) {
    return {
      interpretation: "Moderate organ dysfunction",
      riskBand: "Intermediate ICU mortality risk"
    };
  }
  if (totalScore <= 12) {
    return {
      interpretation: "Severe organ dysfunction",
      riskBand: "High ICU mortality risk"
    };
  }
  return {
    interpretation: "Critical multi-organ dysfunction",
    riskBand: "Very high ICU mortality risk"
  };
};

export const calculateSofa = (params: SofaParams): SofaResult => {
  const respiratory = getRespiratoryPoints(params.pao2fio2, params.onRespiratorySupport);
  const coagulation = getCoagulationPoints(params.platelets);
  const liver = getLiverPoints(params.bilirubin);
  const cardiovascular = getCardiovascularPoints(
    params.meanArterialPressure,
    params.dopamine,
    params.dobutamine,
    params.epinephrine,
    params.norepinephrine
  );
  const centralNervousSystem = getCentralNervousSystemPoints(params.glasgowComaScale);
  const creatininePoints = getCreatinineRenalPoints(params.creatinine);
  const urineOutputPoints = getUrineOutputRenalPoints(params.urineOutput);
  const renal = Math.max(creatininePoints, urineOutputPoints);
  const renalMethod: SofaResult["breakdown"]["renalMethod"] =
    creatininePoints > urineOutputPoints
      ? "creatinine"
      : urineOutputPoints > creatininePoints
        ? "urine_output"
        : creatininePoints > 0 && urineOutputPoints > 0
          ? "both"
          : "creatinine";

  const totalScore =
    respiratory + coagulation + liver + cardiovascular + centralNervousSystem + renal;
  const { interpretation, riskBand } = classifySofa(totalScore);

  return {
    totalScore,
    interpretation,
    riskBand,
    breakdown: {
      respiratory,
      coagulation,
      liver,
      cardiovascular,
      centralNervousSystem,
      renal,
      renalMethod
    }
  };
};
