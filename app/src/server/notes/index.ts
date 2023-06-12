// import PocketBase from 'pocketbase';

export async function getNote(noteId: string) {
    const res = await fetch(
      `http://127.0.0.1:8090/api/collections/notes/records/${noteId}`,
      {
        next: { revalidate: 10 },
      }
    );
    const data = await res.json();
    return data;
  }


export async function getNotes() {
  // const db = new PocketBase('http://127.0.0.1:8090');
  // const result = await db.records.getList('notes');
  const res = await fetch('http://127.0.0.1:8090/api/collections/notes/records?page=1&perPage=30', { cache: 'no-store' });
  const data = await res.json();
  return data?.items as any[];
}
