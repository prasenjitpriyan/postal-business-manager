import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'), // Replace with actual domain when deployed
  title: {
    default: "Postal Business Manager",
    template: "%s | Postal Business Manager",
  },
  description: "The advanced, all-in-one management system designed to track postal officials, oversee business contributions, and generate comprehensive reports seamlessly.",
  keywords: ["Postal Business", "Business Management", "Officials Tracker", "Contribution Manager", "Postal Portal"],
  authors: [{ name: "Postal Business Manager Team" }],
  creator: "Postal Business Manager",
  publisher: "Postal Business Manager",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Postal Business Manager",
    description: "The advanced, all-in-one management system designed to track postal officials and oversee business contributions.",
    siteName: "Postal Business Manager",
  },
  twitter: {
    card: "summary_large_image",
    title: "Postal Business Manager",
    description: "The advanced, all-in-one management system designed to track postal officials and oversee business contributions.",
    creator: "@postalmanager", // Placeholder
  },
  applicationName: "Postal Business Manager",
  appleWebApp: {
    capable: true,
    title: "Postal Business Manager",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
