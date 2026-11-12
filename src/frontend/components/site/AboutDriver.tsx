import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import Button from '@/frontend/components/ui/Button';
import { accent } from '@/frontend/components/ui/rich';
import { CalendarIcon } from '@/frontend/components/ui/Icons';
import type { SiteProfile } from '@/shared/types/profile';
import styles from './AboutDriver.module.css';

export default function AboutDriver({ profile }: { profile: SiteProfile }) {
  const t = useTranslations('About');
  const home = useTranslations('Home');
  const locale = useLocale();

  const names = new Intl.DisplayNames([locale], { type: 'language' });
  const languages = profile.languages.map((code) => names.of(code) ?? code);
  const languageList = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(languages);

  // ERVAIS's own bio if he wrote one; otherwise the default text from the message files
  const paragraphs = profile.bio
    ? profile.bio.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
    : [];
  // If the bio is in English on a French or Kinyarwanda page, say so for screen readers
  const bioLang = profile.bio && profile.bioLang && profile.bioLang !== locale ? profile.bioLang : undefined;

  return (
    <section id="about" className={styles.section} aria-labelledby="about-title">
      <div className={styles.inner}>
        <div>
          <h2 id="about-title" className={styles.title}>{t.rich('title', { accent })}</h2>
          {paragraphs.length > 0
            ? paragraphs.map((p, i) => <p key={i} lang={bioLang}>{p}</p>)
            : <p>{t('bio')}</p>}
          <ul className={styles.facts}>
            {profile.yearsExperience !== null && (
              <li>{t('experience', { years: profile.yearsExperience })}</li>
            )}
            {languages.length > 0 && <li>{t('languages', { list: languageList })}</li>}
            <li>{t('areas')}</li>
          </ul>
          <div className={styles.cta}>
            <Button href="/book" icon={<CalendarIcon />}>{home('requestRide')}</Button>
          </div>
        </div>
        <Image
          src="/images/vehicle.jpg"
          alt={t('vehicleAlt')}
          width={900}
          height={600}
          sizes="(min-width: 1024px) 560px, 100vw"
          className={styles.photo}
        />
      </div>
    </section>
  );
}