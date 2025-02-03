import { backgroundColorTransition, normalizeCssStyles, containerId } from "./letter";
import "./LetterView.postcss";
import useMeasure from "react-use-measure";
import Customization from "./Customization/Customization";
import Collapse from "@/assets/svg/collapse.svg?react";
import Button from "../UI/SiteButton";
import { useLetters } from "@/context/lettersContext";
import React, { useEffect, useMemo, useState } from "react";
import { select } from "@/utils";
import AddOn from "./AddOn";

export const A4_DIMENSIONS_X = 483.73;
export const A4_DIMENSIONS_Y = 682.85;
export const A4_DIEMNSIONS = '483.73/682.85';
const possibleRotations = ['-0.5deg', '1deg', '-1deg', '0.5deg']

export default function LetterView() {
    const { currentLetter } = useLetters();
    const [paperRotation, setPaperRotation] = useState(0);

    useEffect(() => {
        setPaperRotation((lastValue) => {
            return (lastValue + 1) % possibleRotations.length;
        })
    }, [currentLetter?.frameColor.colorString]);

    function onClick() {
    }

    const [ref, bounds] = useMeasure();
    const paperWidth = useMemo(() => {
        const paper = select('#posthearts-paper');
        if (paper) {
            return paper.clientWidth;
        } else {
            return 0;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref, bounds]);

    useEffect(() => {
        // remove stagger class after last add on has been animated in
        const lastAddOn = select('.letter-view-add-on:last-child') as HTMLElement;
        lastAddOn?.addEventListener('animationend', () => {
            const container = select(`#${containerId}`);

            // uses set timeout to let the animation finish smoothly
            setTimeout(() => {
                if (container) {
                    container.classList.remove('stagger');
                }
            }, 500);
        })
    })

    return (
        <div id="letter-view" className="w-full h-full rounded-3xl" style={{ backgroundColor: currentLetter?.frameColor.colorString, transition: backgroundColorTransition, overflow: 'clip' }}>
            <div ref={ref} id={containerId} className="relative w-full h-full stagger">
                <div className="absolute w-full h-full" style={{ transform: `rotate(${possibleRotations[paperRotation]})` }}>
                    <div id="posthearts-paper" className="relative w-full h-full" style={normalizeCssStyles(currentLetter?.paper.cssStyles)}>
                        {currentLetter?.addOns?.map((addOn) => (
                            <AddOn key={addOn.id} addOn={addOn} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}