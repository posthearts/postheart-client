import { BASE_URL } from "@/api";
import {
    useState,
    useEffect,
    useCallback,
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
    return localStorage.getItem('token');
}

// API functions
async function fetchLetters(): Promise<LetterType[]> {
    try {
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
    } catch (error) {
        console.error('Error fetching letters:', error);
        throw error;
    }
}

async function createServerLetter(newLetter: LetterType): Promise<LetterType> {
    try {
        const response = await fetch(`${BASE_URL}/letters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(newLetter)
        });
        if (!response.ok) {
            console.error('Failed to create letter:', response.statusText);
            throw new Error('Failed to create letter');
        }
        const data = await response.json();
        console.log('Created letter:', data);
        return data;
    } catch (error) {
        console.error('Error creating letter:', error);
        throw error;
    }
}

async function updateServerLetter(id: string, updatedData: Partial<LetterType>): Promise<void> {
    try {
        const response = await fetch(`${BASE_URL}/letters/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(updatedData)
        });
        if (!response.ok) {
            console.error('Failed to update letter:', response.statusText);
            throw new Error('Failed to update letter');
        }
        console.log('Updated letter:', id);
    } catch (error) {
        console.error('Error updating letter:', error);
        throw error;
    }
}

async function deleteServerLetter(id: string): Promise<void> {
    try {
        const response = await fetch(`${BASE_URL}/letters/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        if (!response.ok) {
            console.error('Failed to delete letter:', response.statusText);
            throw new Error('Failed to delete letter');
        }
        console.log('Deleted letter:', id);
    } catch (error) {
        console.error('Error deleting letter:', error);
        throw error;
    }
}

export function useLettersProvider() {
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
        },
        onError: (error) => {
            console.error('Error creating letter:', error);
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
        onError: (error, _variables, context) => {
            console.error('Error updating letter:', error);
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
        },
        onError: (error) => {
            console.error('Error deleting letter:', error);
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