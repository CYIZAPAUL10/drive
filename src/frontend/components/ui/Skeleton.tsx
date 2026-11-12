import styles from './Skeleton.module.css';

function Block({ className }: { className: string }) {
  return <div className={`${styles.block} ${className}`} />;
}

/** For visitor pages: a dark title band and a few cards. `label` is read to screen readers. */
export function PageSkeleton({ label, cards = 3 }: { label: string; cards?: number }) {
  return (
    <div role="status" className={styles.page}>
      <span className="sr-only">{label}</span>
      <div className={styles.hero} aria-hidden="true">
        <div className={styles.inner}>
          <Block className={`${styles.title} ${styles.darkBlock}`} />
          <Block className={`${styles.line} ${styles.medium} ${styles.darkBlock}`} />
        </div>
      </div>
      <div className={styles.body} aria-hidden="true">
        <div className={styles.inner}>
          <ul className={styles.list}>
            {Array.from({ length: cards }, (_, i) => (
              <li key={i} className={styles.card}>
                <Block className={styles.chip} />
                <Block className={`${styles.line} ${styles.medium}`} />
                <Block className={`${styles.line} ${styles.short}`} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** For the admin: a title and a few blocks. */
export function AdminSkeleton({ label }: { label: string }) {
  return (
    <div role="status" className={styles.adminPage}>
      <span className="sr-only">{label}</span>
      <div aria-hidden="true">
        <Block className={styles.adminTitle} />
        <div className={styles.adminGrid}>
          <Block className={styles.adminCard} />
          <Block className={styles.adminCard} />
          <Block className={styles.adminCard} />
        </div>
      </div>
    </div>
  );
}