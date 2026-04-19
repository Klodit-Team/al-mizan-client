import type { ContractantDashboardStats } from "@/services/contractant-dashboard/api";

interface SummaryCardsProps {
  stats: ContractantDashboardStats;
  labels: {
    activeAos: string;
    pendingAttributions: string;
    openRecours: string;
    ongoingMarches: string;
  };
}

export default function SummaryCards({ stats, labels }: SummaryCardsProps) {
  const cards = [
    {
      key: "activeAos",
      label: labels.activeAos,
      value: stats.activeAos,
      badge: "LIVE",
      cardClass: "from-emerald-50 to-white",
      iconWrapClass: "bg-emerald-100 text-emerald-700",
      badgeClass: "bg-emerald-100 text-emerald-700",
      icon: (
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
            d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
          />
        </svg>
      ),
    },
    {
      key: "pendingAttributions",
      label: labels.pendingAttributions,
      value: stats.pendingAttributions,
      badge: "PENDING",
      cardClass: "from-amber-50 to-white",
      iconWrapClass: "bg-amber-100 text-amber-700",
      badgeClass: "bg-amber-100 text-amber-700",
      icon: (
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
            d="M8 7h8M8 11h8M8 15h5M7 3h10a2 2 0 012 2v14l-3-2-3 2-3-2-3 2V5a2 2 0 012-2z"
          />
        </svg>
      ),
    },
    {
      key: "openRecours",
      label: labels.openRecours,
      value: stats.openRecours,
      badge: "ALERT",
      cardClass: "from-rose-50 to-white",
      iconWrapClass: "bg-rose-100 text-rose-700",
      badgeClass: "bg-rose-100 text-rose-700",
      icon: (
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
            d="M12 8v4m0 4h.01M4.9 19h14.2c1.5 0 2.4-1.6 1.7-2.8L13.7 4.2c-.8-1.3-2.6-1.3-3.4 0L3.2 16.2C2.5 17.4 3.4 19 4.9 19z"
          />
        </svg>
      ),
    },
    {
      key: "ongoingMarches",
      label: labels.ongoingMarches,
      value: stats.ongoingMarches,
      badge: "ACTIVE",
      cardClass: "from-sky-50 to-white",
      iconWrapClass: "bg-sky-100 text-sky-700",
      badgeClass: "bg-sky-100 text-sky-700",
      icon: (
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
            d="M20 7l-8-4-8 4 8 4 8-4zm0 0v10l-8 4-8-4V7"
          />
        </svg>
      ),
    },
  ] as const;

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.key}
          className={`rounded-xl border border-gray-200 bg-linear-to-br p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.cardClass}`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${card.iconWrapClass}`}
            >
              {card.icon}
            </span>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${card.badgeClass}`}
            >
              {card.badge}
            </span>
          </div>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {card.label}
          </p>
          <p className="mt-1 text-3xl font-bold leading-none text-[#364150]">
            {String(card.value).padStart(2, "0")}
          </p>
        </article>
      ))}
    </section>
  );
}
