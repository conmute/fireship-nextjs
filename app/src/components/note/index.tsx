import Link from 'next/link';
import styles from './note.module.css';

export function Note({ note }: any) {
    const { id, title, content, created } = note || {};
  
    return (
      <Link href={`/notes/${id}`}>
        <div className={styles.note}>
          <h2>{title}</h2>
          <h5>{content}</h5>
          <p>{created}</p>
        </div>
      </Link>
    );
  }
  