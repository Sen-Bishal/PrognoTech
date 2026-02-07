import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-20">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
          PrognoTech
        </span>
        <h1 className="text-4xl font-semibold text-slate-900">
          Clinical Prognostic Scoring
        </h1>
        <p className="max-w-2xl text-base text-slate-600">
          A fast, bedside-friendly calculator for validated medical scoring systems.
          Start with Child-Pugh and expand to additional models as they are added.
        </p>
        <div>
          <Link
            href="/calculator"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Open Calculator
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-xs text-slate-600">
          <p className="font-semibold text-slate-800">Medical Disclaimer</p>
          <p className="mt-2">
            This tool is for clinical decision support only and is not a substitute for
            professional judgment or institutional protocols.
          </p>
        </div>
      </main>
    </div>
  );
}
