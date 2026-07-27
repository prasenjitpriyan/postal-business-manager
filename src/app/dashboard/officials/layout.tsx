import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Postal Officials Directory',
  description: 'Manage and view postal officials, designations, and status records in the Postal Business Manager.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfficialsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
