import Button from "@/components/UI/SiteButton";
import { frameColors, LetterType, type FrameColorType } from "../letter";
import { motion } from "motion/react";
import { scaleAnimation, backgroundColorTransition } from "../letter";
import { useFloating, offset } from "@floating-ui/react-dom";
import { type ConfigurationProps } from "./Customization";
import { MouseEvent, MouseEventHandler, useEffect, useMemo, useRef, useState } from "react";
import { useLetters } from "@/context/lettersContext.server";
import SmallCheckBox from "@/assets/svg/small-checkbox.svg?react";
import CaretDown from "@/assets/svg/caret-down.svg?react";
import { useOutsideClick } from "@/utils";

const MotionButton = motion.create(Button);
export default function ColorConfiguration({ activeConfig, onActivate }: ConfigurationProps) {
    const { currentLetter, updateLetter } = useLetters();
    function setCurrentLetterColor(color: FrameColorType) {
        if (currentLetter) {
            updateLetter(currentLetter.id, { frameColor: color });
        }
    }
    const { refs, floatingStyles, update } = useFloating({
        placement: 'bottom-start',
        middleware: [offset({
            mainAxis: 16,
            crossAxis: -100
        })],
        open: activeConfig === 'color',
    });

    useEffect(() => {
        update();
    }, [activeConfig, update]);

    const [expanded, setExpanded] = useState(false);
    function toggleExpansion() {
        setExpanded((oldValue) => !oldValue);
    }

    function toggleActivate() {
        onActivate('color');
        setExpanded(false);
    }

    function onColor(e: MouseEvent) {
        e.stopPropagation();
        toggleActivate();
    }

    return <>
        <Button
            style={{
                backgroundColor: currentLetter?.frameColor.colorString,
                transition: backgroundColorTransition,
                borderColor: `hsla(${currentLetter?.frameColor.h}, ${currentLetter?.frameColor.s}%, ${(currentLetter?.frameColor.l as number) - 10}%, 1)`,
                borderWidth: '2px',
                borderStyle: 'solid'
            }}
            ref={refs.setReference} onClick={onColor as MouseEventHandler} className="w-8 h-8 rounded-full">
        </Button>
        <div
            ref={refs.setFloating} style={floatingStyles}>
            {
                activeConfig === 'color' ?
                    <Colors
                        currentLetter={currentLetter as LetterType}
                        activeConfig={activeConfig}
                        expanded={expanded}
                        onActivate={onActivate}
                        setCurrentLetterColor={setCurrentLetterColor}
                        toggleExpansion={toggleExpansion}
                    />
                    : null
            }
        </div>
    </>
}

interface ColorProps extends ConfigurationProps {
    currentLetter: LetterType;
    expanded: boolean;
    setCurrentLetterColor: (color: FrameColorType) => void;
    toggleExpansion: () => void;
}
function Colors({ currentLetter, activeConfig, onActivate, setCurrentLetterColor, expanded, toggleExpansion }: ColorProps) {

    const adjustedFrameColors = useMemo(() => {
        if (!currentLetter) return [];
        const filtered = [...frameColors].filter((color) => {
            return color.colorString !== currentLetter?.frameColor.colorString
        });
        return [currentLetter?.frameColor, ...filtered];
    }, [currentLetter?.id, activeConfig]);

    const ref = useRef<HTMLDivElement | null>(null);
    useOutsideClick(ref, () => {
        onActivate('color')
    });

    return <motion.div
        ref={ref}
        layout
        {...scaleAnimation}
        transition={{
            type: 'spring',
            bounce: 0,
            duration: 0.2
        }}
        style={{ borderRadius: 24 }}
        className="bg-backgrounds-on-canvas w-fit h-fit px-2 shadow-standard border border-border-default overflow-hidden">
        <motion.div
            layout
            className="flex items-center gap-2 h-12">
            {adjustedFrameColors.slice(0, 7).map((color, i, arr) => {
                return (i !== (arr.length - 1)) || expanded ? <MotionButton
                    key={color.colorString}
                    initial={{
                        opacity: 0
                    }}
                    animate={{
                        opacity: 1
                    }}
                    transition={{
                        delay: (i * 0.02) + 0.05
                    }}
                    onClick={() => setCurrentLetterColor(color)}
                    className={`h-[34px] w-[34px] rounded-full border-2 border-solid relative`} style={{
                        backgroundColor: color.colorString,
                        borderColor: currentLetter?.frameColor.colorString === color.colorString ? `hsla(${color.h}, ${color.s}%, ${color.l - 10}%, 1)` : 'transparent'
                    }}>

                    <SmallCheckBox
                        style={{
                            boxShadow: '0px 0px 4px 0px hsla(0, 0%, 0%, 0.6)',
                            opacity: currentLetter?.frameColor.colorString === color.colorString ? '1' : '0',
                            scale: currentLetter?.frameColor.colorString === color.colorString ? '1' : '0',
                            transition: 'all 0.3s'
                        }}
                        className="absolute -top-[2px] -right-[2px] rounded-full" />

                </MotionButton>

                    : <MotionButton
                        key={color.colorString}
                        className="h-[34px] w-[34px] rounded-full border-2 border-solid relative flex items-center justify-center bg-backgrounds-hover_clicked border-backgrounds-hover_clicked" onClick={toggleExpansion}>
                        <CaretDown />
                    </MotionButton>
            })}
        </motion.div>

        {
            expanded ?
                <motion.div
                    layout
                    className="flex items-center gap-2 h-12">
                    {adjustedFrameColors.slice(7, 16).map((color, i) => {
                        return <motion.div
                            key={color.colorString}
                            initial={{
                                opacity: 0,
                            }}
                            animate={{
                                opacity: 1,
                            }}
                            transition={{
                                delay: (i * 0.02),
                            }}
                        >
                            <MotionButton

                                onClick={() => setCurrentLetterColor(color)}
                                className={`h-[34px] w-[34px] rounded-full border-2 border-solid relative`} style={{
                                    backgroundColor: color.colorString,
                                    borderColor: currentLetter?.frameColor.colorString === color.colorString ? `hsla(${color.h}, ${color.s}%, ${color.l - 10}%, 1)` : 'transparent'
                                }}>

                                <SmallCheckBox
                                    style={{
                                        boxShadow: '0px 0px 4px 0px hsla(0, 0%, 0%, 0.6)',
                                        opacity: currentLetter?.frameColor.colorString === color.colorString ? '1' : '0',
                                        scale: currentLetter?.frameColor.colorString === color.colorString ? '1' : '0',
                                        transition: 'all 0.3s'
                                    }}
                                    className="absolute -top-[2px] -right-[2px] rounded-full" />

                            </MotionButton>
                        </motion.div>

                    })}
                </motion.div>
                : null
        }

    </motion.div>
}