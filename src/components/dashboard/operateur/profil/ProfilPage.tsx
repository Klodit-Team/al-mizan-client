"use client";

import { useState } from "react";
import { User, Shield } from "lucide-react";
import MyProfilePage from "./MyProfilePage";
import SecuritySettingsPage from "./SecuritySettingsPage";

type Tab = "profil" | "securite";

function getTabs(dict: any) {
  return [
    { key: "profil",    label: dict.tabs.profil,  icon: <User className="h-4 w-4" /> },
    { key: "securite",  label: dict.tabs.securite,    icon: <Shield className="h-4 w-4" /> },
  ] as const;
}

export default function ProfilPage({ dict, locale }: { dict: any; locale: string }) {
  const [tab, setTab] = useState<Tab>("profil");

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {getTabs(dict).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${
              tab === t.key
                ? "bg-[#4CAF50] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "profil"   && <MyProfilePage dict={dict} />}
      {tab === "securite" && <SecuritySettingsPage dict={dict} locale={locale} />}
    </div>
  );
}