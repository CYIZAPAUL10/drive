import { setRequestLocale } from 'next-intl/server';
import HomePage from '@/frontend/pages/public/HomePage';
import { getSiteProfile } from '@/server/services/profile.service';

export const revalidate = 300;

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const profile = await getSiteProfile(locale);
  return <HomePage profile={profile} />;
}