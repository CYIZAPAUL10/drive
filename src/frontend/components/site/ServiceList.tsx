import { useTranslations } from 'next-intl';
import { Link } from '@/frontend/i18n/navigation';
import { SERVICE_KEYS } from '@/shared/constants/services';
import { accent } from '@/frontend/components/ui/rich';
import styles from './ServiceList.module.css';

export default function ServiceList() {
  const t = useTranslations('Services');
  return (
    <section id="services" className={`surface-dark ${styles.section}`} aria-labelledby="services-title">
      <div className={styles.inner}>
        <h2 id="services-title" className={styles.title}>{t.rich('title', { accent })}</h2>
        <ul className={styles.grid}>
          {SERVICE_KEYS.map((k, i) => {
            const name = t(`items.${k}.name`);
            return (
              <li key={k} className={styles.card}>
                <span className={styles.num} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className={styles.name}>{name}</h3>
                <p>{t(`items.${k}.description`)}</p>
                <Link
                  href={`/book?service=${k}`}
                  className={styles.cta}
                  aria-label={`${t('requestService')}: ${name}`}
                >
                  {t('requestService')}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}