import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Contributions',
  description: 'Track, search, and manage postal business contributions and accounts opened by officials.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ContributionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
