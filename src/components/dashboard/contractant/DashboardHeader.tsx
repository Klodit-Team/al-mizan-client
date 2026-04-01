import Link from "next/link";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  createButton: string;
  locale: string;
}

export default function DashboardHeader({
  title,
  subtitle,
  createButton,
  locale,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-lg font-bold uppercase tracking-[0.03em] text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-xs text-slate-600">{subtitle}</p>
      </div>

      <Link
        href={`/${locale}/dashboard/contractant/appels-offres/creation`}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#4CAF50" }}
      >
        <span className="text-base leading-none">+</span>
        {createButton}
      </Link>
    </header>
  );
}
