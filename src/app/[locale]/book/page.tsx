import { getTranslations, setRequestLocale } from 'next-intl/server';
import BookingPage from '@/frontend/pages/booking/BookingPage';
import { getBookingFormData } from '@/server/services/booking.service';
import { getCustomer } from '@/server/auth/customerSession';
import { SERVICE_KEYS } from '@/shared/constants/services';

// Each visit needs a fresh signed timestamp, so this page is never cached
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string | string[] }>;
};

export async function generateMetadata({ params }: Pick<Props, 'params'>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Booking' });
  return { title: t('metaTitle'), description: t('metaDescription') };
}

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { service } = await searchParams;
  const initialService =
    typeof service === 'string' && (SERVICE_KEYS as readonly string[]).includes(service) ? service : undefined;

  const [data, customer] = await Promise.all([getBookingFormData(), getCustomer()]);
  const prefill = customer
    ? { fullName: customer.fullName, phone: customer.phone, email: customer.email }
    : undefined;

  return <BookingPage locale={locale} initialService={initialService} prefill={prefill} {...data} />;
}