import Link from 'next/link';
import { controlClass } from '@/frontend/components/ui/Field';
import buttonStyles from '@/frontend/components/ui/Button.module.css';
import { buildCustomerQuery, type CustomerFilters } from '@/shared/utils/customerFilters';
import { formatKigali } from '@/shared/utils/format';
import type { CustomerRow } from '@/shared/types/customers';
import listStyles from './AdminRequestsPage.module.css';
import styles from './AdminCustomersPage.module.css';

type Props = {
  filters: CustomerFilters;
  items: CustomerRow[];
  total: number;
  pageCount: number;
  notice?: 'deleted';
};

export default function AdminCustomersPage({ filters, items, total, pageCount, notice }: Props) {
  const filtered = Boolean(filters.q || filters.status);

  return (
    <>
      <h1 className={listStyles.title}>Customers</h1>

      <p role="status" className={listStyles.notice} hidden={!notice}>
        {notice === 'deleted' ? 'The customer was deleted.' : ''}
      </p>

      <form method="get" action="/admin/customers" className={listStyles.filters}>
        <div className={listStyles.field}>
          <label htmlFor="q" className={listStyles.label}>Search by name, email or phone</label>
          <input id="q" name="q" type="search" className={controlClass} defaultValue={filters.q} maxLength={100} />
        </div>
        <div className={listStyles.field}>
          <label htmlFor="status" className={listStyles.label}>Email</label>
          <select id="status" name="status" className={controlClass} defaultValue={filters.status}>
            <option value="">All customers</option>
            <option value="confirmed">Confirmed</option>
            <option value="unconfirmed">Not confirmed yet</option>
          </select>
        </div>
        <div className={listStyles.buttons}>
          <button type="submit" className={`${buttonStyles.btn} ${buttonStyles.primary}`}>Apply filters</button>
          {filtered && (
            <Link href="/admin/customers" className={`${buttonStyles.btn} ${buttonStyles.secondary}`}>Clear filters</Link>
          )}
        </div>
      </form>

      <p className={listStyles.count} aria-live="polite">
        {total === 0 ? 'No customers found.' : `${total} ${total === 1 ? 'customer' : 'customers'}`}
      </p>

      {items.length > 0 && (
        <ul className={listStyles.list}>
          {items.map((c) => (
            <li key={c.id} className={listStyles.card}>
              <div className={listStyles.top}>
                <span className={c.emailVerified ? styles.ok : styles.pending}>
                  {c.emailVerified ? 'Email confirmed' : 'Email not confirmed'}
                </span>
                {c.hasGoogle && <span className={styles.badge}>Google</span>}
                {c.hasPassword && <span className={styles.badge}>Password</span>}
                <span className={listStyles.ref}>
                  {c.requestCount} {c.requestCount === 1 ? 'request' : 'requests'}
                </span>
              </div>
              <h2 className={listStyles.name}>
                <Link href={`/admin/customers/${c.id}`} className={listStyles.link}>{c.fullName}</Link>
              </h2>
              <p className={listStyles.route}>{c.email}</p>
              <p className={listStyles.meta}>{c.phone || 'No phone number'}</p>
              <p className={listStyles.meta}>Joined {formatKigali(c.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}

      {pageCount > 1 && (
        <nav aria-label="Pages" className={listStyles.pager}>
          {filters.page > 1 ? (
            <Link href={`/admin/customers${buildCustomerQuery(filters, filters.page - 1)}`} className={`${buttonStyles.btn} ${buttonStyles.secondary}`}>
              Previous
            </Link>
          ) : <span />}
          <span>Page {filters.page} of {pageCount}</span>
          {filters.page < pageCount ? (
            <Link href={`/admin/customers${buildCustomerQuery(filters, filters.page + 1)}`} className={`${buttonStyles.btn} ${buttonStyles.secondary}`}>
              Next
            </Link>
          ) : <span />}
        </nav>
      )}
    </>
  );
}