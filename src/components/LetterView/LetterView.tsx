import { backgroundColorTransition, normalizeCssStyles, containerId, parseAlignmentToStyle } from "./letter";
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
                container?.classList.remove('stagger');
            }, 500);
        })
    })

    return (
        <div id="letter-view" className="w-full h-full rounded-3xl" style={{ backgroundColor: currentLetter?.frameColor.colorString, transition: backgroundColorTransition, overflow: 'clip' }}>
            <div className="customizer flex items-center justify-between px-4 pt-4 relative z-50">
                <Button onClick={onClick} className="h-12 w-12 rounded-full bg-button-neutral flex items-center justify-center shadow-small">
                    <span className="w-8 h-8 flex items-center justify-center bg-backgrounds-default rounded-full">
                        <Collapse />
                    </span>
                </Button>
                <Customization />
            </div>
            <div className="papers" id="letter-view-papers" style={{ '--su': `${paperWidth / A4_DIMENSIONS_X}px`, '--su-number': `${paperWidth / A4_DIMENSIONS_X}` } as React.CSSProperties}>
                <div className="hedge"></div>
                <div className="main-paper-holder flex items-center justify-center">
                    <div id={containerId} className={`postheart-animate paper h-full bg-cover relative stagger`} style={{ aspectRatio: `${A4_DIMENSIONS_X}/${A4_DIMENSIONS_Y}` }} ref={ref}>
                        <div id={`${containerId}-content`} className="h-full bg-cover relative" style={{ backgroundImage: `url(/textures/${currentLetter?.paper.texture}.png)`, ...normalizeCssStyles(currentLetter?.paper?.cssStyles), borderRadius: `calc(${currentLetter?.paper.customStyle.radius} * var(--su))`, rotate: possibleRotations[paperRotation], transition: 'rotate 0.4s' } as React.CSSProperties}>
                            <div className="absolute inset-0 paper-text flex" style={{
                                alignItems: parseAlignmentToStyle((currentLetter?.contentAlignment) ?? 'top'),
                                paddingTop: `calc(${currentLetter?.paper.customStyle.padding.top} * var(--su))`, paddingBottom: `calc(${currentLetter?.paper.customStyle.padding.bottom} * var(--su))`, paddingLeft: `calc(${currentLetter?.paper.customStyle.padding.left} * var(--su))`, paddingRight: `calc(${currentLetter?.paper.customStyle.padding.right} * var(--su))`, fontFamily: currentLetter?.fontFamily, '--line': `${currentLetter?.paper.customStyle.lineHeight}`
                            } as React.CSSProperties} >
                                <div
                                    dangerouslySetInnerHTML={{ __html: currentLetter?.content || '' }}>
                                </div>
                            </div>
                            {currentLetter?.addOns?.map((addOn, i) => {
                                return <AddOn className="letter-view-add-on" addOn={addOn} key={addOn.id} style={{ '--index': String(i) } as React.CSSProperties} />
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div className="navigator"></div>
        </div>
    );
}