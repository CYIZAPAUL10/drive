import { STATUS_LABELS, type BookingStatusName } from '@/shared/constants/status';
import styles from './StatusChip.module.css';

export default function StatusChip({ status }: { status: BookingStatusName }) {
  return <span className={`${styles.chip} ${styles[status]}`}>{STATUS_LABELS[status]}</span>;
}