import { deleteRequestAction } from '@/server/actions/admin.actions';
import AdminSubmit from './AdminSubmit';
import styles from './AdminForms.module.css';

export default function DeleteForm({ id }: { id: string }) {
  return (
    <details className={styles.danger}>
      <summary>Delete this request</summary>
      <p>This permanently deletes the request and its email history. It cannot be undone.</p>
      <form action={deleteRequestAction}>
        <input type="hidden" name="id" value={id} />
        <AdminSubmit idle="Yes, delete permanently" busy="Deleting…" variant="danger" />
      </form>
    </details>
  );
}