import type { ScoringSystemDefinition } from "@/lib/types/scoring";

export const scoringSystems: ScoringSystemDefinition[] = [
  {
    id: "child_pugh",
    name: "Child-Pugh",
    fullName: "Child-Pugh Score for Cirrhosis Mortality",
    category: "HEPATIC",
    description: "Assesses prognosis of chronic liver disease and cirrhosis.",
    parameters: [
      {
        name: "bilirubin",
        type: "NUMERIC",
        unit: "mg/dL",
        category: "BIOCHEMICAL",
        normalRange: { min: 0.3, max: 1.2 },
        ranges: [
          { min: 0, max: 2, points: 1 },
          { min: 2, max: 3, points: 2 },
          { min: 3, max: 999, points: 3 }
        ]
      },
      {
        name: "albumin",
        type: "NUMERIC",
        unit: "g/dL",
        category: "BIOCHEMICAL",
        normalRange: { min: 3.5, max: 5.5 },
        ranges: [
          { min: 3.5, max: 999, points: 1 },
          { min: 2.8, max: 3.5, points: 2 },
          { min: 0, max: 2.8, points: 3 }
        ]
      },
      {
        name: "inr",
        type: "NUMERIC",
        unit: null,
        category: "BIOCHEMICAL",
        normalRange: { min: 0.9, max: 1.2 },
        ranges: [
          { min: 0, max: 1.7, points: 1 },
          { min: 1.7, max: 2.3, points: 2 },
          { min: 2.3, max: 999, points: 3 }
        ]
      },
      {
        name: "ascites",
        type: "CATEGORICAL",
        unit: null,
        category: "CLINICAL",
        options: [
          { value: "none", label: "None", points: 1 },
          { value: "mild", label: "Mild (diuretic responsive)", points: 2 },
          { value: "moderate_to_severe", label: "Moderate-severe (diuretic refractory)", points: 3 }
        ]
      },
      {
        name: "encephalopathy",
        type: "CATEGORICAL",
        unit: null,
        category: "CLINICAL",
        options: [
          { value: 0, label: "None (grade 0)", points: 1 },
          { value: 1, label: "Grade 1", points: 2 },
          { value: 2, label: "Grade 2", points: 2 },
          { value: 3, label: "Grade 3", points: 3 },
          { value: 4, label: "Grade 4", points: 3 }
        ]
      }
    ],
    calculation: {
      type: "points",
      minScore: 5,
      maxScore: 15,
      classRanges: [
        { min: 5, max: 6, class: "A" },
        { min: 7, max: 9, class: "B" },
        { min: 10, max: 15, class: "C" }
      ]
    },
    interpretation: {
      "5-6": {
        class: "A",
        description: "Well-compensated disease",
        oneYearSurvival: "100%",
        twoYearSurvival: "85%"
      },
      "7-9": {
        class: "B",
        description: "Significant functional compromise",
        oneYearSurvival: "80%",
        twoYearSurvival: "60%"
      },
      "10-15": {
        class: "C",
        description: "Decompensated disease",
        oneYearSurvival: "45%",
        twoYearSurvival: "35%"
      }
    },
    references: [
      "Child CG, Turcotte JG. Surgery and portal hypertension. In: The liver and portal hypertension. Edited by CG Child. Philadelphia: Saunders 1964:50-64.",
      "Pugh RN, Murray-Lyon IM, Dawson JL, Pietroni MC, Williams R. Transection of the oesophagus for bleeding oesophageal varices. Br J Surg 1973; 60:646-49."
    ]
  },
  {
    id: "meld",
    name: "MELD",
    fullName: "Model for End-Stage Liver Disease (MELD)",
    category: "HEPATIC",
    description:
      "Predicts short-term mortality in advanced liver disease using bilirubin, INR, and creatinine.",
    parameters: [
      {
        name: "bilirubin",
        type: "NUMERIC",
        unit: "mg/dL",
        category: "BIOCHEMICAL",
        normalRange: { min: 0.3, max: 1.2 }
      },
      {
        name: "inr",
        type: "NUMERIC",
        unit: null,
        category: "BIOCHEMICAL",
        normalRange: { min: 0.9, max: 1.2 }
      },
      {
        name: "creatinine",
        type: "NUMERIC",
        unit: "mg/dL",
        category: "BIOCHEMICAL",
        normalRange: { min: 0.7, max: 1.3 }
      }
    ],
    calculation: {
      type: "formula",
      minScore: 6,
      maxScore: 40,
      formula:
        "MELD = 3.78*ln(max(bilirubin,1)) + 11.2*ln(max(INR,1)) + 9.57*ln(max(creatinine,1)) + 6.43"
    },
    interpretation: {
      "6-9": {
        description: "Lower short-term mortality risk",
        threeMonthMortality: "1.9%"
      },
      "10-19": {
        description: "Moderate short-term mortality risk",
        threeMonthMortality: "6.0%"
      },
      "20-29": {
        description: "High short-term mortality risk",
        threeMonthMortality: "19.6%"
      },
      "30-39": {
        description: "Very high short-term mortality risk",
        threeMonthMortality: "52.6%"
      },
      "40+": {
        description: "Critical short-term mortality risk",
        threeMonthMortality: "71.3%"
      }
    },
    references: [
      "Kamath PS, Wiesner RH, Malinchoc M, et al. A model to predict survival in patients with end-stage liver disease. Hepatology. 2001;33(2):464-470.",
      "United Network for Organ Sharing (UNOS). MELD/PELD allocation policy."
    ]
  },
  {
    id: "apache_ii",
    name: "APACHE II",
    fullName: "Acute Physiology and Chronic Health Evaluation II",
    category: "CRITICAL_CARE",
    description:
      "ICU severity score combining acute physiology, age, and chronic health status from first 24 hours.",
    parameters: [
      {
        name: "temperatureC",
        type: "NUMERIC",
        unit: "deg C",
        category: "CLINICAL"
      },
      {
        name: "meanArterialPressure",
        type: "NUMERIC",
        unit: "mmHg",
        category: "CLINICAL"
      },
      {
        name: "heartRate",
        type: "NUMERIC",
        unit: "bpm",
        category: "CLINICAL"
      },
      {
        name: "respiratoryRate",
        type: "NUMERIC",
        unit: "breaths/min",
        category: "CLINICAL"
      },
      {
        name: "fio2",
        type: "NUMERIC",
        unit: "fraction",
        category: "CLINICAL"
      },
      {
        name: "pao2",
        type: "NUMERIC",
        unit: "mmHg",
        category: "BIOCHEMICAL"
      },
      {
        name: "aaGradient",
        type: "NUMERIC",
        unit: "mmHg",
        category: "BIOCHEMICAL"
      },
      {
        name: "arterialPh",
        type: "NUMERIC",
        unit: null,
        category: "BIOCHEMICAL"
      },
      {
        name: "serumBicarbonate",
        type: "NUMERIC",
        unit: "mEq/L",
        category: "BIOCHEMICAL"
      },
      {
        name: "sodium",
        type: "NUMERIC",
        unit: "mmol/L",
        category: "BIOCHEMICAL"
      },
      {
        name: "potassium",
        type: "NUMERIC",
        unit: "mmol/L",
        category: "BIOCHEMICAL"
      },
      {
        name: "creatinine",
        type: "NUMERIC",
        unit: "mg/dL",
        category: "BIOCHEMICAL"
      },
      {
        name: "acuteRenalFailure",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "hematocrit",
        type: "NUMERIC",
        unit: "%",
        category: "BIOCHEMICAL"
      },
      {
        name: "whiteBloodCellCount",
        type: "NUMERIC",
        unit: "10^3/uL",
        category: "BIOCHEMICAL"
      },
      {
        name: "glasgowComaScale",
        type: "NUMERIC",
        unit: "points",
        category: "CLINICAL"
      },
      {
        name: "age",
        type: "NUMERIC",
        unit: "years",
        category: "CLINICAL"
      },
      {
        name: "chronicHealthState",
        type: "CATEGORICAL",
        unit: null,
        category: "CLINICAL",
        options: [
          { value: "none", label: "None", points: 0 },
          { value: "elective_postop", label: "Elective postoperative", points: 2 },
          { value: "emergency_postop", label: "Emergency postoperative", points: 5 },
          { value: "nonoperative", label: "Nonoperative", points: 5 }
        ]
      }
    ],
    calculation: {
      type: "points",
      minScore: 0,
      maxScore: 71,
      notes: "Use PaO2 if FiO2 < 0.5, A-a gradient if FiO2 >= 0.5; use HCO3 if arterial pH unavailable."
    },
    interpretation: {
      "0-4": { description: "Low severity", estimatedHospitalMortality: "~4%" },
      "5-9": { description: "Mild severity", estimatedHospitalMortality: "~8%" },
      "10-14": { description: "Moderate severity", estimatedHospitalMortality: "~15%" },
      "15-19": { description: "Substantial severity", estimatedHospitalMortality: "~25%" },
      "20-24": { description: "High severity", estimatedHospitalMortality: "~40%" },
      "25-29": { description: "Very high severity", estimatedHospitalMortality: "~55%" },
      "30-34": { description: "Critical severity", estimatedHospitalMortality: "~75%" },
      "35+": { description: "Extremely critical severity", estimatedHospitalMortality: "~85%" }
    },
    references: [
      "Knaus WA, Draper EA, Wagner DP, Zimmerman JE. APACHE II: a severity of disease classification system. Crit Care Med. 1985;13(10):818-829.",
      "MSD Manual Professional Edition. APACHE II Scoring System."
    ]
  },
  {
    id: "sofa",
    name: "SOFA",
    fullName: "Sequential Organ Failure Assessment (SOFA)",
    category: "CRITICAL_CARE",
    description:
      "Tracks acute organ dysfunction in ICU/sepsis across respiratory, coagulation, liver, cardiovascular, CNS, and renal systems.",
    parameters: [
      {
        name: "pao2fio2",
        type: "NUMERIC",
        unit: "ratio",
        category: "BIOCHEMICAL"
      },
      {
        name: "onRespiratorySupport",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "platelets",
        type: "NUMERIC",
        unit: "10^3/uL",
        category: "BIOCHEMICAL"
      },
      {
        name: "bilirubin",
        type: "NUMERIC",
        unit: "mg/dL",
        category: "BIOCHEMICAL"
      },
      {
        name: "meanArterialPressure",
        type: "NUMERIC",
        unit: "mmHg",
        category: "CLINICAL"
      },
      {
        name: "dopamine",
        type: "NUMERIC",
        unit: "mcg/kg/min",
        category: "CLINICAL"
      },
      {
        name: "dobutamine",
        type: "NUMERIC",
        unit: "mcg/kg/min",
        category: "CLINICAL"
      },
      {
        name: "epinephrine",
        type: "NUMERIC",
        unit: "mcg/kg/min",
        category: "CLINICAL"
      },
      {
        name: "norepinephrine",
        type: "NUMERIC",
        unit: "mcg/kg/min",
        category: "CLINICAL"
      },
      {
        name: "glasgowComaScale",
        type: "NUMERIC",
        unit: "points",
        category: "CLINICAL"
      },
      {
        name: "creatinine",
        type: "NUMERIC",
        unit: "mg/dL",
        category: "BIOCHEMICAL"
      },
      {
        name: "urineOutput",
        type: "NUMERIC",
        unit: "mL/day",
        category: "CLINICAL"
      }
    ],
    calculation: {
      type: "points",
      minScore: 0,
      maxScore: 24
    },
    interpretation: {
      "0-1": { description: "No significant organ dysfunction" },
      "2-5": { description: "Mild organ dysfunction" },
      "6-9": { description: "Moderate organ dysfunction" },
      "10-12": { description: "Severe organ dysfunction" },
      "13+": { description: "Critical multi-organ dysfunction" }
    },
    references: [
      "Vincent JL, de Mendonca A, Cantraine F, et al. Use of the SOFA score to assess the incidence of organ dysfunction/failure in intensive care units. Crit Care Med. 1998;26(11):1793-1800.",
      "Singer M, Deutschman CS, Seymour CW, et al. The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA. 2016;315(8):801-810."
    ]
  },
  {
    id: "wells_dvt",
    name: "Wells DVT",
    fullName: "Wells Criteria for Deep Vein Thrombosis",
    category: "VASCULAR",
    description: "Estimates pretest probability of lower-extremity DVT.",
    parameters: [
      {
        name: "activeCancer",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "paralysisOrRecentImmobilization",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "recentlyBedriddenOrMajorSurgery",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "localizedTendernessAlongDeepVenousSystem",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "entireLegSwollen",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "calfSwellingAtLeast3cm",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "pittingEdemaConfinedToSymptomaticLeg",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "collateralSuperficialVeins",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "previousDvt",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "alternativeDiagnosisAsLikelyOrMoreLikely",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      }
    ],
    calculation: {
      type: "points",
      minScore: -2,
      maxScore: 9,
      notes: "Each positive criterion scores +1 except alternative diagnosis scores -2."
    },
    interpretation: {
      "<=0": { description: "Low pretest probability" },
      "1-2": { description: "Moderate pretest probability" },
      ">=3": { description: "High pretest probability" },
      "two_level": {
        dvtLikelyThreshold: ">=2",
        dvtUnlikelyThreshold: "<2"
      }
    },
    references: [
      "Wells PS, Anderson DR, Bormanis J, et al. Value of assessment of pretest probability of deep-vein thrombosis in clinical management. Lancet. 1997;350(9094):1795-1798.",
      "National Institute for Health and Care Excellence (NICE). Venous thromboembolic diseases: diagnosis and management (NG158)."
    ]
  },
  {
    id: "wells_pe",
    name: "Wells PE",
    fullName: "Wells Criteria for Pulmonary Embolism",
    category: "VASCULAR",
    description: "Estimates pretest probability of acute pulmonary embolism.",
    parameters: [
      {
        name: "clinicalSignsOfDvt",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "peMostLikelyDiagnosis",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "heartRate",
        type: "NUMERIC",
        unit: "bpm",
        category: "CLINICAL"
      },
      {
        name: "immobilizationOrRecentSurgery",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "previousDvtOrPe",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "hemoptysis",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "malignancy",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      }
    ],
    calculation: {
      type: "points",
      minScore: 0,
      maxScore: 12.5
    },
    interpretation: {
      "<2": { description: "Low pretest probability", estimatedPrevalence: "~1.3%" },
      "2-6": { description: "Moderate pretest probability", estimatedPrevalence: "~16.2%" },
      ">6": { description: "High pretest probability", estimatedPrevalence: "~37.5%" },
      "two_level": {
        peLikelyThreshold: ">4",
        peUnlikelyThreshold: "<=4"
      }
    },
    references: [
      "Wells PS, Anderson DR, Rodger M, et al. Excluding pulmonary embolism at the bedside without diagnostic imaging: management of patients with suspected pulmonary embolism presenting to the emergency department by using a simple clinical model and D-dimer. Ann Intern Med. 2001;135(2):98-107.",
      "National Institute for Health and Care Excellence (NICE). Venous thromboembolic diseases: diagnosis and management (NG158)."
    ]
  },
  {
    id: "cha2ds2_vasc",
    name: "CHA2DS2-VASc",
    fullName: "CHA2DS2-VASc Stroke Risk Score for Atrial Fibrillation",
    category: "CARDIAC",
    description:
      "Estimates thromboembolic risk in nonvalvular atrial fibrillation to guide anticoagulation decisions.",
    parameters: [
      {
        name: "congestiveHeartFailureOrLeftVentricularDysfunction",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "hypertension",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "age",
        type: "NUMERIC",
        unit: "years",
        category: "CLINICAL"
      },
      {
        name: "diabetesMellitus",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "priorStrokeTiaOrThromboembolism",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "vascularDisease",
        type: "BOOLEAN",
        unit: null,
        category: "CLINICAL"
      },
      {
        name: "sex",
        type: "CATEGORICAL",
        unit: null,
        category: "CLINICAL",
        options: [
          { value: "male", label: "Male", points: 0 },
          { value: "female", label: "Female", points: 1 }
        ]
      }
    ],
    calculation: {
      type: "points",
      minScore: 0,
      maxScore: 9
    },
    interpretation: {
      lowRisk: {
        men: "0",
        women: "1 (sex category point alone)"
      },
      intermediateRisk: {
        men: "1",
        women: "2"
      },
      highRisk: {
        men: ">=2",
        women: ">=3"
      }
    },
    references: [
      "Lip GYH, Nieuwlaat R, Pisters R, Lane DA, Crijns HJGM. Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation using a novel risk factor-based approach: the euro heart survey on atrial fibrillation. Chest. 2010;137(2):263-272.",
      "Joglar JA, Chung MK, Armbruster AL, et al. 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation. Circulation. 2024;149:e1-e156."
    ]
  }
];
