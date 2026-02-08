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
  }
];
