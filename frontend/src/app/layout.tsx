import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeArena AI — Developer Growth Operating System",
  description: "Beyond coding practice. Build interview readiness. An AI-powered platform that tracks coding, detects weaknesses, creates personalized learning, and conducts mock interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full dark select-none">
        <body className={`${geistSans.variable} ${geistMono.variable} h-full bg-slate-950 text-slate-100 antialiased overflow-x-hidden`}>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
