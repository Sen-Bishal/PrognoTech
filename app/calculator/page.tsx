import { ChildPughCalculator } from "@/components/calculator/child-pugh-calculator";

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Hepatic
          </span>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            Medical Scoring Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Start with the Child-Pugh score. More calculators will be added as the
            database grows.
          </p>
        </div>
        <ChildPughCalculator />
      </div>
    </div>
  );
}
