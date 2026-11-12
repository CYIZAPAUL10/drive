import { useTranslations } from 'next-intl';
import { accent } from '@/frontend/components/ui/rich';
import styles from './HowItWorks.module.css';

const STEPS = ['step1', 'step2', 'step3'] as const;

export default function HowItWorks() {
  const t = useTranslations('HowItWorks');
  return (
    <section id="how" className={styles.section} aria-labelledby="how-title">
      <div className={styles.inner}>
        <h2 id="how-title" className={styles.title}>{t.rich('title', { accent })}</h2>
        <ol className={styles.list}>
          {STEPS.map((k, i) => (
            <li key={k} className={styles.item}>
              <span className={styles.num} aria-hidden="true">{i + 1}</span>
              <span>{t(k)}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}