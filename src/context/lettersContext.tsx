import { createContext, useContext, ReactNode } from 'react';
import { useLettersProvider } from './lettersContext.server';

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