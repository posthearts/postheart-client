import { BASE_URL } from "@/api";
import {
    useState,
    useEffect,
    useCallback,
    createContext,
    useContext,
    ReactNode,
    useMemo,
    useRef
} from "react";
import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import { type LetterType, Letter } from "@/components/LetterView/letter";
import { AddOnType } from "@/components/LetterView/addOnUtils";
import { getLettersFromStorage, saveLettersToStorage, groupLettersByDate } from "./lettersUtils";

// Utility function to get the auth token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// API functions
async function fetchLetters(): Promise<LetterType[]> {
    const response = await fetch(`${BASE_URL}/letters`, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });
    if (!response.ok) {
        console.error('Failed to fetch letters:', response.statusText);
        throw new Error('Failed to fetch letters');
    }
    const data = await response.json();
    console.log('Fetched letters:', data);
    return data;
}

async function createServerLetter(newLetter: LetterType): Promise<LetterType> {
    const response = await fetch(`${BASE_URL}/letters`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(newLetter)
    });
    return response.json();
}

async function updateServerLetter(id: string, updatedData: Partial<LetterType>): Promise<void> {
    await fetch(`${BASE_URL}/letters/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(updatedData)
    });
}

async function deleteServerLetter(id: string): Promise<void> {
    await fetch(`${BASE_URL}/letters/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });
}

function useLettersProvider() {
    const queryClient = useQueryClient();
    const [currentLetterId, setCurrentLetterId] = useState<string | null>(null);
    const initialLoad = useRef(true);
    const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);

    // Fetch letters from server
    const { data: letters = [] } = useQuery<LetterType[]>({
        queryKey: ['letters'],
        queryFn: fetchLetters,
        initialData: getLettersFromStorage() // Fallback to local storage
    });

    // Mutations
    const { mutate: createLetterMutation } = useMutation({
        mutationFn: createServerLetter,
        onSuccess: (serverLetter) => {
            queryClient.setQueryData<LetterType[]>(['letters'], (old) =>
                old ? [...old, serverLetter] : [serverLetter]
            );
            saveLettersToStorage([...letters, serverLetter]);
        }
    });

    const { mutate: updateLetterMutation } = useMutation({
        mutationFn: ({ id, updatedData }: { id: string; updatedData: Partial<LetterType> }) =>
            updateServerLetter(id, updatedData),
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ['letters'] });
            const previousLetters = queryClient.getQueryData<LetterType[]>(['letters']);

            queryClient.setQueryData<LetterType[]>(['letters'], (old) =>
                old?.map(letter =>
                    letter.id === variables.id
                        ? { ...letter, ...variables.updatedData, updatedAt: new Date().toISOString() }
                        : letter
                )
            );

            return { previousLetters };
        },
        onError: (_err, _variables, context) => {
            queryClient.setQueryData(['letters'], context?.previousLetters);
        }
    });

    const { mutate: deleteLetterMutation } = useMutation({
        mutationFn: deleteServerLetter,
        onSuccess: (_, id) => {
            queryClient.setQueryData<LetterType[]>(['letters'], (old) =>
                old?.filter(letter => letter.id !== id)
            );
            saveLettersToStorage(letters.filter(letter => letter.id !== id));
        }
    });

    // Derived state
    const currentLetter = useMemo(() =>
        letters.find((letter) => letter.id === currentLetterId) || null,
        [letters, currentLetterId]
    );

    const groupedLetters = useMemo(() => groupLettersByDate(letters), [letters]);

    // Initial load logic
    useEffect(() => {
        if (!initialLoad.current || letters.length === 0) return;

        if (letters.length === 0 && !currentLetterId) {
            handleCreateLetter();
        } else if (!currentLetterId && letters.length > 0) {
            const lastEditedLetter = letters.reduce((last, current) =>
                new Date(last.updatedAt ?? 0).getTime() > new Date(current.updatedAt ?? 0).getTime()
                    ? last
                    : current
            );
            setCurrentLetterId(lastEditedLetter.id);
        }

        initialLoad.current = false;
    }, [letters, currentLetterId]);

    // Letter actions
    const handleCreateLetter = useCallback(() => {
        const newLetter = new Letter();
        createLetterMutation(newLetter);
        setCurrentLetterId(newLetter.id);
    }, [createLetterMutation]);

    const handleUpdateLetter = useCallback(
        (id: string, updatedData: Partial<Omit<LetterType, "id" | "createdAt">>) => {
            updateLetterMutation({ id, updatedData });
        },
        [updateLetterMutation]
    );

    const handleDeleteLetter = useCallback((id: string) => {
        deleteLetterMutation(id);
        setCurrentLetterId(prev => prev === id ? null : prev);
    }, [deleteLetterMutation]);

    const handleUpdateAddOn = useCallback(
        (letterId: string, addonId: string, addonData: Partial<Omit<AddOnType, 'id' | 'name'>>) => {
            updateLetterMutation({
                id: letterId,
                updatedData: {
                    addOns: letters.find(l => l.id === letterId)?.addOns?.map(addon =>
                        addon.id === addonId ? { ...addon, ...addonData } : addon
                    )
                }
            });
        },
        [letters, updateLetterMutation]
    );

    const handleDeleteAddOn = useCallback((addOnID: string) => {
        if (!currentLetterId) return;

        updateLetterMutation({
            id: currentLetterId,
            updatedData: {
                addOns: letters.find(l => l.id === currentLetterId)?.addOns?.filter(a => a.id !== addOnID)
            }
        });
    }, [currentLetterId, letters, updateLetterMutation]);

    // Auto-save functionality
    useEffect(() => {
        if (currentLetterId) {
            autoSaveInterval.current = setInterval(() => {
                const currentLetter = letters.find(letter => letter.id === currentLetterId);
                if (currentLetter) {
                    handleUpdateLetter(currentLetter.id, currentLetter);
                }
            }, 5000); // Auto-save every 5 seconds
        }

        return () => {
            if (autoSaveInterval.current) {
                clearInterval(autoSaveInterval.current);
            }
        };
    }, [currentLetterId, letters, handleUpdateLetter]);

    return {
        letters,
        createLetter: handleCreateLetter,
        updateLetter: handleUpdateLetter,
        deleteLetter: handleDeleteLetter,
        currentLetter,
        setCurrentLetter: setCurrentLetterId,
        groupedLetters,
        updateAddOn: handleUpdateAddOn,
        deleteAddOn: handleDeleteAddOn
    };
}

// Context setup
const LettersContext = createContext<ReturnType<typeof useLettersProvider> | undefined>(undefined);

export function LettersProvider({ children }: { children: ReactNode }) {
    const lettersContextValue = useLettersProvider();
    return (
        <LettersContext.Provider value={lettersContextValue}>
            {children}
        </LettersContext.Provider>
    );
}

export function useLetters() {
    const context = useContext(LettersContext);
    if (!context) {
        throw new Error("useLetters must be used within a LettersProvider");
    }
    return context;
}