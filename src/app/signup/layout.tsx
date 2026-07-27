import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Sign up for a Postal Business Manager account to streamline your postal operations and contribution tracking.',
  openGraph: {
    title: 'Create Account | Postal Business Manager',
    description: 'Sign up for a Postal Business Manager account to streamline your postal operations and contribution tracking.',
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
