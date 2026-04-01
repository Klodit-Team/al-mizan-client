"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isRtl: boolean;
  dict: Record<string, string>;
}

export default function SidebarToggle({
  isCollapsed,
  onToggle,
  isRtl,
  dict,
}: SidebarToggleProps) {
  // Decide which icon points which way depending on RTL
  const CollapseIcon = isRtl ? ChevronRight : ChevronLeft;
  const ExpandIcon = isRtl ? ChevronLeft : ChevronRight;

  const Icon = isCollapsed ? ExpandIcon : CollapseIcon;
  const label = isCollapsed ? dict.expand : dict.collapse;

  return (
    <button
      onClick={onToggle}
      className={cn(
        "group flex w-full items-center rounded-lg p-2 text-sm font-medium text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1",
        isCollapsed ? "justify-center" : "justify-between",
      )}
      title={label}
      aria-label={label}
    >
      {!isCollapsed && <span className="truncate pl-1">{label}</span>}
      <Icon className="h-5 w-5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
