import { useLocale, useTranslations } from 'next-intl';
import AccountNav from '@/frontend/components/account/AccountNav';
import RequestStatus from '@/frontend/components/account/RequestStatus';
import Button from '@/frontend/components/ui/Button';
import { accent } from '@/frontend/components/ui/rich';
import { CalendarIcon } from '@/frontend/components/ui/Icons';
import { formatKigaliFor } from '@/shared/utils/formatLocale';
import type { CustomerRequestRow } from '@/shared/types/account';
import AccountFormPage from './AccountFormPage';
import styles from './RequestsPage.module.css';

export default function RequestsPage({ rows }: { rows: CustomerRequestRow[] }) {
  const t = useTranslations('Account');
  const services = useTranslations('Services');
  const locale = useLocale();

  const serviceName = (key: string) => (services.has(`items.${key}.name`) ? services(`items.${key}.name`) : key);

  return (
    <AccountFormPage title={t.rich('requests.title', { accent })} intro={t('requests.intro')}>
      <AccountNav locale={locale} />

      {rows.length === 0 ? (
        <div className={styles.empty}>
          <p>{t('requests.empty')}</p>
          <Button href="/book" icon={<CalendarIcon />}>{t('requests.newRequest')}</Button>
        </div>
      ) : (
        <>
          <ul className={styles.list}>
            {rows.map((r) => (
              <li key={r.id} className={styles.card}>
                <div className={styles.top}>
                  <RequestStatus status={r.status} />
                  <span className={styles.ref}>{t('requests.reference')}: {r.referenceCode}</span>
                </div>
     <h2 className={styles.route}>{serviceName(r.serviceKey)}</h2>
                <p className={styles.meta}>{t('requests.received')}: {formatKigaliFor(r.createdAt, locale)}</p>
              </li>
            ))}
          </ul>
          <p className={styles.note}>{t('requests.note')}</p>
          <Button href="/book" icon={<CalendarIcon />}>{t('requests.newRequest')}</Button>
        </>
      )}
    </AccountFormPage>
  );
}