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
import { type LetterType, Letter } from "@/components/LetterView/letter";
import { AddOnType } from "@/components/LetterView/addOnUtils";
import { getLettersFromStorage, saveLettersToStorage, groupLettersByDate } from "./lettersUtils";

function useLettersProvider() {
    const [letters, setLetters] = useState<LetterType[]>(getLettersFromStorage);
    const [currentLetterId, setCurrentLetterId] = useState<string | null>(null);
    // Flag to prevent double creation on initial load
    const initialLoad = useRef(true);

    useEffect(() => {
        saveLettersToStorage(letters);
    }, [letters]);

    const createLetter = useCallback(() => {
        const newLetter = new Letter();
        setLetters((prev) => [...prev, newLetter]);
        setCurrentLetterId(newLetter.id); // Set newly created letter as the current letter
    }, []);

    useEffect(() => {
        if (!initialLoad.current) return;
        if (letters.length === 0 && !currentLetterId) {
            createLetter(); // Create a letter if none exist
        } else if (!currentLetterId && letters.length > 0) {
            // Find the last edited letter
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
    }, [letters, currentLetterId, createLetter, setCurrentLetterId]); // Correct dependencies

    const updateLetter = useCallback(
        (id: LetterType['id'], updatedData: Partial<Omit<LetterType, "id" | "createdAt">>) => {
            setLetters((prev) =>
                prev.map((letter) =>
                    letter.id === id
                        ? { ...letter, ...updatedData, updatedAt: new Date().toISOString() }
                        : letter
                )
            );
        },
        []
    );

    const updateAddOn = useCallback(
        (letterId: string, addonId: string, addonData: Partial<Omit<AddOnType, 'id' | 'name'>>) => {
            setLetters((prev) =>
                prev.map((letter) =>
                    letter.id === letterId
                        ? {
                            ...letter,
                            addOns: letter.addOns?.map((addon) =>
                                addon.id === addonId ? { ...addon, ...addonData } : addon
                            ),
                            updatedAt: new Date().toISOString(),
                        }
                        : letter
                )
            );
        },
        []
    );

    const deleteLetter = useCallback((id: string) => {
        setLetters((prev) => prev.filter((letter) => letter.id !== id));
    }, []);

    const setCurrentLetter = useCallback((id: string) => {
        setCurrentLetterId(id);
    }, []);

    const currentLetter = useMemo(() => {
        return letters.find((letter) => letter.id === currentLetterId) || null;
    }, [letters, currentLetterId]);

    const deleteAddOn = useCallback((addOnID: AddOnType['id']) => {
        setLetters((prevLetters) =>
            prevLetters.map((letter) => {
                if (letter.id !== currentLetterId) return letter; // Keep other letters unchanged

                return {
                    ...letter,
                    addOns: letter.addOns?.filter((addOn) => addOn.id !== addOnID) || [],
                    updatedAt: new Date().toISOString(),
                };
            })
        );
    }, [currentLetterId, setLetters]);

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
