import type { ReactNode } from 'react';
import styles from './AccountFormPage.module.css';

type Props = { title: ReactNode; intro?: string; children: ReactNode };

export default function AccountFormPage({ title, intro, children }: Props) {
  return (
    <>
      <section className={`surface-dark ${styles.hero}`}>
        <div className={styles.inner}>
          <h1 className={styles.title}>{title}</h1>
          {intro && <p className={styles.intro}>{intro}</p>}
        </div>
      </section>
      <div className={styles.body}>
        <div className={styles.inner}>{children}</div>
      </div>
    </>
  );
}