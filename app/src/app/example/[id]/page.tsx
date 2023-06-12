export default async function GroupExamplePage({
    params: { id }
}: { params: { id: string }}) {
    return (
        <>
            Group Example Page id! <b>{id}</b>
        </>
    )
}
