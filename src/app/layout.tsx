import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-dm-serif-display",
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "CareLux",
    template: "%s | CareLux",
  },
  description:
    "Plataforma de gestão para lares, residências sénior e cuidados continuados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-PT"
      className={`${inter.variable} ${dmSerifDisplay.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
