"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  FileText,
  Settings,
  FolderClosed,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SidebarItem from "./SidebarItem";
import SidebarToggle from "./SidebarToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  locale: string;
  dict: Record<string, string>;
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  locale,
  dict,
  isCollapsed,
  onToggle,
}: SidebarProps) {
  const isRtl = locale === "ar";
  const pathname = usePathname();

  const navItems: { icon: LucideIcon; label: string; href: string }[] = [
    {
      icon: LayoutDashboard,
      label: dict.dashboard || "Tableau de bord",
      href: `/${locale}/service-contractant/dashboard`,
    },
    {
      icon: FileText,
      label: dict.tenders || "Appels d'offres",
      href: `/${locale}/service-contractant/tenders`, // example path
    },
    {
      icon: FolderClosed,
      label: dict.documents || "Documents",
      href: `/${locale}/service-contractant/documents`,
    },
    {
      icon: Settings,
      label: dict.settings || "Paramètres",
      href: `/${locale}/service-contractant/settings`,
    },
  ];

  const renderContent = () => (
    <div className="flex h-full w-full flex-col bg-slate-50/50 backdrop-blur-xl">
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6">
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={isActive}
                isCollapsed={isCollapsed}
                isRtl={isRtl}
              />
            );
          })}
        </nav>
      </div>

      <div className="shrink-0 p-4 border-t border-slate-200/50">
        <SidebarToggle
          isCollapsed={isCollapsed}
          onToggle={onToggle}
          isRtl={isRtl}
          dict={dict}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        data-collapsed={isCollapsed}
        className={cn(
          "z-40 hidden h-full transition-all duration-300 ease-in-out lg:flex flex-col border-slate-200/50 bg-white shadow-sm shrink-0",
          isRtl ? "border-l" : "border-r",
          isCollapsed ? "w-20" : "w-70",
        )}
      >
        {renderContent()}
      </aside>

      {/* Mobile Drawer */}
      <div
        className="lg:hidden fixed bottom-6 z-50"
        style={{ [isRtl ? "right" : "left"]: "1.5rem" }}
      >
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full shrink-0 bg-white shadow-lg md:hidden border-slate-200"
            >
              <Menu className="h-6 w-6 text-slate-700" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side={isRtl ? "right" : "left"}
            className="w-70 p-0 border-none"
          >
            <div
              className="h-full bg-white shadow-xl"
              dir={isRtl ? "rtl" : "ltr"}
            >
              {/* Force not collapsed internally for mobile drawer */}
              <SidebarContentMobile
                isRtl={isRtl}
                navItems={navItems}
                pathname={pathname}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

// Temporary internal component strictly for mobile expanded drawer to avoid messy props drilling
function SidebarContentMobile({
  isRtl,
  navItems,
  pathname,
}: {
  isRtl: boolean;
  navItems: { icon: LucideIcon; label: string; href: string }[];
  pathname: string;
}) {
  return (
    <div className="flex h-full w-full flex-col bg-slate-50/50 backdrop-blur-xl">
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-8">
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={isActive}
                isCollapsed={false}
                isRtl={isRtl}
              />
            );
          })}
        </nav>
      </div>
    </div>
  );
}
