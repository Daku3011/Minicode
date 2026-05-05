import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import InteractiveBackground from "@/components/InteractiveBackground";
import PageLoader from "@/components/PageLoader";
import DesktopEnforcer from "@/components/DesktopEnforcer";
import { AuthProvider } from "@/contexts/AuthContext";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: "MiniCode | Code. Compete. Evolve.",
  description: "A modern coding arena where students build real skills, compete with peers, and level up through real-world challenges.",
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
        <AuthProvider>
          <DesktopEnforcer>
            <Suspense fallback={null}>
              <PageLoader />
            </Suspense>
            <InteractiveBackground />
            <Navbar/>
            <main>
              <Suspense fallback={null}>
                {children}
              </Suspense>
            </main>
            <Analytics mode="production" />
            <SpeedInsights />
          </DesktopEnforcer>
        </AuthProvider>
      </body>
    </html>
  );
}
