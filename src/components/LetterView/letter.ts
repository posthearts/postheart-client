import { type CSSProperties } from "react";
import { v4 as uuidv4 } from "uuid";
import { SingleAddOn } from "./addOnUtils";

export interface LetterType {
    title: string;
    frameColor: FrameColorType;
    content: string;
    paper: Paper;
    fontFamily: FontFamily;
    addOns?: SingleAddOn[];
    id: string;
    createdAt: string;
    updatedAt?: string;
}

export class Letter implements LetterType {
    title = 'Untitled';
    frameColor = selectRandomly(frameColors);
    content = '';
    paper = selectRandomly(papers);
    fontFamily = selectRandomly(fontFamilies);
    addOns = [];
    id = uuidv4();
    createdAt = new Date().toISOString();
    updatedAt = this.createdAt;
}

export const frameColors = [
    { colorString: 'hsla(0, 0%, 15%, 1)', h: 0, s: 0, l: 15 },
    { colorString: 'hsla(241, 80%, 64%, 1)', h: 241, s: 80, l: 64 },
    { colorString: 'hsla(320, 100%, 84%, 1)', h: 320, s: 100, l: 84 },
    { colorString: 'hsla(20, 89%, 54%, 1)', h: 20, s: 89, l: 54 },
    { colorString: 'hsla(47, 99%, 62%, 1)', h: 47, s: 99, l: 62 },
    { colorString: 'hsla(30, 100%, 29%, 1)', h: 30, s: 100, l: 29 },
    { colorString: 'hsla(0, 0%, 83%, 1)', h: 0, s: 0, l: 83 },
    { colorString: 'hsla(155, 41%, 42%, 1)', h: 155, s: 41, l: 42 },
    { colorString: 'hsla(207, 93%, 50%, 1)', h: 207, s: 93, l: 50 },
    { colorString: 'hsla(350, 85%, 40%, 1)', h: 350, s: 85, l: 40 },
    { colorString: 'hsla(324, 97%, 65%, 1)', h: 324, s: 97, l: 65 },
    { colorString: 'hsla(209, 92%, 69%, 1)', h: 209, s: 92, l: 69 },
    { colorString: 'hsla(289, 87%, 63%, 1)', h: 289, s: 87, l: 63 },
    { colorString: 'hsla(0, 5%, 61%, 1)', h: 0, s: 5, l: 61 }
] as const;
export type FrameColorType = (typeof frameColors)[number];

