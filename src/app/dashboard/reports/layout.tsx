import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reports & Analytics',
  description: 'View comprehensive business reports, leaderboard performance, and analytics for postal operations.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
