"use client";

import { useEffect, useMemo, useState } from "react";
import { scoringSystems } from "@/lib/db/seed-data";
import type {
  ApacheIIResult,
  Cha2ds2VascResult,
  ChildPughResult,
  MeldResult,
  SofaResult,
  WellsDvtResult,
  WellsPeResult
} from "@/lib/calculators";
import {
  apacheIISchema,
  cha2ds2VascSchema,
  childPughSchema,
  meldSchema,
  sofaSchema,
  wellsDvtSchema,
  wellsPeSchema
} from "@/lib/validators/parameter-schemas";
import {
  guessScoringSystemFromSearch,
  type ScoringSystemGuess
} from "@/lib/scoring-system-matcher";
import type { ParameterDefinition, ScoringSystemDefinition } from "@/lib/types/scoring";

type InputState = Record<string, string>;
type CalculationResultView =
  | ChildPughResult
  | MeldResult
  | ApacheIIResult
  | SofaResult
  | WellsDvtResult
  | WellsPeResult
  | Cha2ds2VascResult;

const cardShadow = "shadow-[0_16px_38px_-20px_rgba(15,23,42,0.55)]";
const topShadow = "shadow-[0_28px_58px_-28px_rgba(15,23,42,0.68)]";
const defaultSystemId = scoringSystems[0]?.id ?? "child_pugh";

const getSystemById = (systemId: string): ScoringSystemDefinition => {
  const system = scoringSystems.find((item) => item.id === systemId);
  if (!system) {
    throw new Error(`Scoring system definition not found: ${systemId}`);
  }
  return system;
};

const buildInitialState = (system: ScoringSystemDefinition): InputState => {
  const initial: InputState = {};
  for (const param of system.parameters) {
    initial[param.name] = "";
  }
  return initial;
};

const buildTestState = (systemId: string, values: Record<string, string>) => ({
  ...buildInitialState(getSystemById(systemId)),
  ...values
});

const testParameterSetsBySystemId: Record<
  string,
  Array<{ id: string; label: string; values: InputState }>
