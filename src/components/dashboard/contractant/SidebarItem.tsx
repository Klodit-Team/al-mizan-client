"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
  isRtl: boolean;
}

export default function SidebarItem({
  icon: Icon,
  label,
  href,
  isActive,
  isCollapsed,
  isRtl,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-[#4CAF50]/10 text-[#4CAF50]"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        isCollapsed ? "justify-center" : "justify-start",
      )}
      title={isCollapsed ? label : undefined}
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <div
          className={cn(
            "absolute inset-y-1 w-1 rounded-full bg-[#4CAF50] transition-all",
            isRtl ? "-right-4" : "-left-4",
          )}
        />
      )}

      {/* Icon */}
      <Icon
        className={cn(
          "shrink-0 transition-colors h-5 w-5",
          isActive
            ? "text-[#4CAF50]"
            : "text-slate-500 group-hover:text-slate-700",
        )}
        strokeWidth={isActive ? 2.5 : 2}
      />

      {/* Label */}
      {!isCollapsed && <span className="truncate leading-tight">{label}</span>}

      {/* Modern hover effect block for collapsed mode without full tooltip component if simpler */}
      {isCollapsed && (
        <div
          className={cn(
            "absolute hidden group-hover:flex items-center rounded-md bg-slate-800 px-2 py-1 text-xs text-white z-50 whitespace-nowrap shadow-md",
            isRtl ? "right-14" : "left-14",
          )}
        >
          {label}
        </div>
      )}
    </Link>
  );
}
