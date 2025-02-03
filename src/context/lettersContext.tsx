import { ReactNode } from 'react';
import { LettersProvider as ServerLettersProvider, useLetters } from './lettersContext.server';

export { useLetters };

export function LettersProvider({ children }: { children: ReactNode }) {
    return (
        <ServerLettersProvider>
            {children}
        </ServerLettersProvider>
    );
}