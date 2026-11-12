import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import ReceivedPage from '@/frontend/pages/booking/ReceivedPage';
import { bookingExists } from '@/server/services/booking.service';
import { getSiteProfile } from '@/server/services/profile.service';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string; ref: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Received' });
  return { title: t('metaTitle'), robots: { index: false, follow: false } };
}

export default async function Page({ params }: Props) {
  const { locale, ref } = await params;
  setRequestLocale(locale);

  const code = ref.toUpperCase();
  if (!/^ELV-[A-Z2-9]{6}$/.test(code) || !(await bookingExists(code))) notFound();

  const profile = await getSiteProfile(locale);

  // Shows only the reference code and generic text, never trip or contact details
  return <ReceivedPage referenceCode={code} profile={profile} />;
}