> = {
  child_pugh: [
    {
      id: "cp-a",
      label: "Load Class A",
      values: buildTestState("child_pugh", {
        bilirubin: "1.1",
        albumin: "4.2",
        inr: "1.2",
        ascites: "none",
        encephalopathy: "0"
      })
    },
    {
      id: "cp-b",
      label: "Load Class B",
      values: buildTestState("child_pugh", {
        bilirubin: "2.8",
        albumin: "3.1",
        inr: "1.9",
        ascites: "none",
        encephalopathy: "1"
      })
    },
    {
      id: "cp-c",
      label: "Load Class C",
      values: buildTestState("child_pugh", {
        bilirubin: "6.2",
        albumin: "2.1",
        inr: "3.4",
        ascites: "moderate_to_severe",
        encephalopathy: "4"
      })
    }
  ],
  meld: [
    {
      id: "meld-low",
      label: "Load MELD Low",
      values: buildTestState("meld", { bilirubin: "1", inr: "1", creatinine: "1" })
    },
    {
      id: "meld-high",
      label: "Load MELD High",
      values: buildTestState("meld", { bilirubin: "4", inr: "3", creatinine: "3" })
    }
  ],
  apache_ii: [
    {
      id: "apache-low",
      label: "Load APACHE II Low",
      values: buildTestState("apache_ii", {
        temperatureC: "37",
        meanArterialPressure: "85",
        heartRate: "90",
        respiratoryRate: "16",
        fio2: "0.21",
        pao2: "92",
        aaGradient: "",
        arterialPh: "7.4",
        serumBicarbonate: "",
        sodium: "140",
        potassium: "4.2",
        creatinine: "1",
        acuteRenalFailure: "false",
        hematocrit: "40",
        whiteBloodCellCount: "8",
        glasgowComaScale: "15",
        age: "35",
        chronicHealthState: "none"
      })
    },
    {
      id: "apache-high",
      label: "Load APACHE II High",
      values: buildTestState("apache_ii", {
        temperatureC: "40",
        meanArterialPressure: "45",
        heartRate: "150",
        respiratoryRate: "40",
        fio2: "0.7",
        pao2: "",
        aaGradient: "420",
        arterialPh: "7.2",
        serumBicarbonate: "",
        sodium: "160",
        potassium: "6.5",
        creatinine: "4",
        acuteRenalFailure: "true",
        hematocrit: "25",
        whiteBloodCellCount: "22",
        glasgowComaScale: "7",
        age: "78",
        chronicHealthState: "emergency_postop"
      })
    }
  ],
  sofa: [
    {
      id: "sofa-low",
      label: "Load SOFA Low",
      values: buildTestState("sofa", {
        pao2fio2: "420",
        onRespiratorySupport: "false",
        platelets: "220",
        bilirubin: "0.9",
        meanArterialPressure: "80",
        dopamine: "0",
        dobutamine: "0",
        epinephrine: "0",
        norepinephrine: "0",
        glasgowComaScale: "15",
        creatinine: "0.9",
        urineOutput: "1500"
      })
    },
    {
      id: "sofa-high",
      label: "Load SOFA High",
      values: buildTestState("sofa", {
        pao2fio2: "90",
        onRespiratorySupport: "true",
        platelets: "15",
        bilirubin: "13",
        meanArterialPressure: "55",
        dopamine: "18",
        dobutamine: "0",
        epinephrine: "0.2",
        norepinephrine: "0.3",
        glasgowComaScale: "5",
        creatinine: "5.5",
        urineOutput: "150"
      })
    }
  ],
  wells_dvt: [
    {
      id: "dvt-unlikely",
      label: "Load DVT Unlikely",
      values: buildTestState("wells_dvt", {
        activeCancer: "false",
        paralysisOrRecentImmobilization: "false",
        recentlyBedriddenOrMajorSurgery: "false",
        localizedTendernessAlongDeepVenousSystem: "true",
        entireLegSwollen: "false",
        calfSwellingAtLeast3cm: "false",
        pittingEdemaConfinedToSymptomaticLeg: "false",
        collateralSuperficialVeins: "false",
        previousDvt: "false",
        alternativeDiagnosisAsLikelyOrMoreLikely: "true"
      })
    },
    {
      id: "dvt-likely",
      label: "Load DVT Likely",
      values: buildTestState("wells_dvt", {
        activeCancer: "true",
        paralysisOrRecentImmobilization: "true",
        recentlyBedriddenOrMajorSurgery: "false",
        localizedTendernessAlongDeepVenousSystem: "true",
        entireLegSwollen: "true",
        calfSwellingAtLeast3cm: "true",
        pittingEdemaConfinedToSymptomaticLeg: "true",
        collateralSuperficialVeins: "false",
        previousDvt: "true",
        alternativeDiagnosisAsLikelyOrMoreLikely: "false"
      })
    }
  ],
  wells_pe: [
    {
      id: "pe-unlikely",
      label: "Load PE Unlikely",
      values: buildTestState("wells_pe", {
        clinicalSignsOfDvt: "false",
        peMostLikelyDiagnosis: "false",
        heartRate: "88",
        immobilizationOrRecentSurgery: "false",
        previousDvtOrPe: "false",
        hemoptysis: "false",
        malignancy: "false"
      })
    },
    {
      id: "pe-likely",
      label: "Load PE Likely",
      values: buildTestState("wells_pe", {
        clinicalSignsOfDvt: "true",
        peMostLikelyDiagnosis: "true",
        heartRate: "120",
        immobilizationOrRecentSurgery: "true",
        previousDvtOrPe: "true",
        hemoptysis: "true",
        malignancy: "true"
      })
    }
  ],
  cha2ds2_vasc: [
    {
      id: "cha2-low",
      label: "Load CHA2DS2 Low",
      values: buildTestState("cha2ds2_vasc", {
        congestiveHeartFailureOrLeftVentricularDysfunction: "false",
        hypertension: "false",
        age: "42",
        diabetesMellitus: "false",
        priorStrokeTiaOrThromboembolism: "false",
        vascularDisease: "false",
        sex: "male"
      })
    },
    {
      id: "cha2-high",
      label: "Load CHA2DS2 High",
      values: buildTestState("cha2ds2_vasc", {
        congestiveHeartFailureOrLeftVentricularDysfunction: "true",
        hypertension: "true",
        age: "78",
        diabetesMellitus: "true",
        priorStrokeTiaOrThromboembolism: "true",
        vascularDisease: "true",
        sex: "female"
      })
    }
  ]
};

