import Link from 'next/link';
import StatusChip from '@/frontend/components/admin/StatusChip';
import CustomerEditForm from '@/frontend/components/admin/CustomerEditForm';
import CustomerDeleteForm from '@/frontend/components/admin/CustomerDeleteForm';
import { LANGUAGE_NAMES, nameOf } from '@/shared/constants/labels';
import { formatKigali } from '@/shared/utils/format';
import type { CustomerDetail } from '@/shared/types/customers';
import detail from './AdminRequestDetailPage.module.css';
import styles from './AdminCustomersPage.module.css';

type Props = { customer: CustomerDetail & { totalRequests: number } };

export default function AdminCustomerDetailPage({ customer: c }: Props) {
  const rows: Array<[string, string]> = [
    ['Email', c.email],
    ['Phone', c.phone || 'No phone number'],
    ['Language', nameOf(LANGUAGE_NAMES, c.preferredLanguage)],
    ['Signs in with', [c.hasPassword ? 'Password' : '', c.hasGoogle ? 'Google' : ''].filter(Boolean).join(' and ') || 'Nothing yet'],
    ['Joined', formatKigali(c.createdAt)],
  ];

  return (
    <>
      <p className={detail.back}>
        <Link href="/admin/customers"><span aria-hidden="true">← </span>All customers</Link>
      </p>

      <header className={detail.head}>
        <div className={detail.badges}>
          <span className={c.emailVerified ? styles.ok : styles.pending}>
            {c.emailVerified ? 'Email confirmed' : 'Email not confirmed'}
          </span>
        </div>
        <h1 className={detail.title}>{c.fullName}</h1>
        <p className={detail.sub}>{c.totalRequests} {c.totalRequests === 1 ? 'request' : 'requests'}</p>
      </header>

      <section aria-labelledby="info-title" className={detail.section}>
        <h2 id="info-title" className={detail.h2}>Details</h2>
        <dl className={detail.details}>
          {rows.map(([name, value]) => (
            <div key={name} className={detail.item}>
              <dt>{name}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.more}>
          The email address cannot be changed here. It is the customer&rsquo;s login and links their earlier requests.
        </p>
      </section>

      <section aria-labelledby="edit-title" className={detail.section}>
        <h2 id="edit-title" className={detail.h2}>Edit details</h2>
        <CustomerEditForm id={c.id} fullName={c.fullName} phone={c.phone} language={c.preferredLanguage} />
      </section>

      <section aria-labelledby="requests-title" className={detail.section}>
        <h2 id="requests-title" className={detail.h2}>Requests</h2>
        {c.requests.length === 0 ? (
          <p>This customer has no requests.</p>
        ) : (
          <>
            <ul className={styles.requests}>
              {c.requests.map((r) => (
                <li key={r.id}>
                  <div><StatusChip status={r.status} /></div>
                  <Link href={`/admin/requests/${r.id}`}><strong>{r.referenceCode}</strong></Link>
                  <span>Received {formatKigali(r.createdAt)}</span>
                </li>
              ))}
            </ul>
            {c.totalRequests > c.requests.length && (
              <p className={styles.more}>Showing the latest {c.requests.length} of {c.totalRequests}.</p>
            )}
          </>
        )}
      </section>

      <section aria-labelledby="delete-title" className={detail.section}>
        <h2 id="delete-title" className={detail.h2}>Delete this customer</h2>
        <CustomerDeleteForm id={c.id} requestCount={c.totalRequests} />
      </section>
    </>
  );
}