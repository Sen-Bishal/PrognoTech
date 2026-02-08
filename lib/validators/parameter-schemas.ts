import { z } from "zod";

export const childPughSchema = z.object({
  bilirubin: z.number().min(0).max(50),
  albumin: z.number().min(0).max(10),
  inr: z.number().min(0.5).max(10),
  ascites: z.enum(["none", "mild", "moderate_to_severe"]),
  encephalopathy: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4)
  ])
});

export const meldSchema = z.object({
  bilirubin: z.number().min(0.1).max(50),
  inr: z.number().min(0.5).max(10),
  creatinine: z.number().min(0.1).max(15)
});

export const apacheIISchema = z
  .object({
    temperatureC: z.number().min(25).max(45),
    meanArterialPressure: z.number().min(0).max(250),
    heartRate: z.number().min(0).max(300),
    respiratoryRate: z.number().min(0).max(80),
    fio2: z.number().min(0.21).max(1),
    pao2: z.number().min(20).max(700).optional(),
    aaGradient: z.number().min(0).max(700).optional(),
    arterialPh: z.number().min(6.8).max(7.8).optional(),
    serumBicarbonate: z.number().min(5).max(60).optional(),
    sodium: z.number().min(90).max(220),
    potassium: z.number().min(1).max(12),
    creatinine: z.number().min(0.1).max(20),
    acuteRenalFailure: z.boolean(),
    hematocrit: z.number().min(5).max(80),
    whiteBloodCellCount: z.number().min(0.1).max(80),
    glasgowComaScale: z.number().int().min(3).max(15),
    age: z.number().int().min(0).max(120),
    chronicHealthState: z.enum(["none", "elective_postop", "emergency_postop", "nonoperative"])
  })
  .superRefine((value, ctx) => {
    if (value.fio2 >= 0.5 && typeof value.aaGradient !== "number") {
      ctx.addIssue({
        code: "custom",
        path: ["aaGradient"],
        message: "A-a gradient is required when FiO2 is 0.5 or higher."
      });
    }

    if (value.fio2 < 0.5 && typeof value.pao2 !== "number") {
      ctx.addIssue({
        code: "custom",
        path: ["pao2"],
        message: "PaO2 is required when FiO2 is below 0.5."
      });
    }

    if (typeof value.arterialPh !== "number" && typeof value.serumBicarbonate !== "number") {
      ctx.addIssue({
        code: "custom",
        path: ["arterialPh"],
        message: "Provide arterial pH or serum bicarbonate for acid-base scoring."
      });
    }
  });

export const sofaSchema = z.object({
  pao2fio2: z.number().min(20).max(600),
  onRespiratorySupport: z.boolean(),
  platelets: z.number().min(0).max(2000),
  bilirubin: z.number().min(0).max(60),
  meanArterialPressure: z.number().min(0).max(250),
  dopamine: z.number().min(0).max(50).default(0),
  dobutamine: z.number().min(0).max(50).default(0),
  epinephrine: z.number().min(0).max(2).default(0),
  norepinephrine: z.number().min(0).max(2).default(0),
  glasgowComaScale: z.number().int().min(3).max(15),
  creatinine: z.number().min(0).max(20),
  urineOutput: z.number().min(0).max(12000).optional()
});

export const wellsDvtSchema = z.object({
  activeCancer: z.boolean(),
  paralysisOrRecentImmobilization: z.boolean(),
  recentlyBedriddenOrMajorSurgery: z.boolean(),
  localizedTendernessAlongDeepVenousSystem: z.boolean(),
  entireLegSwollen: z.boolean(),
  calfSwellingAtLeast3cm: z.boolean(),
  pittingEdemaConfinedToSymptomaticLeg: z.boolean(),
  collateralSuperficialVeins: z.boolean(),
  previousDvt: z.boolean(),
  alternativeDiagnosisAsLikelyOrMoreLikely: z.boolean()
});

export const wellsPeSchema = z.object({
  clinicalSignsOfDvt: z.boolean(),
  peMostLikelyDiagnosis: z.boolean(),
  heartRate: z.number().min(0).max(280),
  immobilizationOrRecentSurgery: z.boolean(),
  previousDvtOrPe: z.boolean(),
  hemoptysis: z.boolean(),
  malignancy: z.boolean()
});

export const cha2ds2VascSchema = z.object({
  congestiveHeartFailureOrLeftVentricularDysfunction: z.boolean(),
  hypertension: z.boolean(),
  age: z.number().int().min(0).max(120),
  diabetesMellitus: z.boolean(),
  priorStrokeTiaOrThromboembolism: z.boolean(),
  vascularDisease: z.boolean(),
  sex: z.enum(["male", "female"])
});
