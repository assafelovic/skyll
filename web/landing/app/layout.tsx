import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

// JetBrains Mono font
const fontLink = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap";

export const metadata: Metadata = {
  title: "Skyll - Skill discovery for AI agents",
  description:
    "REST API and MCP server that lets any AI agent search for and retrieve agent skills at runtime. Aggregates skills from multiple sources with full SKILL.md content.",
  keywords: [
    "AI agents",
    "agent skills",
    "MCP",
    "Claude",
    "Cursor",
    "skills.sh",
    "SKILL.md",
  ],
  authors: [{ name: "Skyll", url: "https://skyll.app" }],
  openGraph: {
    title: "Skyll - Skill discovery for AI agents",
    description:
      "Let any AI agent search for and retrieve agent skills at runtime",
    url: "https://skyll.app",
    siteName: "Skyll",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skyll - Skill discovery for AI agents",
    description:
      "Let any AI agent search for and retrieve agent skills at runtime",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontLink} rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
