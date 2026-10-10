import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { SerwistProvider } from "@serwist/turbopack/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SafeCamp",
  description:
    "Offline campsite safety inspector. Snap a photo, get hazard advice. No signal needed.",
  applicationName: "SafeCamp",
  appleWebApp: { capable: true, title: "SafeCamp", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#1b382b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-sand text-forest font-sans">
        <SerwistProvider
          swUrl="/serwist/sw.js"
          disable={process.env.NODE_ENV === "development"}
        >
          <main className="flex-1">{children}</main>
        </SerwistProvider>
      </body>
    </html>
  );
}
