import Button from "@/components/UI/SiteButton";
import Caret from "@/assets/svg/caret.svg?react";
import { type ConfigurationProps } from "./Customization";
import { motion } from "motion/react";
import { scaleAnimation, fontFamilies, type FontFamily } from "../letter";
import Check from "@/assets/svg/check.svg?react";
import { useFloating, offset } from "@floating-ui/react-dom";
import { MouseEventHandler, useEffect, useRef } from "react";
import { useLetters } from "@/context/lettersContext.server";
import { useOutsideClick } from "@/utils";

const MotionButton = motion.create(Button);
export default function FontConfiguration({ activeConfig, onActivate }: ConfigurationProps) {
    const { currentLetter, updateLetter } = useLetters();
    function setCurrentFont(font: FontFamily) {
        if (currentLetter) {
            updateLetter(currentLetter.id, { fontFamily: font })
        }
    }

    const { refs, floatingStyles, update } = useFloating({
        placement: 'bottom-start',
        middleware: [offset({
            mainAxis: 16,
        })],
        open: activeConfig === 'color',
    });

    useEffect(() => {
        update();
    }, [activeConfig, update]);

    const ref = useRef<HTMLDivElement | null>(null);
    useOutsideClick(ref, () => {
        onActivate('fonts');
    }, [activeConfig]);

    function toggleFont(e: MouseEvent) {
        e.stopPropagation();
        onActivate('fonts')
    }

    return <>
        <Button
            ref={refs.setReference}
            onClick={toggleFont as unknown as MouseEventHandler} className="h-8 rounded-full bg-backgrounds-default text-sm text-text-secondary px-3 gap-1 w-[120px] grid items-center grid-cols-[1fr_auto] overflow-hidden">
            <span className="w-full whitespace-nowrap overflow-hidden text-ellipsis font-medium">
                {currentLetter?.fontFamily}
            </span>
            <Caret />
        </Button>

        <div ref={refs.setFloating} style={floatingStyles}>
            {activeConfig === 'fonts' ? <motion.div
                ref={ref}
                {...scaleAnimation}
                className="p-1 w-fit bg-backgrounds-canvas min-w-[260px] border border-border-default shadow-standard"
                style={{
                    borderRadius: 12,
                    transformOrigin: '0% 0%'
                }}>
                {fontFamilies.map((family, i) => {
                    return <MotionButton
                        key={family}
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                            transition: {
                                delay: (i * 0.05) + 0.02
                            }
                        }}
                        onClick={() => setCurrentFont(family)} className="h-8 flex gap-[10px] items-center px-2 text-text-secondary rounded-lg hover:bg-backgrounds-hover_clicked w-full" style={{ fontFamily: family }}>
                        <motion.span
                            animate={{
                                scale: currentLetter?.fontFamily === family ? 1 : 0.5,
                                opacity: currentLetter?.fontFamily === family ? 1 : 0,
                            }}
                        >
                            <Check />
                        </motion.span>
                        {family}
                    </MotionButton>
                })}
            </motion.div>
                : null}
        </div>
    </>
}