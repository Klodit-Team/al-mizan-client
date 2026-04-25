import type { ContractantActivityItem } from "@/services/contractant-dashboard/api";

interface RecentActivityListProps {
  title: string;
  viewAll: string;
  empty: string;
  items: ContractantActivityItem[];
}

function getActivityColor(type: ContractantActivityItem["type"]) {
  if (type === "SOUMISSION") return "bg-green-100 text-green-600";
  if (type === "RECOURS") return "bg-red-100 text-red-600";
  return "bg-blue-100 text-blue-600";
}

function getActivityIcon(type: ContractantActivityItem["type"]) {
  if (type === "SOUMISSION") {
    return "M8 12h8m-8 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z";
  }

  if (type === "RECOURS") {
    return "M12 8v4m0 4h.01M4.9 19h14.2c1.5 0 2.4-1.6 1.7-2.8L13.7 4.2c-.8-1.3-2.6-1.3-3.4 0L3.2 16.2C2.5 17.4 3.4 19 4.9 19z";
  }

  return "M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z";
}

export default function RecentActivityList({
  title,
  viewAll,
  empty,
  items,
}: RecentActivityListProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <button
          type="button"
          className="text-[11px] font-semibold uppercase tracking-wide text-[#4CAF50]"
        >
          {viewAll}
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {items.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">{empty}</p>
        ) : (
          items.slice(0, 5).map((item) => (
            <article
              key={item.id}
              className="flex items-start justify-between gap-3 px-4 py-3"
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg ${getActivityColor(item.type)}`}
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
                      d={getActivityIcon(item.type)}
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#364150]">
                    {item.title}
                  </p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${getActivityColor(item.type)}`}
                  >
                    {item.type}
                  </span>
                  <p className="text-xs text-gray-500">{item.subtitle}</p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-gray-400">
                {item.timestamp}
              </span>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
