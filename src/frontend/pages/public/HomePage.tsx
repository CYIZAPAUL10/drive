import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Button from '@/frontend/components/ui/Button';
import { accent } from '@/frontend/components/ui/rich';
import ServiceList from '@/frontend/components/site/ServiceList';
import HowItWorks from '@/frontend/components/site/HowItWorks';
import AboutDriver from '@/frontend/components/site/AboutDriver';
import CtaBand from '@/frontend/components/site/CtaBand';
import { CalendarIcon, PhoneIcon, WhatsAppIcon, CheckCircleIcon } from '@/frontend/components/ui/Icons';
import { whatsappUrl } from '@/shared/constants/contact';
import type { SiteProfile } from '@/shared/types/profile';
import styles from './HomePage.module.css';

const BENEFITS = ['benefit1', 'benefit2', 'benefit3'] as const;

export default function HomePage({ profile }: { profile: SiteProfile }) {
  const t = useTranslations('Home');
  return (
    <>
      <section className={`surface-dark ${styles.hero}`} data-motion="hero">
        <div className={styles.inner}>
          <div>
            <h1 className={styles.title} data-step="1">{t.rich('heroTitle', { accent })}</h1>
            <p className={styles.intro} data-step="2">{t('intro')}</p>
            <ul className={styles.benefits} data-step="3">
              {BENEFITS.map((k) => (
                <li key={k}><CheckCircleIcon /><span>{t(k)}</span></li>
              ))}
            </ul>
            <div className={styles.actions} data-step="4">
              <Button href="/book" icon={<CalendarIcon />}>{t('requestRide')}</Button>
              <Button href={`tel:${profile.phone}`} external variant="secondary" icon={<PhoneIcon />}>{t('callElvais')}</Button>
              <Button
                href={whatsappUrl(t('whatsappPrefill'), profile.whatsappDigits)}
                external
                newTab
                variant="secondary"
                icon={<WhatsAppIcon />}
              >
                {t('whatsappElvais')}
              </Button>
            </div>
          </div>

          <div className={styles.media} data-step="media">
            <div className={styles.frame}>
              <Image
                src="/images/portrait.jpg"
                alt={t('portraitAlt')}
                width={900}
                height={800}
                priority
                sizes="(min-width: 1024px) 560px, 100vw"
                className={styles.photo}
              />
            </div>
            <div className={styles.callCard}>
              <p className={styles.callLabel}>{t('bookNow')}</p>
              <a className={styles.callNumber} href={`tel:${profile.phone}`}>{profile.phoneDisplay}</a>
            </div>
          </div>
        </div>
      </section>

      <ServiceList />
      <HowItWorks />
      <AboutDriver profile={profile} />
      <CtaBand profile={profile} />
    </>
  );
}