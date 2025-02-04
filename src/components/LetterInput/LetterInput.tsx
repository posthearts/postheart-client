import "./LetterInput.postcss";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import Expand from "@/assets/svg/expand.svg?react";
import Collapse from "@/assets/svg/collapse.svg?react";
import SiteButton from "../UI/SiteButton";
import { truncateString } from "@/utils";

import { useEditor, EditorContent } from '@tiptap/react';
import History from '@tiptap/extension-history';
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Text from "@tiptap/extension-text";

import useMeasure from "react-use-measure";
import { useLetters } from "@/context/lettersContext";

const MAX_LETTER_LENGTH = 1000;
const extensions = [
    Document,
    Paragraph.configure({
        HTMLAttributes: {
            class: 'letter-input-p',
        },
    }),
    Text,
    Placeholder.configure({
        placeholder: 'Write a letter',
    }),
    CharacterCount.configure({
        limit: MAX_LETTER_LENGTH,
    }),
    History,
];
const MotionEditorContent = motion.create(EditorContent);

export default function LetterInput() {
    const { currentLetter, updateLetter } = useLetters();
    const [isExpanded, setIsExpanded] = useState(false);
    const [ref, bounds] = useMeasure();

    // Initialize the editor with the currentLetter content if available
    const editor = useEditor({
        extensions,
        content: currentLetter?.content || '',
        onUpdate: ({ editor }) => {
            if (currentLetter) {
                updateLetter(currentLetter.id, { content: editor.getHTML(), title: truncateString(editor?.getText(), 20) });
            }
        },
    });

    useEffect(() => {
        if (editor && currentLetter) {
            editor.commands.setContent(currentLetter.content);
        }
    }, [currentLetter?.id, editor]);

    const toggleIsExpanded = () => {
        setIsExpanded((oldValue) => !oldValue);
    };

    const handleTextAreaClick = () => {
        editor?.commands.focus();
    };

    return (
        <motion.div
            layout
            transition={{
                duration: 0.4,
                type: 'spring',
                bounce: 0.1,
            }}
            className={`${isExpanded ? 'h-full' : 'h-fit'} chat-box bg-backgrounds-default w-full p-2 flex flex-col`}
            style={{
                borderRadius: 24,
            }}
        >
            <motion.div
                layout
                transition={{
                    duration: 0.4,
                    type: 'spring',
                    bounce: 0.1,
                }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-2">
                    <h4 className="text-[12px] leading-[18px] font-medium pl-4 text-text-secondary flex items-center gap-2">
                        Write with AI
                    </h4>
                    <span className="text-[10px] font-medium tracking-tight h-4 flex items-center px-[6px] rounded-full bg-icon-primary text-text-on-primary">
                        Soon
                    </span>
                </div>

                <SiteButton
                    onClick={toggleIsExpanded}
                    className="w-8 h-8 rounded-full bg-backgrounds-on-canvas flex items-center justify-center"
                >
                    {isExpanded ? <Collapse /> : <Expand />}
                </SiteButton>
            </motion.div>

            <motion.div
                onClick={handleTextAreaClick}
                layout
                // accounts for padding-y
                animate={{ height: (bounds.height + 32) || (null as unknown as number) }}
                transition={{
                    duration: 0.4,
                    type: 'spring',
                    bounce: 0.1,
                }}
                style={{
                    borderRadius: 16,
                }}
                className={`${isExpanded ? 'grow' : ''} mt-2 p-4 bg-backgrounds-on-canvas border border-backgrounds-on-canvas focus-within:border-border-input-active cursor-text overflow-hidden shadow-x-small`}
            >
                <motion.div ref={ref}>
                    <motion.div layout className="w-7 h-7 rounded-full bg-candy-gradient"></motion.div>
                    {editor && (
                        <MotionEditorContent
                            layout
                            transition={{
                                duration: 0
                            }}
                            editor={editor}
                            className="mt-4"
                            placeholder="Write a letter" />
                    )}
                </motion.div>
            </motion.div>

            <motion.div
                layout
                transition={{
                    duration: 0.4,
                    type: 'spring',
                    bounce: 0.1,
                }}
                className="pl-4 mt-3 flex items-center justify-between"
            >
                <div className="flex items-center gap-2">
                    <div
                        className="letter-textarea-length w-4 h-4 rounded-full"
                        style={{
                            '--progress': editor?.storage.characterCount.characters() / MAX_LETTER_LENGTH,
                            backgroundColor: 'hsla(0, 0%, 70%, 1)',
                            backgroundImage: `conic-gradient(rgba(92, 89, 237, 1) 0%,
                                    rgba(92, 89, 237, 1) calc(var(--progress) * 100%),
                                    transparent calc(var(--progress) * 100%),
                                    transparent 100%)`,
                        } as React.CSSProperties}
                    ></div>
                    <span className="text-xs text-text-tertiary font-medium leading-[18px] flex items-center gap-[2px]">
                        <span />
                        {editor?.storage.characterCount.characters()} <span>/</span>
                        <span>{MAX_LETTER_LENGTH}</span>
                    </span>
                </div>

                <SiteButton
                    onClick={() => editor?.commands.clearContent()}
                    className="h-7 flex items-center px-3 text-text-secondary rounded-full bg-backgrounds-on-canvas font-medium text-sm tracking-tight"
                >
                    Clear
                </SiteButton>
            </motion.div>
        </motion.div>
    );
}