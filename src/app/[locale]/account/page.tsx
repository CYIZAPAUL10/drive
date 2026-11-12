import { redirect } from 'next/navigation';
import { getCustomer } from '@/server/auth/customerSession';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/account/${(await getCustomer()) ? 'requests' : 'login'}`);
}