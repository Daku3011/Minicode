import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | MiniCode Help Center",
  description: "Find answers to all your MiniCode questions. Learn how to get started, solve problems, and more.",
};

export default function FAQLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}