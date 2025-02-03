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
import axios from 'axios';
import { type LetterType, Letter } from "@/components/LetterView/letter";
import { AddOnType } from "@/components/LetterView/addOnUtils";
import { getLettersFromStorage, saveLettersToStorage, groupLettersByDate } from "./lettersUtils";

const API_URL = 'https://posthearts.vercel.app/api/letters';

function useLettersProvider() {
    const [letters, setLetters] = useState<LetterType[]>(getLettersFromStorage);
    const [currentLetterId, setCurrentLetterId] = useState<string | null>(null);
    const initialLoad = useRef(true);

    useEffect(() => {
        const fetchLetters = async () => {
            try {
                const response = await axios.get(API_URL);
                setLetters(response.data);
                saveLettersToStorage(response.data);
            } catch (error) {
                console.error('Error fetching letters:', error);
            }
        };
        fetchLetters();
    }, []);

    useEffect(() => {
        saveLettersToStorage(letters);
    }, [letters]);

    const createLetter = useCallback(async () => {
        try {
            const newLetter = new Letter();
            const response = await axios.post(API_URL, newLetter);
            setLetters((prev) => [...prev, response.data]);
            setCurrentLetterId(response.data.id);
        } catch (error) {
            console.error('Error creating letter:', error);
        }
    }, []);

    useEffect(() => {
        if (!initialLoad.current) return;

        if (letters.length === 0 && !currentLetterId) {
            createLetter();
        } else if (!currentLetterId && letters.length > 0) {
            const lastEditedLetter = letters.reduce((last, current) => {
                const lastDate = new Date(last.updatedAt ?? 0).getTime();
                const currentDate = new Date(current.updatedAt ?? 0).getTime();
                return currentDate > lastDate ? current : last;
            }, letters[0]);

            if (lastEditedLetter) {
                setCurrentLetterId(lastEditedLetter.id);
            }
        }

        initialLoad.current = false;
    }, [letters, currentLetterId, createLetter, setCurrentLetterId]);

    const updateLetter = useCallback(
        async (id: LetterType['id'], updatedData: Partial<Omit<LetterType, "id" | "createdAt">>) => {
            try {
                const response = await axios.put(`${API_URL}/${id}`, updatedData);
                setLetters((prev) =>
                    prev.map((letter) =>
                        letter.id === id ? { ...letter, ...response.data.letter } : letter
                    )
                );
            } catch (error) {
                console.error('Error updating letter:', error);
            }
        },
        []
    );

    const updateAddOn = useCallback(
        async (letterId: string, addonId: string, addonData: Partial<Omit<AddOnType, 'id' | 'name'>>) => {
            try {
                const letter = letters.find((letter) => letter.id === letterId);
                if (letter) {
                    const updatedAddOns = letter.addOns?.map((addon) =>
                        addon.id === addonId ? { ...addon, ...addonData } : addon
                    );
                    await updateLetter(letterId, { addOns: updatedAddOns });
                }
            } catch (error) {
                console.error('Error updating add-on:', error);
            }
        },
        [letters, updateLetter]
    );

    const deleteLetter = useCallback(async (id: string) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            setLetters((prev) => prev.filter((letter) => letter.id !== id));
        } catch (error) {
            console.error('Error deleting letter:', error);
        }
    }, []);

    const setCurrentLetter = useCallback((id: string) => {
        setCurrentLetterId(id);
    }, []);

    const currentLetter = useMemo(() => {
        return letters.find((letter) => letter.id === currentLetterId) || null;
    }, [letters, currentLetterId]);

    const deleteAddOn = useCallback(async (addOnID: AddOnType['id']) => {
        try {
            const letter = letters.find((letter) => letter.id === currentLetterId);
            if (letter) {
                const updatedAddOns = letter.addOns?.filter((addOn) => addOn.id !== addOnID) || [];
                await updateLetter(currentLetterId!, { addOns: updatedAddOns });
            }
        } catch (error) {
            console.error('Error deleting add-on:', error);
        }
    }, [currentLetterId, letters, updateLetter]);

    const groupedLetters = useMemo(() => groupLettersByDate(letters), [letters]);

    return {
        letters,
        createLetter,
        updateLetter,
        deleteLetter,
        currentLetter,
        setCurrentLetter,
        groupedLetters,
        updateAddOn,
        deleteAddOn,
    };
}

const LettersContext = createContext<
    ReturnType<typeof useLettersProvider> | undefined
>(undefined);

export function LettersProvider({ children }: { children: ReactNode }) {
    const letterData = useLettersProvider();
    return (
        <LettersContext.Provider value={letterData}>
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