export const paperTypes = ['brown', 'pink', 'note-book', 'a4-paper', 'burnt-paper', 'sticky-note'] as const;
export type PaperType = (typeof paperTypes)[number];
export interface Paper {
    texture: PaperType;
    customStyle: {
        radius: number;
        padding: {
            top: number;
            bottom: number;
            left: number;
            right: number;
        },
        lineHeight: number;
    },
    cssStyles?: Omit<CSSProperties, 'padding' | 'paddingTop' | 'paddingLeft' | 'paddingBottom' | 'paddingRight' | 'borderRadius' | 'fontFamily' | 'font' | 'lineHeight'>;
};
export const papers: Paper[] = [
    {
        texture: 'brown',
        customStyle: {
            radius: 16,
            padding: {
                top: 39.81,
                bottom: 38.04,
                left: 32.42,
                right: 21.57,
            },
            lineHeight: 20.85,
        },
        cssStyles: {
            backgroundColor: 'hsla(0, 0%, 100%, 1)',
            boxShadow:
                `3.37px 4.5px 13.5px 0px hsla(0, 0%, 0%, 0.1), 
            14.62px 19.12px 23.62px 0px hsla(0, 0%, 0%, 0.09), 
            31.5px 42.75px 31.5px 0px hsla(0, 0%, 0%, 0.05), 
            56.25px 75.37px 38.25px 0px hsla(0, 0%, 0%, 0.01), 
            87.75px 118.12px 41.62px 0px hsla(0, 0%, 0%, 0), 
            -1px 4px 10px 0px hsla(0, 0%, 0%, 0.15)`,
        }
    },
    {
        texture: 'pink',
        customStyle: {
            radius: 16,
            padding: {
                top: 39.81,
                bottom: 38.04,
                left: 32.42,
                right: 21.57,
            },
            lineHeight: 20.85,
        },
        cssStyles: {
            backgroundColor: 'hsla(0, 0%, 100%, 1)',
            boxShadow:
                `3.37px 4.5px 13.5px 0px hsla(0, 0%, 0%, 0.1), 
            14.62px 19.12px 23.62px 0px hsla(0, 0%, 0%, 0.09), 
            31.5px 42.75px 31.5px 0px hsla(0, 0%, 0%, 0.05), 
            56.25px 75.37px 38.25px 0px hsla(0, 0%, 0%, 0.01), 
            87.75px 118.12px 41.62px 0px hsla(0, 0%, 0%, 0), 
            -1px 4px 10px 0px hsla(0, 0%, 0%, 0.15)`,
        }
    },
    {
        texture: 'note-book',
        customStyle: {
            radius: 16,
            padding: {
                top: 47,
                bottom: 66.5,
                left: 55,
                right: 21.73,
            },
            lineHeight: 32,
        },
        cssStyles: {
            backgroundColor: 'hsla(0, 0%, 100%, 1)',
            boxShadow:
                `3.37px 4.5px 13.5px 0px hsla(0, 0%, 0%, 0.1), 
            14.62px 19.12px 23.62px 0px hsla(0, 0%, 0%, 0.09), 
            31.5px 42.75px 31.5px 0px hsla(0, 0%, 0%, 0.05), 
            56.25px 75.37px 38.25px 0px hsla(0, 0%, 0%, 0.01), 
            87.75px 118.12px 41.62px 0px hsla(0, 0%, 0%, 0), 
            -1px 4px 10px 0px hsla(0, 0%, 0%, 0.15)`,
        }
    },
    {
        texture: 'a4-paper',
        customStyle: {
            radius: 16,
            padding: {
                top: 39.81,
                bottom: 38.04,
                left: 32.42,
                right: 21.57,
            },
            lineHeight: 20.85,
        },
        cssStyles: {
            backgroundColor: 'hsla(0, 0%, 100%, 1)',
            boxShadow:
                `3.37px 4.5px 13.5px 0px hsla(0, 0%, 0%, 0.1), 
            14.62px 19.12px 23.62px 0px hsla(0, 0%, 0%, 0.09), 
            31.5px 42.75px 31.5px 0px hsla(0, 0%, 0%, 0.05), 
            56.25px 75.37px 38.25px 0px hsla(0, 0%, 0%, 0.01), 
            87.75px 118.12px 41.62px 0px hsla(0, 0%, 0%, 0), 
            -1px 4px 10px 0px hsla(0, 0%, 0%, 0.15)`,
        }
    },
    {
        texture: 'burnt-paper',
        customStyle: {
            radius: 16,
            padding: {
                top: 39.81,
                bottom: 38.04,
                left: 32.42,
                right: 21.57,
            },
            lineHeight: 20.85,
        },
        cssStyles: {
            backgroundColor: 'hsla(0, 0%, 100%, 1)',
            boxShadow:
                `3.37px 4.5px 13.5px 0px hsla(0, 0%, 0%, 0.1), 
            14.62px 19.12px 23.62px 0px hsla(0, 0%, 0%, 0.09), 
            31.5px 42.75px 31.5px 0px hsla(0, 0%, 0%, 0.05), 
            56.25px 75.37px 38.25px 0px hsla(0, 0%, 0%, 0.01), 
            87.75px 118.12px 41.62px 0px hsla(0, 0%, 0%, 0), 
            -1px 4px 10px 0px hsla(0, 0%, 0%, 0.15)`,
        }
    },
    {
        texture: 'sticky-note',
        customStyle: {
            radius: 0,
            padding: {
                top: 93,
                bottom: 38.51,
                left: 32,
                right: 21.57,
            },
            lineHeight: 20.85,
        },
    },

];
type PapersMapType = {
    [key in PaperType]: Paper;
}
export const papersMap = papers.reduce((allPapers: Partial<PapersMapType>, currentPaper) => {
    allPapers[currentPaper.texture] = currentPaper;
    return allPapers;
}, {})
export function convertBoxShadowToCalc(boxShadow: string) {
    return boxShadow.replace(/(-?\d+(\.\d+)?)px/g, (_, value) => {
        return `calc(${value} * var(--su))`;
    });
}
export function normalizeCssStyles(styles: Paper['cssStyles']) {
    styles = { ...styles };
    if (styles?.boxShadow) {
        styles.boxShadow = convertBoxShadowToCalc(styles.boxShadow);
    };

    return styles;
}

export const fontFamilies = ["DM Mono", "Instrument Serif", "Gloria Hallelujah"] as const;
export type FontFamily = typeof fontFamilies[number];

export const scaleAnimation = {
    initial: { scale: 0.8 },
    animate: { scale: 1, transition: { duration: 0.4, type: 'spring', bounce: 0.4, } },
};

export function selectRandomly<T>(items: T[] | readonly T[]) {
    const { random, floor } = Math;
    return items[floor(random() * items.length)];
}

export const backgroundColorTransition = `background-color 0.3s ease`;
export const containerId = 'posthearts-paper';