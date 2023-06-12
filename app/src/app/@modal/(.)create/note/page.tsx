import Modal from "@/components/modal";
import CreateNote from "@/app/notes/CreateNote"

export default async function CreateNoteModal() {
  return (
    <Modal>
      <CreateNote />
    </Modal>
  );
}
