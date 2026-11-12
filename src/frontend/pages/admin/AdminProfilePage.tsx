import ProfileForm from '@/frontend/components/admin/ProfileForm';
import TestEmailForm from '@/frontend/components/admin/TestEmailForm';
import type { ProfileInitial } from '@/shared/types/profile';
import styles from './AdminProfilePage.module.css';

export default function AdminProfilePage({ initial }: { initial: ProfileInitial }) {
  return (
    <>
      <h1 className={styles.title}>Profile and content</h1>
      <p className={styles.intro}>
        These details appear on the website. Changes show up within seconds, in every language.
      </p>
      <ProfileForm initial={initial} />
      <section aria-labelledby="test-title" className={styles.test}>
        <h2 id="test-title" className={styles.h2}>Test the alert email</h2>
        <p>
          New booking requests are emailed to the alert address above. After changing it, send a test to make sure it
          arrives. Save your changes first, because the test goes to the saved address.
        </p>
        <TestEmailForm />
      </section>
    </>
  );
}