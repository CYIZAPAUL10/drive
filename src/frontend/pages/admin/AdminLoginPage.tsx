import Logo from '@/frontend/components/site/Logo';
import AdminLoginForm from '@/frontend/components/admin/AdminLoginForm';
import styles from './AdminLoginPage.module.css';

export default function AdminLoginPage() {
  return (
    <main id="main" className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.logoBar}><Logo /></div>
        <h1 className={styles.title}>Admin sign in</h1>
        <AdminLoginForm />
      </div>
    </main>
  );
}