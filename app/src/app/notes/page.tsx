import Link from 'next/link';
import styles from './Notes.module.css';
import CreateNote from './CreateNote';
import { getNotes } from "@/server/notes"

// export const dynamic = 'auto',
//   dynamicParams = true,
//   revalidate = 0,
//   fetchCache = 'auto',
//   runtime = 'nodejs',
//   preferredRegion = 'auto'

export default async function NotesPage() {
  const notes = await getNotes();

  return (
    <div>

      <h1>Notes</h1>

      <div className={styles.grid}>
        {notes?.map((note) => {
          return <NoteItem key={note.id} note={note} />;
        })}
      </div>

      <CreateNote />
    </div>
  );
}


function NoteItem({ note }: any) {
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
