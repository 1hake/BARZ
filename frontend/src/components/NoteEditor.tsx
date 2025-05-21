import { useEffect, useState, useRef } from 'react'
import { useQuery, useMutation, useLazyQuery, gql } from '@apollo/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NoteLineInput } from './NoteLineInput';
import { CREATE_LINE, UPDATE_LINE } from './noteMutations';

const GET_LINES = gql`
  query LinesByText($textId: Int!) {
    linesByText(textId: $textId) {
      id
      content
      order
    }
  }
`;
const SEARCH_LINES = gql`
  query SearchLines($word: String!) {
    searchLines(word: $word) {
      id
      content
      textId
    }
  }
`;

type NoteEditorProps = {
    selectedNoteId: number | null,
    refetchNotes: () => void
}

export function NoteEditor({ selectedNoteId, refetchNotes }: NoteEditorProps) {
    const [search, setSearch] = useState('')
    const [filtered, setFiltered] = useState<string[]>([])
    const { data, loading } = useQuery(GET_LINES, {
        skip: selectedNoteId === null,
        variables: { textId: selectedNoteId },
    });
    const [createLine] = useMutation(CREATE_LINE, {
        refetchQueries: [
            { query: GET_LINES, variables: { textId: selectedNoteId } }
        ],
    });
    const [updateLine] = useMutation(UPDATE_LINE, {
        refetchQueries: [
            { query: GET_LINES, variables: { textId: selectedNoteId } }
        ],
    });
    const lines = data?.linesByText || [];
    const [lineValues, setLineValues] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showPanel, setShowPanel] = useState<{ index: number | null, word: string }>({ index: null, word: '' });
    const [searching, setSearching] = useState(false);
    // Use number for browser setTimeout
    const searchTimeout = useRef<number | null>(null);
    const [searchLines] = useLazyQuery(SEARCH_LINES);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const safeLines = Array.isArray(lines) ? lines : [];
        if (safeLines.length === 0) {
            setLineValues(['']);
        } else {
            setLineValues(safeLines.map((l: any) => l.content));
        }
    }, [lines])

    useEffect(() => {
        if (search.trim()) {
            setFiltered(
                lines.filter((l: any) =>
                    l.content.toLowerCase().includes(search.toLowerCase())
                )
            )
        } else {
            setFiltered([])
        }
    }, [search, lines])

    const handleInputChange = (i: number, value: string) => {
        setLineValues((prev) => {
            const copy = [...prev];
            copy[i] = value;
            return copy;
        });
        // Debounced search for last word
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        const words = value.trim().split(/\s+/);
        const lastWord = words[words.length - 1];
        if (lastWord.length > 1) {
            setSearching(true);
            searchTimeout.current = window.setTimeout(async () => {
                try {
                    const result = await searchLines({ variables: { word: lastWord } });
                    if (result.error) {
                        console.error('GraphQL errors:', result.error);
                        setSearchResults([]);
                        setShowPanel({ index: null, word: '' });
                        return;
                    }
                    setSearchResults(result.data?.searchLines || []);
                    setShowPanel({ index: i, word: lastWord });
                } catch (err) {
                    console.error('Apollo searchLines error:', err);
                    setSearchResults([]);
                    setShowPanel({ index: null, word: '' });
                } finally {
                    setSearching(false);
                }
            }, 3000);
        } else {
            setShowPanel({ index: null, word: '' });
            setSearchResults([]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setLineValues((prev) => {
                const copy = [...prev];
                copy.splice(i + 1, 0, '');
                return copy;
            });
            setTimeout(() => {
                setActiveIndex(i + 1);
            }, 0);
        } else if (e.key === 'ArrowUp') {
            if (i > 0) {
                setActiveIndex(i - 1);
            }
        } else if (e.key === 'ArrowDown') {
            if (i < lineValues.length - 1) {
                setActiveIndex(i + 1);
            }
        } else if (e.key === 'Delete' && lineValues[i] === '' && lineValues.length > 1) {
            setLineValues((prev) => {
                const copy = [...prev];
                copy.splice(i, 1);
                return copy;
            });
            setTimeout(() => {
                setActiveIndex(i > 0 ? i - 1 : 0);
            }, 0);
        }
    };

    const handleSave = async () => {
        if (!selectedNoteId) return;
        setSaving(true);
        let changed = false;
        try {
            for (let i = 0; i < lineValues.length; i++) {
                const value = lineValues[i];
                const existing = lines[i];
                if (existing) {
                    if (existing.content !== value) {
                        await updateLine({ variables: { id: existing.id, content: value } });
                        changed = true;
                    }
                } else if (value.trim() !== "") {
                    await createLine({ variables: { textId: selectedNoteId, content: value, order: i } });
                    changed = true;
                }
            }
            refetchNotes();
            toast.success('Sauvegarde réussie !');
        } catch (e) {
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    if (!selectedNoteId) return <div className="flex-1 p-6">Sélectionne un texte</div>

    return (
        <div className="flex-1 p-6 overflow-auto bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 min-h-screen text-white transition-colors duration-300 relative">
            <ToastContainer position="top-right" autoClose={2000} theme="dark" />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-extrabold tracking-tight">Éditeur</h2>
                <input
                    placeholder="🔍 Rechercher un mot"
                    className="w-1/3 px-3 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 transition-all duration-200"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <button
                className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center min-w-[140px] font-semibold text-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleSave}
                disabled={saving}
            >
                {saving ? (
                    <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Sauvegarde...</span>
                ) : (
                    'Sauvegarder'
                )}
            </button>
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <svg className="animate-spin h-8 w-8 text-blue-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    <span className="text-lg">Chargement des lignes...</span>
                </div>
            ) : search.trim() ? (
                <div className="space-y-2 bg-gray-800 rounded-lg p-4 shadow-inner">
                    <h3 className="font-semibold text-blue-300 mb-2">Résultats :</h3>
                    {filtered.length > 0 ? (
                        filtered.map((line, i) => <p key={i} className="text-sm text-gray-200">{line}</p>)
                    ) : (
                        <p className="text-gray-400 italic">Aucun résultat.</p>
                    )}
                </div>
            ) : (
                <div className="relative">
                    {lineValues.map((value, i) => (
                        <div key={i} className="relative">
                            <NoteLineInput
                                value={value}
                                onChange={val => handleInputChange(i, val)}
                                onKeyDown={e => handleKeyDown(e, i)}
                                inputRef={el => {
                                    inputRefs.current[i] = el;
                                    if (activeIndex === i && el) {
                                        el.focus();
                                        setActiveIndex(null);
                                    }
                                }}
                            />
                            {showPanel.index === i && showPanel.word && (
                                <div className="absolute left-0 z-50 mt-1 w-full bg-white text-gray-900 rounded shadow-lg border border-blue-400 animate-fade-in-up">
                                    {searching ? (
                                        <div className="p-2 text-blue-600">Recherche...</div>
                                    ) : searchResults.length > 0 ? (
                                        <ul className="max-h-40 overflow-y-auto">
                                            {searchResults.map((res, idx) => (
                                                <li key={res.id + '-' + idx} className="px-3 py-2 border-b border-gray-200 last:border-b-0 hover:bg-blue-50">
                                                    <span className="font-semibold text-blue-700">{res.content}</span>
                                                    <span className="ml-2 text-xs text-gray-500">(Note #{res.textId})</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-2 text-gray-500 italic">Aucune occurrence trouvée</div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
