import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Log in to your Postal Business Manager account to manage postal officials, track business contributions, and view reports.',
  openGraph: {
    title: 'Sign In | Postal Business Manager',
    description: 'Log in to your Postal Business Manager account to manage postal officials, track business contributions, and view reports.',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
