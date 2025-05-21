import React, { useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";

const GET_NOTES = gql`
  query GetNotes {
    texts {
      id
      title
    }
  }
`;

const CREATE_NOTE = gql`
  mutation CreateNote($title: String!) {
    createText(title: $title) {
      id
      title
    }
  }
`;

type Note = {
    id: number;
    title: string;
};

type SidebarProps = {
    selectedId: number | null;
    onSelect: (id: number) => void;
    setRefetchNotes: (fn: () => void) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ selectedId, onSelect, setRefetchNotes }) => {
    const { data, loading, error, refetch } = useQuery(GET_NOTES);
    const [createNote] = useMutation(CREATE_NOTE);
    // Register refetch function to parent
    useEffect(() => {
        setRefetchNotes(refetch);
    }, [refetch, setRefetchNotes]);
    if (loading) return <aside className="w-64 h-screen border-r p-4 bg-white">Chargement...</aside>;
    if (error) return <aside className="w-64 h-screen border-r p-4 bg-white">Erreur de chargement</aside>;
    const notes: Note[] = data?.texts || [];
    const handleCreateNote = async () => {
        const title = prompt("Titre de la nouvelle note :", "Nouvelle note");
        if (!title) return;
        const res = await createNote({ variables: { title } });
        await refetch();
        if (res.data?.createText?.id) {
            onSelect(res.data.createText.id);
        }
    };
    return (
        <aside className="w-64 h-screen border-r p-4 bg-white">
            <h2 className="font-bold mb-4">Notes</h2>
            <button
                className="mb-4 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
                onClick={handleCreateNote}
            >
                + Nouvelle note
            </button>
            <ul>
                {notes.map((note) => (
                    <li
                        key={note.id}
                        className={`p-2 rounded cursor-pointer mb-1 ${selectedId === note.id ? "bg-blue-200" : "hover:bg-gray-100"}`}
                        onClick={() => onSelect(note.id)}
                    >
                        {note.title}
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default Sidebar;