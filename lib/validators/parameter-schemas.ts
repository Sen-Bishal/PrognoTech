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
