import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "TasteForge AI — Food that understands you", description: "A personal food intelligence assistant built around your Taste DNA.", icons: { icon: "/favicon.svg" } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
