import Link from 'next/link';
import Button from '@/frontend/components/ui/Button';
import { PhoneIcon, WhatsAppIcon } from '@/frontend/components/ui/Icons';
import StatusChip from '@/frontend/components/admin/StatusChip';
import StatusForm from '@/frontend/components/admin/StatusForm';
import NotesForm from '@/frontend/components/admin/NotesForm';
import SpamForm from '@/frontend/components/admin/SpamForm';
import DeleteForm from '@/frontend/components/admin/DeleteForm';
import {
  SERVICE_NAMES, TRIP_NAMES, CONTACT_NAMES, LANGUAGE_NAMES, EMAIL_TYPE_NAMES, EMAIL_STATUS_NAMES, nameOf,
} from '@/shared/constants/labels';
import { formatKigali, safeMailto, whatsappLink } from '@/shared/utils/format';
import type { RequestDetail } from '@/shared/types/requests';
import styles from './AdminRequestDetailPage.module.css';

export default function AdminRequestDetailPage({ request: r }: { request: RequestDetail }) {
  const mailto = r.guestEmail ? safeMailto(r.guestEmail) : null;
  const trip = nameOf(TRIP_NAMES, r.tripType) + (r.numberOfDays ? ` (${r.numberOfDays} days)` : '');

  const details: Array<[string, string]> = [
    ['Service', nameOf(SERVICE_NAMES, r.serviceKey)],
    ['Trip', trip],
    ['Phone', r.guestPhone],
    ['Email', r.guestEmail ?? 'Not given'],
    ['Prefers', nameOf(CONTACT_NAMES, r.preferredContact)],
    ['Language', nameOf(LANGUAGE_NAMES, r.language)],
  ];

  return (
    <>
      <p className={styles.back}>
        <Link href="/admin/requests"><span aria-hidden="true">← </span>All requests</Link>
      </p>

      <header className={styles.head}>
        <div className={styles.badges}>
          <StatusChip status={r.status} />
          {r.isSpam && <span className={styles.spam}>Spam</span>}
        </div>
        <h1 className={styles.title}>{r.guestName}</h1>
        <p className={styles.sub}>{r.referenceCode} · Received {formatKigali(r.createdAt)}</p>
      </header>

      <section aria-labelledby="contact-title" className={styles.contact}>
        <h2 id="contact-title" className="sr-only">Contact the customer</h2>
        <Button href={`tel:${r.guestPhone}`} external icon={<PhoneIcon />}>Call {r.guestPhone}</Button>
        <Button href={whatsappLink(r.guestPhone)} external newTab variant="secondary" icon={<WhatsAppIcon />}>WhatsApp</Button>
        {mailto && <Button href={mailto} external variant="secondary">Email</Button>}
      </section>

      <section aria-labelledby="details-title" className={styles.section}>
        <h2 id="details-title" className={styles.h2}>Request details</h2>
        <dl className={styles.details}>
          {details.map(([name, value]) => (
            <div key={name} className={styles.item}>
              <dt>{name}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className={styles.forms}>
        <section aria-labelledby="status-title" className={styles.section}>
          <h2 id="status-title" className={styles.h2}>Status</h2>
          <StatusForm id={r.id} status={r.status} />
        </section>
        <section aria-labelledby="notes-title" className={styles.section}>
          <h2 id="notes-title" className={styles.h2}>Notes</h2>
          <NotesForm id={r.id} notes={r.driverPrivateNotes ?? ''} />
        </section>
      </div>

      <section aria-labelledby="emails-title" className={styles.section}>
        <h2 id="emails-title" className={styles.h2}>Emails about this request</h2>
        {r.emails.length === 0 ? (
          <p>No emails were queued.</p>
        ) : (
          <ul className={styles.emails}>
            {r.emails.map((e) => (
              <li key={e.id}>
                <strong>{nameOf(EMAIL_TYPE_NAMES, e.type)}:</strong> {nameOf(EMAIL_STATUS_NAMES, e.status)}
                {e.status === 'sent' && e.sentAt ? ` (${formatKigali(e.sentAt)})` : ''}
                {e.status === 'sent' && e.error ? ` (${e.error.replaceAll('_', ' ')})` : ''}
                {e.status === 'failed' ? `, reason: ${(e.error ?? 'unknown').replaceAll('_', ' ')}` : ''}
              </li>
            ))}
          </ul>
        )}
        {r.emails.some((e) => e.status === 'failed') && (
          <p className={styles.warn}>An email failed. If this was the alert, call the customer directly.</p>
        )}
      </section>

      <section aria-labelledby="manage-title" className={styles.section}>
        <h2 id="manage-title" className={styles.h2}>Spam and deletion</h2>
        <div className={styles.manage}>
          <SpamForm id={r.id} isSpam={r.isSpam} />
          <DeleteForm id={r.id} />
        </div>
      </section>
    </>
  );
}