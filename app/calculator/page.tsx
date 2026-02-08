import { ChildPughCalculator } from "@/components/calculator/child-pugh-calculator";

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-[#edf1f7]">
      <header className="border-b border-slate-200 bg-white/95">
        <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              +
            </span>
            <span className="text-lg font-bold text-slate-900">PrognoTech</span>
          </div>

          <div className="hidden min-w-[260px] max-w-md flex-1 md:block">
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Patient ID feature coming soon..."
              readOnly
            />
          </div>

          <nav className="ml-auto hidden items-center gap-6 text-sm font-semibold text-slate-500 lg:flex">
            <span>Dashboard</span>
            <span className="border-b-2 border-blue-600 pb-1 text-slate-900">Patients</span>
            <span>Calculators</span>
            <span>Settings</span>
          </nav>

          <span className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 lg:ml-0">
            DR
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6">
        <ChildPughCalculator />
      </main>
    </div>
  );
}
