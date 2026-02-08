export type Category =
  | "HEPATIC"
  | "CARDIAC"
  | "VASCULAR"
  | "CRITICAL_CARE"
  | "ONCOLOGY"
  | "TRAUMA"
  | "NEUROLOGICAL"
  | "SEPSIS"
  | "RENAL"
  | "RESPIRATORY";

export type ParameterType = "NUMERIC" | "CATEGORICAL" | "BOOLEAN";

export type DataCategory =
  | "CLINICAL"
  | "BIOCHEMICAL"
  | "RADIOLOGICAL"
  | "HISTOPATHOLOGICAL";

export interface ParameterRange {
  min: number;
  max: number;
  points: number;
}

export interface ParameterOption {
  value: string | number | boolean;
  label: string;
  points: number;
}

export interface ParameterDefinition {
  name: string;
  type: ParameterType;
  unit?: string | null;
  category: DataCategory;
  normalRange?: {
    min: number;
    max: number;
  } | null;
  ranges?: ParameterRange[];
  options?: ParameterOption[];
}

export interface ScoringSystemDefinition {
  id: string;
  name: string;
  fullName: string;
  category: Category;
  description: string;
  parameters: ParameterDefinition[];
  calculation: Record<string, unknown>;
  interpretation: Record<string, unknown>;
  references: string[];
}

export interface CalculationResult {
  score?: number;
  interpretation: string;
  class?: string;
  [key: string]: unknown;
}
