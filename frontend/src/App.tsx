import { useState, useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/Sidebar'
import { NoteEditor } from './components/NoteEditor'

const queryClient = new QueryClient();

function App() {
  const [selectedId, setSelectedId] = useState(1)
  const refetchNotesRef = useRef<null | (() => void)>(null)

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen">
        <Sidebar
          selectedId={selectedId}
          onSelect={setSelectedId}
          setRefetchNotes={fn => { refetchNotesRef.current = fn }}
        />
        <NoteEditor selectedNoteId={selectedId} refetchNotes={() => refetchNotesRef.current && refetchNotesRef.current()} />
      </div>
    </QueryClientProvider>
  )
}

export default App


