import SocialLinksForm from '@/frontend/components/admin/SocialLinksForm';
import styles from './AdminProfilePage.module.css';

export default function AdminSocialPage({ initial }: { initial: Record<string, string> }) {
  return (
    <>
      <h1 className={styles.title}>Social links</h1>
      <p className={styles.intro}>
        These appear as icons in the website footer, in every language. Leave a box empty to hide that icon.
        Only addresses on the platform&rsquo;s own website are accepted.
      </p>
      <SocialLinksForm initial={initial} />
    </>
  );
}