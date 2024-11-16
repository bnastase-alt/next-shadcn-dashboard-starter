import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  console.log('🟡 [DashboardLayout] Checking session');
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();

  console.log('🟡 [DashboardLayout] Session check result:', !!session);

  if (!session) {
    console.log('🔴 [DashboardLayout] No session, redirecting');
    redirect('/');
  }

  console.log('🟢 [DashboardLayout] Session valid, rendering');
  return <>{children}</>;
}
