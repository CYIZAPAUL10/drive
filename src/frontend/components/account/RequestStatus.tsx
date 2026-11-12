import { useTranslations } from 'next-intl';
import type { BookingStatusName } from '@/shared/constants/status';
import styles from './RequestStatus.module.css';

export default function RequestStatus({ status }: { status: BookingStatusName }) {
  const t = useTranslations('Account.requests.statuses');
  return <span className={`${styles.chip} ${styles[status]}`}>{t(status)}</span>;
}