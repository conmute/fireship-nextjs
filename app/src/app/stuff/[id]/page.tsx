export default function NotePage({ params }: any) {
    // const note = await getNote(params.id);
  
    return (
      <div>
        stuff id params: {JSON.stringify({ params })}
        {/*
        <h1>notes/{note.id}</h1>
        <div className={styles.note}>
          <h3>{note.title}</h3>
          <h5>{note.content}</h5>
          <p>{note.created}</p>
        </div>
        */}
      </div>
    );
  }
  