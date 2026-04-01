"use client";
import React, { useState } from "react";
import Sidebar from "@/components/dashboard/contractant/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  navbar: React.ReactNode;
  locale: "fr" | "ar" | string;
  sidebarDict: Record<string, string>;
}

export default function DashboardLayout({
  children,
  navbar,
  locale,
  sidebarDict,
}: DashboardLayoutProps) {
  const isRtl = locale === "ar";
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className="flex h-screen w-full flex-col bg-[#F3F4F6] overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header - Top Full Width */}
      <header className="z-50 w-full shrink-0 bg-white shadow-sm border-b border-gray-200">
        {navbar}
      </header>

      {/* Layout Body - Remaining Height */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          locale={locale}
          dict={sidebarDict}
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
