import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from '@/providers/QueryProvider'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://postal-business-manager.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Postal Business Manager - Official Tracking & Contribution Analytics',
    template: '%s | Postal Business Manager',
  },
  description:
    'The advanced, all-in-one management system designed to track postal officials, oversee business contributions, and generate comprehensive reports seamlessly.',
  keywords: [
    'Postal Business',
    'Business Management',
    'Officials Tracker',
    'Contribution Manager',
    'Postal Portal',
    'Postal Analytics',
    'Postal Operations',
  ],
  authors: [{ name: 'Postal Business Manager Team' }],
  creator: 'Postal Business Manager',
  publisher: 'Postal Business Manager',
  category: 'Business & Finance Management',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'Postal Business Manager - Official Tracking & Contribution Analytics',
    description:
      'The advanced, all-in-one management system designed to track postal officials and oversee business contributions.',
    siteName: 'Postal Business Manager',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Postal Business Manager Dashboard Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Postal Business Manager - Official Tracking & Contribution Analytics',
    description:
      'The advanced, all-in-one management system designed to track postal officials and oversee business contributions.',
    images: ['/twitter-image.png'],
    creator: '@postalmanager',
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  applicationName: 'Postal Business Manager',
  appleWebApp: {
    capable: true,
    title: 'Postal Business Manager',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
  manifest: '/manifest.json',
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Postal Business Manager',
    operatingSystem: 'All',
    applicationCategory: 'BusinessApplication',
    description:
      'The advanced, all-in-one management system designed to track postal officials, oversee business contributions, and generate comprehensive reports seamlessly.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }

  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <QueryProvider>
          {children}
          <Toaster />
          <Analytics />
        </QueryProvider>
      </body>
    </html>
  )
}

