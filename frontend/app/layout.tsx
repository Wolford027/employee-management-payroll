import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EMS Payroll",
  description: "Employee Management with Payroll System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col">
        {/* Background decoration */}
        <div className="bg-orb bg-orb-blue" aria-hidden />
        <div className="bg-orb bg-orb-yellow" aria-hidden />

        <div className="relative z-10 flex flex-col flex-1">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
