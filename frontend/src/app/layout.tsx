import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import InteractiveBackground from "@/components/InteractiveBackground";
import PageLoader from "@/components/PageLoader";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import WelcomeModal from '@/components/WelcomeModal';
import ChatAssistant from '@/components/ChatAssistant';

export const metadata: Metadata = {
  title: "MiniCode | Code. Compete. Evolve.",
  description: "A modern coding arena where students build real skills, compete with peers, and level up through real-world challenges.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
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
        <ThemeProvider>
          <AuthProvider>
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
            <WelcomeModal />
            <ChatAssistant />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
