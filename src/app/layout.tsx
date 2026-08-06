import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from '@/providers/QueryProvider'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { ScrollProgress } from '@/components/ui/ScrollProgress'
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
    default: 'Postal Business Manager - India Post Official Tracking & PLI / RPLI Analytics',
    template: '%s | Postal Business Manager',
  },
  description:
    'The premier all-in-one postal business management platform. Track postal officials, monitor PLI and RPLI policy contributions, analyze office of indexing metrics, and generate real-time analytical reports.',
  keywords: [
    'India Post Business',
    'Postal Life Insurance',
    'PLI Management',
    'RPLI Management',
    'Rural Postal Life Insurance',
    'Postal Business Manager',
    'Postal Officials Tracker',
    'Office of Indexing Analytics',
    'Postal Accounts Tracker',
    'Postal Operations Portal',
    'Postal Contribution Analytics',
    'Government Postal Manager',
    'Sum Assured Tracker',
    'Initial Premium Analytics',
  ],
  authors: [{ name: 'Postal Business Manager Team' }],
  creator: 'Postal Business Manager',
  publisher: 'Postal Business Manager',
  category: 'Business & Finance Management',
  referrer: 'origin-when-cross-origin',
  alternates: {
    canonical: siteUrl,
    languages: {
      'en-IN': siteUrl,
      'en-US': siteUrl,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    alternateLocale: ['en_US'],
    url: siteUrl,
    title: 'Postal Business Manager - India Post Official Tracking & PLI / RPLI Analytics',
    description:
      'Empowering postal operations with advanced analytics. Oversee postal officials, track PLI & RPLI policy growth, and analyze indexing performance.',
    siteName: 'Postal Business Manager',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'Postal Business Manager Dashboard & PLI / RPLI Analytics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Postal Business Manager - India Post Official Tracking & PLI / RPLI Analytics',
    description:
      'Empowering postal operations with advanced analytics. Oversee postal officials, track PLI & RPLI policy growth, and analyze indexing performance.',
    images: ['/twitter-image.png'],
    creator: '@postalmanager',
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
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
  const jsonLdSoftware = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Postal Business Manager',
    operatingSystem: 'All',
    applicationCategory: 'BusinessApplication',
    url: siteUrl,
    description:
      'The premier all-in-one postal business management platform. Track postal officials, monitor PLI and RPLI policy contributions, analyze office of indexing metrics, and generate real-time analytical reports.',
    featureList: [
      'PLI & RPLI Policy Tracking & Premium Calculations',
      'Postal Officials Directory & Management',
      'Account Contribution Analytics & Metrics',
      'Office of Indexing Performance Ranking',
      'Custom CSV Exporting & Detailed Reporting',
      'Role-based User Access Control (Admin & Viewer)',
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
  };

  const jsonLdOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Postal Business Manager',
    url: siteUrl,
    logo: `${siteUrl}/icon.png`,
    description: 'Official tracking & business contribution analytics system for postal operations.',
  };

  const jsonLdWebSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Postal Business Manager',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/dashboard/officials?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          key="ld-json-software"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }}
        />
        <script
          key="ld-json-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          key="ld-json-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ScrollProgress />
        <CustomCursor />
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}

