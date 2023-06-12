import Modal from "@/components/modal";
import { Note } from "@/components/note";
import { getNote } from "@/server/notes"

export default async function NoteModal({ params: { id: noteId } }: { params: {
  id: string
}}) {
  const note = await getNote(noteId);

  return (
    <Modal>
      Modal content notes: <pre>{JSON.stringify({ noteId })}</pre>
      <Note note={note} />
    </Modal>
  );
}
