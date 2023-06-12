export default function NoteModal({ params: { id: noteId } }: { params: {
  id: string
}}) {
  return (
    <div>
      …Sidebar content noteId: <pre>{JSON.stringify({ noteId })}</pre>
    </div>
  );
}