const validatePayloadBySystem = (systemId: string, payload: Record<string, unknown>) => {
  switch (systemId) {
    case "child_pugh":
      return childPughSchema.parse(payload);
    case "meld":
      return meldSchema.parse(payload);
    case "apache_ii":
      return apacheIISchema.parse(payload);
    case "sofa":
      return sofaSchema.parse(payload);
    case "wells_dvt":
      return wellsDvtSchema.parse(payload);
    case "wells_pe":
      return wellsPeSchema.parse(payload);
    case "cha2ds2_vasc":
      return cha2ds2VascSchema.parse(payload);
    default:
      return payload;
  }
};

const optionalNumericParamsBySystem: Record<string, Set<string>> = {
  apache_ii: new Set(["pao2", "aaGradient", "arterialPh", "serumBicarbonate"]),
  sofa: new Set(["urineOutput"])
};

const isChildPughResult = (value: CalculationResultView): value is ChildPughResult =>
  "class" in value && "oneYearSurvival" in value;

const isMeldResult = (value: CalculationResultView): value is MeldResult =>
  "threeMonthMortality" in value;

const isApacheIIResult = (value: CalculationResultView): value is ApacheIIResult =>
  "estimatedHospitalMortality" in value;

const isSofaResult = (value: CalculationResultView): value is SofaResult =>
  "riskBand" in value;

const isWellsPeResult = (value: CalculationResultView): value is WellsPeResult =>
  "estimatedPrevalence" in value;

const isWellsDvtResult = (value: CalculationResultView): value is WellsDvtResult =>
  "twoTierLikelihood" in value && !("estimatedPrevalence" in value);

const isCha2ds2VascResult = (value: CalculationResultView): value is Cha2ds2VascResult =>
  "riskCategory" in value && "recommendation" in value;

const getInputDisplayValue = (param: ParameterDefinition, raw: string) => {
  if (!raw) return "--";
  if (param.type === "CATEGORICAL") {
    return param.options?.find((option) => String(option.value) === raw)?.label ?? raw;
  }
  if (param.type === "BOOLEAN") {
    return raw === "true" ? "True" : raw === "false" ? "False" : "--";
  }
  return param.unit ? `${raw} ${param.unit}` : raw;
};

const getPerioperativeMortality = (classValue: "A" | "B" | "C") => {
  if (classValue === "A") return "10%";
  if (classValue === "B") return "30%";
  return "65%";
};

const classTone = (value?: "A" | "B" | "C") => {
  if (value === "A") return "bg-emerald-100 text-emerald-800";
  if (value === "B") return "bg-amber-100 text-amber-800";
  if (value === "C") return "bg-rose-100 text-rose-800";
  return "bg-slate-100 text-slate-700";
};

const getScoreBounds = (system: ScoringSystemDefinition) => {
  const calculation = system.calculation as { minScore?: unknown; maxScore?: unknown };
  if (
    typeof calculation.minScore === "number" &&
    Number.isFinite(calculation.minScore) &&
    typeof calculation.maxScore === "number" &&
    Number.isFinite(calculation.maxScore) &&
    calculation.maxScore > calculation.minScore
  ) {
    return {
      minScore: calculation.minScore,
      maxScore: calculation.maxScore
    };
  }

  return null;
};

