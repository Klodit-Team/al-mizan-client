import type {
  ContractantAlertItem,
  ContractantDeadlineItem,
} from "@/services/contractant-dashboard/api";

interface AlertsPanelProps {
  alertsTitle: string;
  alertsEmpty: string;
  deadlinesTitle: string;
  supportTitle: string;
  supportGuide: string;
  supportContact: string;
  alerts: ContractantAlertItem[];
  deadlines: ContractantDeadlineItem[];
}

export default function AlertsPanel({
  alertsTitle,
  alertsEmpty,
  deadlinesTitle,
  supportTitle,
  supportGuide,
  supportContact,
  alerts,
  deadlines,
}: AlertsPanelProps) {
  return (
    <div className="space-y-3">
      <section className="rounded-xl bg-[#364150] p-4 text-white shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-[#4CAF50]">
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
          </span>
          {alertsTitle}
        </h2>

        {alerts.length === 0 ? (
          <p className="mt-3 text-xs text-gray-200">{alertsEmpty}</p>
        ) : (
          <div className="mt-3 space-y-2">
            {alerts.map((alert) => (
              <article
                key={alert.id}
                className="rounded-lg border border-white/10 bg-white/10 p-3"
              >
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    alert.severity === "high"
                      ? "bg-rose-200 text-rose-800"
                      : "bg-amber-200 text-amber-800"
                  }`}
                >
                  {alert.severity === "high" ? "Urgent" : "A verifier"}
                </span>
                <p className="mt-1 text-sm font-semibold">{alert.title}</p>
                <p className="mt-1 text-xs text-gray-200">
                  {alert.description}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#364150]">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-700">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </span>
          {deadlinesTitle}
        </h2>
        <div className="mt-2 space-y-2">
          {deadlines.map((deadline) => (
            <article
              key={deadline.id}
              className="rounded-lg border border-gray-100 bg-gray-50 p-3"
            >
              <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                48H
              </span>
              <p className="text-sm font-semibold text-[#364150]">
                {deadline.title}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">{deadline.dueAt}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[#D4E8D8] bg-[#F5FBF6] p-4 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#364150]">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#DDF3E0] text-[#2E7D32]">
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
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z"
              />
            </svg>
          </span>
          {supportTitle}
        </h2>
        <ul className="mt-2 space-y-1 text-xs text-gray-600">
          <li>{supportGuide}</li>
          <li>{supportContact}</li>
        </ul>
      </section>
    </div>
  );
}
