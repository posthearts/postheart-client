import Button from "@/components/UI/SiteButton";
import AlignTop from "@/assets/svg/align-top.svg?react";
import AlignBottom from "@/assets/svg/align-bottom.svg?react";
import AlignCenter from "@/assets/svg/align-center.svg?react";
import { scaleAnimation, type ContentAlignmentType } from "../letter";
import { ConfigurationProps } from "./Customization";
import { useLetters } from "@/context/lettersContext.server";
import { offset, useFloating } from "@floating-ui/react-dom";
import { motion } from "motion/react";
import { alignments } from "../letter";
import { useEffect, useRef } from "react";
import "./Alignment.postcss";
import { useOutsideClick } from "@/utils";

export default function Alignment({ activeConfig, onActivate }: ConfigurationProps) {
    const { currentLetter, updateLetter } = useLetters();
    function setCurrentLetterAlignment(alignment: ContentAlignmentType) {
        if (currentLetter) {
            updateLetter(currentLetter.id, { contentAlignment: alignment });
        }
    }
    const { refs, floatingStyles, update } = useFloating({
        placement: 'bottom',
        middleware: [
            offset({
                mainAxis: 16,
            })
        ],
        open: activeConfig === 'alignment',
    });

    useEffect(() => {
        update()
    }, [activeConfig, update]);

    const ref = useRef<HTMLDivElement | null>(null);
    useOutsideClick(ref, () => {
        onActivate('alignment');
    }, [activeConfig]);

    function toggleActivate(e: React.MouseEvent<HTMLButtonElement>) {
        e.stopPropagation();
        onActivate('alignment');
    }

    return <>
        <Button
            ref={refs.setReference}
            onClick={toggleActivate}
            className="bg-backgrounds-hover_clicked w-8 h-8 rounded-full flex items-center justify-center">
            <motion.span
                key={currentLetter?.contentAlignment}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
            >
                <AlignmentIcon
                    alignment={currentLetter?.contentAlignment ?? 'top'} />
            </motion.span>
        </Button>

        <div
            id="alignment-floating"
            ref={refs.setFloating} style={floatingStyles}>
            {
                activeConfig === 'alignment' ?
                    <motion.div
                        ref={ref}
                        {...scaleAnimation}
                        className="h-10 rounded-full shadow-standard flex items-center justify-center bg-backgrounds-on-canvas p-1 gap-1 border border-border-default"
                        style={{
                            transformOrigin: 'top center'
                        }}
                    >
                        {
                            alignments.map((alli) => {
                                return <Button
                                    onClick={() => setCurrentLetterAlignment(alli)}
                                    className={`${alli === (currentLetter?.contentAlignment ?? 'top') ? 'bg-backgrounds-hover_clicked active-alignment' : ''} alignment-button w-8 h-8 rounded-full flex items-center justify-center`}>
                                    <AlignmentIcon alignment={alli} />
                                </Button>
                            })
                        }
                    </motion.div>
                    : null
            }
        </div>
    </>
}


interface CurrentAlignmentProps {
    alignment: ContentAlignmentType;
}
function AlignmentIcon({ alignment }: CurrentAlignmentProps) {
    if (alignment === 'top') {
        return <AlignTop />
    } else if (alignment === 'center') {
        return <AlignCenter />
    } else if (alignment === 'bottom') {
        return <AlignBottom />
    } else {
        // never
        return alignment;
    }
}