export const ChildPughCalculator = () => {
  const [activeSystemId, setActiveSystemId] = useState(defaultSystemId);
  const activeSystem = useMemo(() => getSystemById(activeSystemId), [activeSystemId]);
  const activeParameterNames = useMemo(
    () => new Set(activeSystem.parameters.map((param) => param.name)),
    [activeSystem]
  );
  const [inputs, setInputs] = useState<InputState>(() =>
    buildInitialState(getSystemById(defaultSystemId))
  );
  const [result, setResult] = useState<CalculationResultView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [parameterSearch, setParameterSearch] = useState("");
  const [guessedSystem, setGuessedSystem] = useState<ScoringSystemGuess | null>(null);
  const [calculationMeta, setCalculationMeta] = useState<{
    systemId: string;
    guessedFrom: "search" | "parameter_keys" | null;
    guessConfidence: number | null;
  } | null>(null);

  useEffect(() => {
    setInputs(buildInitialState(activeSystem));
    setResult(null);
    setError(null);
    setCalculationMeta(null);
  }, [activeSystem]);

  const updateInput = (name: string, value: string) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const updateSearch = (value: string) => {
    setParameterSearch(value);
    const trimmed = value.trim();
    if (!trimmed) {
      setGuessedSystem(null);
      return;
    }

    const guessed = guessScoringSystemFromSearch(trimmed);
    setGuessedSystem(guessed);
    if (guessed && guessed.system.id !== activeSystemId) {
      const hasUniqueMatch = guessed.matchedParameters.some(
        (parameter) => !activeParameterNames.has(parameter)
      );
      if (guessed.confidence >= 0.45 || hasUniqueMatch) {
        setActiveSystemId(guessed.system.id);
      }
    }
  };

  const applyTestParameters = (values: InputState) => {
    setInputs(values);
    setError(null);
    setResult(null);
    setCalculationMeta(null);
  };

  const buildPayload = () => {
    const payload: Record<string, unknown> = {};
    const optionalNumericParameters = optionalNumericParamsBySystem[activeSystem.id];

    for (const param of activeSystem.parameters) {
      const raw = inputs[param.name];
      if (param.type === "NUMERIC") {
        if (!raw) {
          if (optionalNumericParameters?.has(param.name)) {
            continue;
          }
          throw new Error(`Enter a valid value for ${param.name}.`);
        }
        const num = Number(raw);
        if (Number.isNaN(num)) throw new Error(`Enter a valid value for ${param.name}.`);
        payload[param.name] = num;
        continue;
      }
      if (param.type === "CATEGORICAL") {
        if (!raw) throw new Error(`Select an option for ${param.name}.`);
        const option = param.options?.find((item) => String(item.value) === raw);
        if (!option) throw new Error(`Invalid option for ${param.name}.`);
        payload[param.name] = option.value;
        continue;
      }
      if (param.type === "BOOLEAN") {
        if (raw !== "true" && raw !== "false") {
          throw new Error(`Select true/false for ${param.name}.`);
        }
        payload[param.name] = raw === "true";
        continue;
      }
      throw new Error(`Unsupported parameter type: ${param.type}`);
    }

    return validatePayloadBySystem(activeSystem.id, payload);
  };

  const handleCalculate = async () => {
    setError(null);
    setResult(null);
    setCalculationMeta(null);
    try {
      const payload = buildPayload();
      const requestBody: Record<string, unknown> = {
        systemId: activeSystem.id,
        parameters: payload
      };
      if (parameterSearch.trim()) requestBody.parameterSearch = parameterSearch.trim();

      setLoading(true);
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Calculation failed.");

      setResult(data.result as CalculationResultView);
      setCalculationMeta({
        systemId: String(data.systemId ?? ""),
        guessedFrom:
          data.guessedFrom === "search" || data.guessedFrom === "parameter_keys"
            ? data.guessedFrom
            : null,
        guessConfidence: typeof data.guessConfidence === "number" ? data.guessConfidence : null
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  const childPughResult = result && isChildPughResult(result) ? result : null;
  const meldResult = result && isMeldResult(result) ? result : null;
  const apacheIIResult = result && isApacheIIResult(result) ? result : null;
  const sofaResult = result && isSofaResult(result) ? result : null;
  const wellsDvtResult = result && isWellsDvtResult(result) ? result : null;
  const wellsPeResult = result && isWellsPeResult(result) ? result : null;
  const cha2ds2VascResult = result && isCha2ds2VascResult(result) ? result : null;

  const perioperativeMortality = childPughResult
    ? getPerioperativeMortality(childPughResult.class)
    : "30%";

  const gaugePercent = useMemo(() => {
    if (!result) return 22;
    const bounds = getScoreBounds(activeSystem);
    if (!bounds) return 0;
    return Math.max(
      0,
      Math.min(
        100,
        ((result.totalScore - bounds.minScore) / (bounds.maxScore - bounds.minScore)) * 100
      )
    );
  }, [activeSystem, result]);

  const summaryCards = useMemo(() => {
    if (!result) {
      return [
        { label: "Primary Metric", value: "--" },
        { label: "Secondary Metric", value: "--" },
        { label: "Tertiary Metric", value: "--" }
      ];
    }

    if (childPughResult) {
      return [
        { label: "1-Year Survival", value: childPughResult.oneYearSurvival },
        { label: "2-Year Survival", value: childPughResult.twoYearSurvival },
        { label: "Perioperative Mortality", value: perioperativeMortality }
      ];
    }

    if (meldResult) {
      return [
        { label: "3-Month Mortality", value: meldResult.threeMonthMortality },
        { label: "MELD Score", value: meldResult.totalScore },
        { label: "Creatinine Used", value: meldResult.breakdown.creatinineUsed }
      ];
    }

    if (apacheIIResult) {
      return [
        { label: "Hospital Mortality", value: apacheIIResult.estimatedHospitalMortality },
        { label: "Acute Physiology", value: apacheIIResult.breakdown.acutePhysiologyScore },
        { label: "Chronic Health Pts", value: apacheIIResult.breakdown.chronicHealthPoints }
      ];
    }

    if (sofaResult) {
      return [
        { label: "Risk Band", value: sofaResult.riskBand },
        { label: "Respiratory", value: sofaResult.breakdown.respiratory },
        { label: "Renal", value: sofaResult.breakdown.renal }
      ];
    }

    if (wellsDvtResult) {
      return [
        { label: "Pretest Probability", value: wellsDvtResult.pretestProbability.toUpperCase() },
        {
          label: "Two-Tier",
          value: wellsDvtResult.twoTierLikelihood === "dvt_likely" ? "DVT LIKELY" : "DVT UNLIKELY"
        },
        { label: "Positive Criteria", value: wellsDvtResult.breakdown.positiveCriteriaCount }
      ];
    }

    if (wellsPeResult) {
      return [
        { label: "Pretest Probability", value: wellsPeResult.pretestProbability.toUpperCase() },
        {
          label: "Two-Tier",
          value: wellsPeResult.twoTierLikelihood === "pe_likely" ? "PE LIKELY" : "PE UNLIKELY"
        },
        { label: "Estimated Prevalence", value: wellsPeResult.estimatedPrevalence }
      ];
    }

    if (cha2ds2VascResult) {
      return [
        { label: "Risk Category", value: cha2ds2VascResult.riskCategory.toUpperCase() },
        { label: "Non-sex Score", value: cha2ds2VascResult.breakdown.nonSexScore },
        { label: "Sex Category Pt", value: cha2ds2VascResult.breakdown.sexCategory }
      ];
    }

    return [
      { label: "Primary Metric", value: "--" },
      { label: "Secondary Metric", value: "--" },
      { label: "Tertiary Metric", value: "--" }
    ];
  }, [
    apacheIIResult,
    cha2ds2VascResult,
    childPughResult,
    meldResult,
    perioperativeMortality,
    result,
    sofaResult,
    wellsDvtResult,
    wellsPeResult
  ]);

  const summaryValueClass = (value: string | number) => {
    const text = String(value);
    if (text.length <= 8) return "text-4xl";
    if (text.length <= 20) return "text-2xl";
    return "text-sm leading-5";
  };

  const gaugeColor = gaugePercent > 70 ? "#ef4444" : gaugePercent > 45 ? "#f59e0b" : "#2563eb";
  const gaugeDegrees = Math.round((gaugePercent / 100) * 360);

  const pointsByParam = childPughResult
    ? {
        bilirubin: childPughResult.breakdown.bilirubinPoints,
        albumin: childPughResult.breakdown.albuminPoints,
        inr: childPughResult.breakdown.inrPoints,
        ascites: childPughResult.breakdown.ascitesPoints,
        encephalopathy: childPughResult.breakdown.encephalopathyPoints
      }
    : null;

  const recommendations = childPughResult
    ? childPughResult.class === "A"
      ? [
          "Monitor LFT and coagulation profile every 3-6 months.",
          "Maintain surveillance for varices and HCC.",
          "Optimize metabolic and cardiovascular risks."
        ]
      : childPughResult.class === "B"
        ? [
            "Schedule LFT/coagulation checks every 3 months.",
            "Review hepatically metabolized medications.",
            "Start transplant eligibility discussion if condition worsens."
          ]
        : [
            "Escalate care with hepatology and transplant teams.",
            "Aggressively manage decompensation signs.",
            "Use a lower admission threshold on acute decline."
          ]
    : meldResult
      ? [
          "Trend MELD with repeat labs to monitor trajectory.",
          "Escalate to transplant center with high-risk values.",
          "Prioritize infection prevention and renal protection."
        ]
      : apacheIIResult
        ? [
            "Reassess APACHE II with evolving physiology and interventions.",
            "Use score trends to support level-of-care and monitoring decisions.",
            "Interpret mortality estimate with diagnosis-specific context."
          ]
        : sofaResult
          ? [
              "Track daily SOFA trajectory to detect response or deterioration.",
              "Escalate support for worsening organ-system subscores.",
              "Use SOFA changes with source control and infection trends."
            ]
          : wellsDvtResult
            ? [
                "Use D-dimer and compression ultrasound based on pretest probability.",
                "Do not diagnose or exclude DVT from Wells score alone.",
                "Reassess promptly if symptoms progress."
              ]
            : wellsPeResult
              ? [
                  "Integrate Wells PE with D-dimer and imaging pathways.",
                  "Escalate immediately for hemodynamic instability.",
                  "Reassess probability if new PE signs appear."
                ]
              : cha2ds2VascResult
                ? [
                    cha2ds2VascResult.recommendation,
                    "Pair stroke-risk scoring with bleeding-risk assessment.",
                    "Recalculate when major risk factors change."
                  ]
                : [
                    "Enter full parameter set and run the calculation.",
                    "Use search terms to auto-switch score systems.",
                    "Interpret outputs with clinical context."
                  ];

  const activePresets = testParameterSetsBySystemId[activeSystem.id] ?? [];
  const comparisonSystems = scoringSystems.filter((item) => item.id !== activeSystem.id);
  const headingSystemName =
    parameterSearch.trim() && guessedSystem
      ? guessedSystem.system.fullName
      : activeSystem.fullName;

  return (
    <div className="space-y-5">
      <section className={`rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 ${topShadow}`}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Patients &gt; John Doe &gt; Prognosis Report
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">{headingSystemName}</h2>
            <p className="text-sm text-slate-600">
              Assessment for Patient ID: #48291 | Last updated: Today, 09:42 AM
            </p>
            {calculationMeta ? (
              <p className="text-xs text-slate-500">
                Calculated with {calculationMeta.systemId}
                {calculationMeta.guessedFrom
                  ? ` via ${calculationMeta.guessedFrom.replace("_", " ")}`
                  : ""}
                .
              </p>
            ) : null}
          </div>

          <div className="w-full max-w-xl space-y-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <input
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Search parameters (bilirubin, creatinine...)"
                value={parameterSearch}
                onChange={(event) => updateSearch(event.target.value)}
              />
              <select
                className="min-w-44 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={activeSystem.id}
                onChange={(event) => setActiveSystemId(event.target.value)}
              >
                {scoringSystems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.fullName}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                onClick={handleCalculate}
                disabled={loading}
              >
                {loading ? "Calculating..." : "Recalculate"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {activePresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                  onClick={() => applyTestParameters(preset.values)}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {parameterSearch.trim() ? (
              guessedSystem ? (
                <p className="text-sm font-semibold text-blue-700">
                  Scoring test: {guessedSystem.system.fullName} (
                  {Math.round(guessedSystem.confidence * 100)}% confidence)
                </p>
              ) : (
                <p className="text-sm font-semibold text-amber-700">
                  Searching scoring test...
                </p>
              )
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <div className="order-2 space-y-4 xl:order-1">
          <article className={`rounded-2xl border border-slate-200 bg-white p-5 ${cardShadow}`}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Total Score</h3>
              {childPughResult ? (
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${classTone(childPughResult.class)}`}>
                  Class {childPughResult.class}
                </span>
              ) : null}
            </div>
            <div className="mx-auto w-fit">
              <div
                className="relative h-44 w-44 rounded-full p-3"
                style={{ background: `conic-gradient(${gaugeColor} ${gaugeDegrees}deg, #e5e7eb ${gaugeDegrees}deg)` }}
              >
                <div className="absolute inset-3 rounded-full bg-white shadow-inner shadow-slate-300/60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-slate-900">
                    {result ? result.totalScore : "--"}
                  </span>
                  <span className="text-xs font-semibold uppercase text-slate-500">points</span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-sm text-slate-700">
              {result ? result.interpretation : "Enter parameters and run calculation."}
            </p>
          </article>

          <article className={`rounded-2xl border border-slate-200 bg-white p-5 ${cardShadow}`}>
            <h3 className="mb-3 text-base font-bold text-slate-900">Contributing Factors</h3>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/80">
              {activeSystem.parameters.map((param) => {
                const points = pointsByParam?.[param.name as keyof typeof pointsByParam];
                return (
                  <div key={param.name} className="grid grid-cols-[1fr_auto] gap-2 px-3 py-2.5">
                    <span className="text-xs font-semibold text-slate-600">{param.name.replace(/_/g, " ")}</span>
                    <span className="text-xs font-semibold text-slate-900">
                      {getInputDisplayValue(param, inputs[param.name] ?? "")}
                      {typeof points === "number" ? (
                        <span className="ml-1 text-[11px] text-blue-700">({points} pts)</span>
                      ) : null}
                    </span>
                  </div>
                );
              })}
            </div>
          </article>
        </div>

        <div className="order-1 flex flex-col gap-4 xl:order-2">
          <article className={`order-1 rounded-2xl border border-slate-200 bg-white p-5 ${cardShadow} xl:order-4`}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Edit Inputs</h3>
              <button
                type="button"
                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:bg-slate-300"
                onClick={handleCalculate}
                disabled={loading}
              >
                {loading ? "Calculating..." : "Run"}
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {activeSystem.parameters.map((param) => (
                <div key={param.name} className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {param.name.replace(/_/g, " ")}
                  </label>
                  {param.type === "NUMERIC" ? (
                    <div className="flex items-center gap-2">
                      <input
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        inputMode="decimal"
                        type="number"
                        value={inputs[param.name] ?? ""}
                        onChange={(event) => updateInput(param.name, event.target.value)}
                        placeholder="Enter value"
                      />
                      {param.unit ? (
                        <span className="text-[11px] font-semibold uppercase text-slate-500">
                          {param.unit}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      value={inputs[param.name] ?? ""}
                      onChange={(event) => updateInput(param.name, event.target.value)}
                    >
                      <option value="">Select an option</option>
                      {param.type === "BOOLEAN" ? (
                        <>
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </>
                      ) : (
                        param.options?.map((option) => (
                          <option key={String(option.value)} value={String(option.value)}>
                            {option.label}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                </div>
              ))}
            </div>
            {error ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
          </article>

          <div className="order-2 grid gap-4 md:grid-cols-3 xl:order-1">
            {summaryCards.map((card) => (
              <article key={card.label} className={`rounded-2xl border border-slate-200 bg-white p-4 ${cardShadow}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
                <p className={`mt-2 font-black text-slate-900 ${summaryValueClass(card.value)}`}>
                  {card.value}
                </p>
              </article>
            ))}
          </div>

          <article className={`order-3 rounded-2xl border border-slate-200 bg-white p-5 ${cardShadow} xl:order-2`}>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Clinical Recommendations</h3>
            <p className="mt-1 text-sm text-slate-600">
              Actionable steps based on current classification.
            </p>
            <div className="mt-4 space-y-3">
              {recommendations.map((item, index) => (
                <div key={`${item}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className={`order-4 rounded-2xl border border-slate-200 bg-white p-5 ${cardShadow} xl:order-3`}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">Related Indices Comparison</h3>
              <span className="text-xs font-semibold text-blue-600">View All Calculators</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {comparisonSystems.map((system) => (
                <button
                  key={system.id}
                  type="button"
                  onClick={() => setActiveSystemId(system.id)}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{system.name} Score</p>
                    <p className="text-xs text-slate-500">{system.description}</p>
                  </div>
                  <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-blue-700">Open</span>
                </button>
              ))}
            </div>
          </article>
        </div>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-600">
        Medical Disclaimer: This tool is intended for professional use and does not replace
        clinical judgment.
      </div>
    </div>
  );
};
