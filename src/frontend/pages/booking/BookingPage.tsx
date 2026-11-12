import { useTranslations } from 'next-intl';
import BookingForm from '@/frontend/components/booking/BookingForm';
import { accent } from '@/frontend/components/ui/rich';
import styles from './BookingLayout.module.css';

type Props = {
  locale: string;
  token: string;
  maxPassengers: number;
  serviceKeys: string[];
  initialService?: string;
  prefill?: { fullName: string; phone: string; email: string };
};

export default function BookingPage(props: Props) {
  const t = useTranslations('Booking');
  return (
    <>
      <section className={`surface-dark ${styles.hero}`}>
        <div className={styles.inner}>
          <h1 className={styles.title}>{t.rich('title', { accent })}</h1>
          <p className={styles.intro}>{t('intro')}</p>
        </div>
      </section>
      <div className={styles.body}>
        <div className={styles.inner}>
          <BookingForm {...props} />
        </div>
      </div>
    </>
  );
}