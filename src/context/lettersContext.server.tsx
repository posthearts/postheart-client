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
    QueryClient
} from '@tanstack/react-query';
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { type LetterType, Letter } from "@/components/LetterView/letter";
import { AddOnType } from "@/components/LetterView/addOnUtils";
import { groupLettersByDate } from "./lettersUtils";

function getAuthToken() {
    return localStorage.getItem('token');
}

// API functions
async function fetchLetters(): Promise<LetterType[]> {
    const response = await fetch(`${BASE_URL}`, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });
    return response.json();
}

async function createServerLetter(newLetter: LetterType): Promise<LetterType> {
    const response = await fetch(`${BASE_URL}`, {
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
    await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(updatedData)
    });
}

async function deleteServerLetter(id: string): Promise<void> {
    await fetch(`${BASE_URL}/${id}`, { 
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });
}

// Query Client with Persistence
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // Garbage collect every 24 hours
        },
    },
});

const persister = createSyncStoragePersister({
    storage: window.localStorage,
});

persistQueryClient({
    queryClient,
    persister,
});

function useLettersProvider() {
    const queryClient = useQueryClient();
    const [currentLetterId, setCurrentLetterId] = useState<string | null>(null);
    const initialLoad = useRef(true);

    // Fetch letters from server with persistent caching
    const { data: letters = [], isSuccess } = useQuery<LetterType[]>({
        queryKey: ['letters'],
        queryFn: fetchLetters,
    });

    // Mutations
    const { mutate: createLetterMutation } = useMutation({
        mutationFn: createServerLetter,
        onSuccess: (serverLetter) => {
            queryClient.setQueryData<LetterType[]>(['letters'], (old) =>
                old ? [...old, serverLetter] : [serverLetter]
            );
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
        if (!initialLoad.current || !isSuccess) return;
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
    }, [letters, currentLetterId, isSuccess]);

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
