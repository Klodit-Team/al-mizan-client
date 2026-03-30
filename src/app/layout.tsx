import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Al-Mizan",
    description: "Plateforme nationale souveraine",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return children;
}