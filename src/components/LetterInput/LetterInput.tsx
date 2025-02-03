import React, { useEffect, useState } from 'react';
import { useLetters } from '../../context/lettersContext';

const LetterInput = () => {
    const { currentLetter, updateLetter } = useLetters();
    const [content, setContent] = useState(currentLetter?.content || '');

    useEffect(() => {
        if (currentLetter) {
            setContent(currentLetter.content);
        }
    }, [currentLetter]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        if (currentLetter) {
            updateLetter(currentLetter.id, { content: e.target.value });
        }
    };

    return (
        <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Start typing your letter..."
            className="w-full h-full p-4"
        />
    );
};

export default LetterInput;