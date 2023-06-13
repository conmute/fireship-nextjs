import Link from 'next/link';
import styles from './Notes.module.css';
import { getNotes } from "@/server/notes"
import { Metadata } from 'next';

export const dynamic = 'auto';
// 'auto' | 'force-dynamic' | 'error' | 'force-static'
// force-static for SSG
// force-dynamic for SSR with lots of updates

export const dynamicParams = true;
// boolean

export const revalidate = 0;
// false | 'force-cache' | 0 | number
// for ISR from `/pages`

export const fetchCache = 'auto';
// 'auto' | 'default-cache' | 'only-cache'
// 'force-cache' | 'force-no-store' | 'default-no-store' | 'only-no-store'

export const runtime = 'nodejs';
// 'edge' | 'nodejs'

export const preferredRegion = 'auto';
// 'auto' | 'global' | 'home' | string | string[]

// or async generateMetadata
export const metadata: Metadata = {
  title: "title",
}

// server components allows to have async for datafetching
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

      <Link href="/create/note/">Create note!</Link>
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
