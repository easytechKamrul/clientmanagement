import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EASY TECH LONDON LTD | Your One-Stop Service & Support",
  description: "Your trusted partner for IT, driver support, insurance, admissions, and travel solutions.",
  icons: {
    icon: "/Easy%20Tech%20solution%20logo.png",
    shortcut: "/Easy%20Tech%20solution%20logo.png",
    apple: "/Easy%20Tech%20solution%20logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Facebook Domain Verification Tag */}
        <meta name="facebook-domain-verification" content="zntplbbc60432ad01mr1o4v2gy1njv" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}