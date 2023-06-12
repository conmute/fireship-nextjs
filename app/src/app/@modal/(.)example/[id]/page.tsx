import Modal from "@/components/modal";

export default async function SadModal({
  params: { id }
}: { params: { id: string }}) {
  return (
    <Modal>
      Sad example modal <b>{id}</b>
    </Modal>
  );
}
