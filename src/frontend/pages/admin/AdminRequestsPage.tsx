import Link from 'next/link';
import StatusChip from '@/frontend/components/admin/StatusChip';
import { controlClass } from '@/frontend/components/ui/Field';
import buttonStyles from '@/frontend/components/ui/Button.module.css';
import { BOOKING_STATUSES, STATUS_LABELS } from '@/shared/constants/status';
import { SERVICE_NAMES, nameOf } from '@/shared/constants/labels';
import { buildQuery, type ListFilters } from '@/shared/utils/requestFilters';
import { formatKigali } from '@/shared/utils/format';
import type { RequestRow } from '@/shared/types/requests';
import styles from './AdminRequestsPage.module.css';

type Props = {
  filters: ListFilters;
  items: RequestRow[];
  total: number;
  pageCount: number;
  notice?: 'deleted';
};

export default function AdminRequestsPage({ filters, items, total, pageCount, notice }: Props) {
  const filtered = Boolean(filters.q || filters.status || filters.from || filters.to || filters.spam);

  return (
    <>
      <h1 className={styles.title}>Requests</h1>

      <p role="status" className={styles.notice} hidden={!notice}>
        {notice === 'deleted' ? 'The request was deleted.' : ''}
      </p>

      <form method="get" action="/admin/requests" className={styles.filters}>
        <div className={styles.field}>
          <label htmlFor="q" className={styles.label}>Search by name, phone, email or reference</label>
          <input id="q" name="q" type="search" className={controlClass} defaultValue={filters.q} maxLength={100} />
        </div>
        <div className={styles.field}>
          <label htmlFor="status" className={styles.label}>Status</label>
          <select id="status" name="status" className={controlClass} defaultValue={filters.status}>
            <option value="">All statuses</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="from" className={styles.label}>Received from</label>
            <input id="from" name="from" type="date" className={controlClass} defaultValue={filters.from} />
          </div>
          <div className={styles.field}>
            <label htmlFor="to" className={styles.label}>Received until</label>
            <input id="to" name="to" type="date" className={controlClass} defaultValue={filters.to} />
          </div>
        </div>
        <label className={styles.check}>
          <input type="checkbox" name="spam" value="1" defaultChecked={filters.spam} />
          <span>Include spam</span>
        </label>
        <div className={styles.buttons}>
          <button type="submit" className={`${buttonStyles.btn} ${buttonStyles.primary}`}>Apply filters</button>
          {filtered && (
            <Link href="/admin/requests" className={`${buttonStyles.btn} ${buttonStyles.secondary}`}>Clear filters</Link>
          )}
        </div>
      </form>

      <p className={styles.count} aria-live="polite">
        {total === 0 ? 'No requests found.' : `${total} ${total === 1 ? 'request' : 'requests'}`}
      </p>

      {items.length > 0 && (
        <ul className={styles.list}>
          {items.map((r) => (
            <li key={r.id} className={`${styles.card} ${r.status === 'NEW' ? styles.isNew : ''}`}>
              <div className={styles.top}>
                <StatusChip status={r.status} />
                {r.isSpam && <span className={styles.spam}>Spam</span>}
                <span className={styles.ref}>{r.referenceCode}</span>
              </div>
              <h2 className={styles.name}>
                <Link href={`/admin/requests/${r.id}`} className={styles.link}>{r.guestName}</Link>
              </h2>
              <p className={styles.meta}>
                {nameOf(SERVICE_NAMES, r.serviceKey)} · {r.guestPhone}
              </p>
              <p className={styles.meta}>Received {formatKigali(r.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}

      {pageCount > 1 && (
        <nav aria-label="Pages" className={styles.pager}>
          {filters.page > 1 ? (
            <Link href={`/admin/requests${buildQuery(filters, filters.page - 1)}`} className={`${buttonStyles.btn} ${buttonStyles.secondary}`}>
              Previous
            </Link>
          ) : <span />}
          <span>Page {filters.page} of {pageCount}</span>
          {filters.page < pageCount ? (
            <Link href={`/admin/requests${buildQuery(filters, filters.page + 1)}`} className={`${buttonStyles.btn} ${buttonStyles.secondary}`}>
              Next
            </Link>
          ) : <span />}
        </nav>
      )}
    </>
  );
}