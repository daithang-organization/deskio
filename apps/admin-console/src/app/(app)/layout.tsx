import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();

  // Placeholder behavior: redirect to login until auth is implemented
  if (!session) redirect('/login');

  return <>{children}</>;
}
