"use client";

import { useState } from "react";
import { scoringSystems } from "@/lib/db/seed-data";
import type { ChildPughResult } from "@/lib/calculators";
import { childPughSchema } from "@/lib/validators/parameter-schemas";

const system = scoringSystems.find((item) => item.id === "child_pugh");

if (!system) {
  throw new Error("Child-Pugh system definition not found.");
}

type InputState = Record<string, string>;

const buildInitialState = (): InputState => {
  const initial: InputState = {};
  for (const param of system.parameters) {
    initial[param.name] = "";
  }
  return initial;
};

export const ChildPughCalculator = () => {
  const [inputs, setInputs] = useState<InputState>(buildInitialState);
  const [result, setResult] = useState<ChildPughResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const parameterList = system.parameters;

  const updateInput = (name: string, value: string) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = () => {
    const payload: Record<string, unknown> = {};

    for (const param of parameterList) {
      const rawValue = inputs[param.name];

      if (param.type === "NUMERIC") {
        const numericValue = Number(rawValue);
        if (!rawValue || Number.isNaN(numericValue)) {
          throw new Error(`Enter a valid value for ${param.name}.`);
        }
        payload[param.name] = numericValue;
        continue;
      }

      if (param.type === "CATEGORICAL") {
        if (!rawValue) {
          throw new Error(`Select an option for ${param.name}.`);
        }
        const option = param.options?.find((item) => String(item.value) === rawValue);
        if (!option) {
          throw new Error(`Invalid option for ${param.name}.`);
        }
        payload[param.name] = option.value;
        continue;
      }

      throw new Error(`Unsupported parameter type: ${param.type}`);
    }

    return childPughSchema.parse(payload);
  };

  const handleCalculate = async () => {
    setError(null);
    setResult(null);

    try {
      const payload = buildPayload();
      setLoading(true);
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemId: system.id, parameters: payload })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Calculation failed.");
      }

      setResult(data.result as ChildPughResult);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">{system.fullName}</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">{system.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Patient Parameters</h3>
          <div className="mt-6 space-y-5">
            {parameterList.map((param) => (
              <div key={param.name} className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {param.name.replace(/_/g, " ")}
                </label>

                {param.type === "NUMERIC" ? (
                  <div className="flex items-center gap-3">
                    <input
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      inputMode="decimal"
                      type="number"
                      value={inputs[param.name]}
                      onChange={(event) => updateInput(param.name, event.target.value)}
                      placeholder="Enter value"
                    />
                    {param.unit ? (
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {param.unit}
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    value={inputs[param.name]}
                    onChange={(event) => updateInput(param.name, event.target.value)}
                  >
                    <option value="">Select an option</option>
                    {param.options?.map((option) => (
                      <option key={String(option.value)} value={String(option.value)}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {param.normalRange ? (
                  <p className="text-xs text-slate-500">
                    Normal range: {param.normalRange.min} - {param.normalRange.max}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            onClick={handleCalculate}
            disabled={loading}
          >
            {loading ? "Calculating..." : "Calculate score"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h3 className="text-base font-semibold text-blue-900">Result</h3>
            {result ? (
              <div className="mt-4 space-y-3 text-sm text-blue-900">
                <div className="flex items-center justify-between">
                  <span>Total score</span>
                  <span className="text-lg font-semibold">{result.totalScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Class</span>
                  <span className="text-lg font-semibold">{result.class}</span>
                </div>
                <div>
                  <p className="font-medium">Interpretation</p>
                  <p className="text-sm text-blue-800">{result.interpretation}</p>
                </div>
                <div className="grid gap-2 text-xs text-blue-800">
                  <span>1-year survival: {result.oneYearSurvival}</span>
                  <span>2-year survival: {result.twoYearSurvival}</span>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-blue-800">
                Enter patient values to compute the score.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Clinical Disclaimer</p>
            <p className="mt-2">
              This calculator is a clinical decision support aid which is still very much under development and does not replace
              professional judgment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
