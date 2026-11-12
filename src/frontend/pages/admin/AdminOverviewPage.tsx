import Link from 'next/link';
import { formatKigali } from '@/shared/utils/format';
import type { Overview } from '@/shared/types/overview';
import styles from './AdminOverviewPage.module.css';

export default function AdminOverviewPage({ overview }: { overview: Overview }) {
  const { newRequests, failedAlerts, waitingEmails, lastRun } = overview;
  const stale = lastRun?.stale ?? true;
  const emailsOk = failedAlerts.count === 0 && waitingEmails === 0;

  return (
    <>
      <h1 className={styles.title}>Overview</h1>

      <div className={styles.cards}>
        <section className={styles.card} aria-labelledby="new-requests">
          <h2 id="new-requests" className={styles.label}>New requests</h2>
          <p className={styles.count}>{newRequests}</p>
          <p className={styles.hint}>Requests ELVAIS has not contacted yet.</p>
          <p className={styles.links}>
            <Link href="/admin/requests?status=NEW">View new requests</Link>
            {' · '}
            <Link href="/admin/requests">All requests</Link>
          </p>
        </section>

        <section className={`${styles.card} ${emailsOk ? '' : styles.problem}`} aria-labelledby="emails">
          <h2 id="emails" className={styles.label}>Emails</h2>
          {emailsOk ? (
            <p className={styles.ok}>All emails have been sent.</p>
          ) : (
            <>
              {failedAlerts.count > 0 && (
                <>
                  <p className={styles.warn}>
                    {failedAlerts.count === 1
                      ? '1 alert email could not be sent.'
                      : `${failedAlerts.count} alert emails could not be sent.`}{' '}
                    These customers have not been told about their request. Please contact them directly:
                  </p>
                  <ul className={styles.list}>
                    {failedAlerts.items.map((item) => (
                      <li key={item.id}>
                        <Link href={`/admin/requests/${item.id}`}>{item.referenceCode}, {item.guestName}</Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {waitingEmails > 0 && (
                <p className={styles.warn}>
                  {waitingEmails === 1 ? '1 email is' : `${waitingEmails} emails are`} waiting to be sent. The
                  background job may not be running.
                </p>
              )}
            </>
          )}
        </section>

        <section className={`${styles.card} ${stale ? styles.problem : ''}`} aria-labelledby="job">
          <h2 id="job" className={styles.label}>Background job</h2>
          {lastRun ? (
            <p className={stale ? styles.warn : styles.ok}>
              Last ran {formatKigali(lastRun.at)}{lastRun.ok ? '.' : ', with an error.'}
              {stale ? ' It should run every 5 minutes: check the scheduler.' : ''}
            </p>
          ) : (
            <p className={styles.warn}>It has not run yet. Reminders and retries need it.</p>
          )}
        </section>
      </div>
    </>
  );
}