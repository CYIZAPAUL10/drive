import { useTranslations } from 'next-intl';
import { Link } from '@/frontend/i18n/navigation';
import { whatsappUrl } from '@/shared/constants/contact';
import { PhoneIcon, WhatsAppIcon, PinIcon, ClockIcon } from '@/frontend/components/ui/Icons';
import type { SiteProfile } from '@/shared/types/profile';
import Logo from './Logo';
import SocialLinks from './SocialLinks';
import styles from './SiteFooter.module.css';

export default function SiteFooter({ profile }: { profile: SiteProfile }) {
  const t = useTranslations('Footer');
  const home = useTranslations('Home');
  const layout = useTranslations('Layout');

  return (
    <footer className={`surface-dark ${styles.footer}`}>
      <div className={styles.inner}>
        <div className={styles.about}>
          <Logo className={styles.logo} />
          <p className={styles.blurb}>{t('brandBlurb')}</p>
          <SocialLinks links={profile.socials} />
        </div>

        <div>
          <h2 className={styles.heading}>{t('quickLinks')}</h2>
          <ul className={styles.links}>
            <li><Link href="/#services" className={styles.link}>{layout('navServices')}</Link></li>
            <li><Link href="/#how" className={styles.link}>{layout('navHow')}</Link></li>
            <li><Link href="/#about" className={styles.link}>{layout('navAbout')}</Link></li>
            <li><Link href="/book" className={styles.link}>{layout('navBook')}</Link></li>
          </ul>
        </div>

        <div>
          <h2 className={styles.heading}>{t('contact')}</h2>
          <ul className={styles.contact}>
            <li>
              <PhoneIcon />
              <a className={styles.link} href={`tel:${profile.phone}`}>{profile.phoneDisplay}</a>
            </li>
            <li>
              <WhatsAppIcon />
              <a
                className={styles.link}
                href={whatsappUrl(home('whatsappPrefill'), profile.whatsappDigits)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {home('whatsappErvais')}
              </a>
            </li>
            <li><PinIcon /><span>{t('location')}</span></li>
            <li><ClockIcon /><span>{t('availability')}</span></li>
          </ul>
        </div>
      </div>

      <div className={styles.bar}>
        <p className={styles.copy}>{t('copyright')}</p>
        <Link href="/privacy" className={styles.link}>{t('privacy')}</Link>
      </div>
    </footer>
  );
}