import Link from "next/link";

interface QuickActionsProps {
  locale: string;
  title: string;
  createAo: string;
  myAos: string;
  commissions: string;
}

export default function QuickActions({
  locale,
  title,
  createAo,
  myAos,
  commissions,
}: QuickActionsProps) {
  const actions = [
    {
      label: createAo,
      href: `/${locale}/dashboard/contractant/appels-offres/creation`,
      icon: "M12 6v12m6-6H6",
      iconClass: "bg-emerald-100 text-emerald-700",
      badgeClass: "bg-emerald-100 text-emerald-700",
    },
    {
      label: myAos,
      href: `/${locale}/dashboard/contractant/appels-offres`,
      icon: "M8 7h8M8 11h8M8 15h5M7 3h10a2 2 0 012 2v14l-3-2-3 2-3-2-3 2V5a2 2 0 012-2z",
      iconClass: "bg-sky-100 text-sky-700",
      badgeClass: "bg-sky-100 text-sky-700",
    },
    {
      label: commissions,
      href: `/${locale}/dashboard/contractant/tableau-de-bord?view=commissions`,
      icon: "M17 20h5V10h-5m-7 10h5V4h-5M3 20h5v-6H3v6z",
      iconClass: "bg-violet-100 text-violet-700",
      badgeClass: "bg-violet-100 text-violet-700",
    },
  ] as const;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-left text-sm font-semibold text-[#364150] transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:bg-white hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${action.iconClass}`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={action.icon}
                  />
                </svg>
              </span>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${action.badgeClass}`}
              >
                Action
              </span>
            </div>
            <p className="mt-2 flex items-center justify-between text-sm font-semibold text-[#364150]">
              {action.label}
              <span className="text-gray-400 transition-transform group-hover:translate-x-0.5">
                {">"}
              </span>
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
