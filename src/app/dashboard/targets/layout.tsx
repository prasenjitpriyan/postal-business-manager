import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Target & Achievement Hub',
  description: 'Manage and monitor postal business target quotas, real-time pacing, and goal fulfillment.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TargetsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
