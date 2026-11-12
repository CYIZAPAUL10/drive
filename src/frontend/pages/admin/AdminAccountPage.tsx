import ChangePasswordForm from '@/frontend/components/admin/ChangePasswordForm';
import styles from './AdminAccountPage.module.css';

export default function AdminAccountPage({ email }: { email: string }) {
  return (
    <>
      <h1 className={styles.title}>Account</h1>
      <p className={styles.intro}>Signed in as <strong>{email}</strong>.</p>
      <section aria-labelledby="pw-title" className={styles.section}>
        <h2 id="pw-title" className={styles.h2}>Change password</h2>
        <p className={styles.hint}>
          Use at least 12 characters. A few unrelated words are easy to remember and hard to guess. Other devices
          signed in to the admin will be signed out.
        </p>
        <ChangePasswordForm />
      </section>
    </>
  );
}