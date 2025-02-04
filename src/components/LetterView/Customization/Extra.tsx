import { scaleAnimation } from "../letter";
import { motion } from "motion/react";
import Button from "@/components/UI/SiteButton";
import { paperTypes, type PaperType, papersMap } from "../letter";
import { type StickerType, stickerTypes } from "@/components/AddOns/useSticker";
import Checkbox from "@/assets/svg/checkbox.svg?react";
import React, { useRef, useState } from "react";
import useSticker from "@/components/AddOns/useSticker";
import { useLetters } from "@/context/lettersContext.server";
import { SingleAddOn } from "../addOnUtils";
import { Config, type OnActivate } from "./Customization";
import { useOutsideClick } from "@/utils";
import useEmoji, { EmojiType, emojiNames } from "@/components/AddOns/useEmoji";
import "./Extra.postcss";

const extraFilters = [
    'All',
    'Backgrounds',
    'Emojis',
    'Stickers'
] as const;
type ExtraFilter = typeof extraFilters[number];
type ExtraChildProps = {
    currentLetter: ReturnType<typeof useLetters>['currentLetter'];
    updateLetter: ReturnType<typeof useLetters>['updateLetter'];
    toggleFilter: ToggleFilterType;
}
type ToggleFilterType = (filter: ExtraFilter) => void;
interface ExtraProps {
    onActivate: OnActivate;
    activeConfig: Config
}
export default function Extra({ onActivate, activeConfig }: ExtraProps) {
    const { currentLetter, updateLetter } = useLetters();

    const [currentFilter, setCurrentFilter] = useState<ExtraFilter>(() => {
        return (sessionStorage.getItem('post-hearts-extra') as ExtraFilter) || 'All';
    });

    const toggleFilter: ToggleFilterType = (filter) => {
        if (currentFilter !== filter) {
            sessionStorage.setItem('post-hearts-extra', filter);
            setCurrentFilter(filter);
        }
    }

    const ref = useRef<HTMLDivElement | null>(null);
    useOutsideClick(ref, () => {
        onActivate('extra');
    }, [activeConfig])

    return <motion.div
        ref={ref}
        layout
        id="extra-customization"
        {...scaleAnimation}
        transition={{
            duration: 0.4,
            type: 'spring',
            bounce: 0.2
        }}
        style={{
            borderRadius: 24,
            transformOrigin: '0% 0%',
            maxHeight: 'clamp(0px, calc(100vh - 98px), 800px)'
        }}
        className="customize w-full p-5 bg-backgrounds-on-canvas border border-border-default shadow-standard overflow-scroll">
        <motion.div layout>
            <ul className="flex items-center gap-2">
                {extraFilters.map((filter) => {
                    return <li className="list-none" key={filter}>
                        <Button
                            onClick={() => toggleFilter(filter)}
                            className={`${filter === currentFilter ? 'bg-button-accent text-text-primary' : 'bg-backgrounds-default text-text-secondary'} h-8 flex items-center px-3 rounded-full text-sm tracking-tight leading-[21px] font-medium `}>
                            {filter}
                        </Button>
                    </li>
                })}
            </ul>
        </motion.div>
        
        <motion.div
            layout
        >
            {
                currentFilter === 'Backgrounds' || currentFilter === 'All'
                    ? <Backgrounds key="backgrounds-all" index={0} toggleFilter={toggleFilter} currentLetter={currentLetter} updateLetter={updateLetter} currentFilter={currentFilter} className="mt-10" />
                    : null
            }

            {
                currentFilter === 'Emojis' || currentFilter === 'All'
                    ? <EmojiOptions index={1} toggleFilter={toggleFilter} currentLetter={currentLetter} updateLetter={updateLetter} currentFilter={currentFilter} onActivate={onActivate} className="mt-10" />
                    : null
            }

            {
                currentFilter === 'Stickers' || currentFilter === 'All'
                    ? <StickerOptions index={2} toggleFilter={toggleFilter} onActivate={onActivate} currentFilter={currentFilter} updateLetter={updateLetter} currentLetter={currentLetter} className="mt-10" />
                    : null
            }
        </motion.div>
    </motion.div>
}

type Items<Item> = Item[];
interface ExtraRowProps<Item = unknown> {
    filterID: ExtraFilter;
    beta?: boolean;
    items: Items<Item>;
    currentFilter: ExtraFilter;
    itemSlot: (item: Item, index: number) => React.ReactNode;
    className?: string;
    overrideLimit?: boolean;
    toggleFilter: ToggleFilterType;
    index: number;
}
function ExtraRow<Item>({ filterID, beta = false, items, itemSlot, currentFilter, className, overrideLimit = false, toggleFilter, index }: ExtraRowProps<Item>) {
    const isActive = currentFilter === filterID;
    const canShowMore = (items.length > 4) && currentFilter !== filterID && !overrideLimit;
    const itemsToShow = isActive || overrideLimit ? items : items.slice(0, 4);
    return (<motion.div
        key={currentFilter}
        layout
        transition={
            {
                duration: 0,
            }
        }
        style={{
            '--parent-index': isActive ? '0' : String(index),
        } as React.CSSProperties}
        className={`${className} customization-extra-row`}>
        <div
            className="flex items-start justify-between">
            <h5 className="font-semibold text-base tracking-[0.2px] leading-[21px] text-text-secondary flex items-center gap-2">
                {filterID}
                {
                    beta ?
                        <span
                            className="font-medium text-xs tracking-tight px-2 leading-[18px] rounded-full h-5 flex items-center justify-center bg-candy-gradient">
                            Beta
                        </span>
                        : null
                }
            </h5>
            {
                canShowMore ?
                    <button
                        onClick={() => toggleFilter(filterID)}
                        className="text-text-tertiary text-xs tracking-tight leading-[18px] font-medium">
                        {`Show all (${items.length - 4})`}
                    </button>
                    : null
            }
        </div>

        <div className="grid grid-cols-4 items-center justify-between mt-6 gap-5">
            {
                itemsToShow.map((item, i) => {
                    return itemSlot(item, i);
                })
            }
        </div>
    </motion.div>)
}
type ExtraRowParentProps = Pick<ExtraRowProps, 'currentFilter' | 'className' | 'index'>;
type BackgroundOptionsProps = ExtraChildProps & ExtraRowParentProps;
function Backgrounds({ currentFilter, className, currentLetter, updateLetter, toggleFilter, index }: BackgroundOptionsProps) {
    function setLetterBackground(background: PaperType) {
        if (currentLetter && papersMap[background]) {
            updateLetter(currentLetter.id, { paper: papersMap[background] })
        }
    }
    const SingleItem = (paperType: PaperType, i: number) => {
        return <Button
            style={{
                '--item-index': String(i),
            } as React.CSSProperties}
            key={paperType}
            onClick={() => setLetterBackground(paperType)} className="flex flex-col items-center justify-center">
            <div className="bg-backgrounds-default rounded-lg flex items-center justify-center w-full aspect-square relative extra-row-item">
                <div
                    style={{
                        boxShadow: `
                            0.32px 0.42px 1.27px 0px hsla(0, 0%, 0%, 0.1),
                            1.37px 1.79px 2.21px 0px hsla(0, 0%, 0%, 0.09),
                            2.95px 4.01px 2.95px 0px hsla(0, 0%, 0%, 0.05),
                            5.27px 7.06px 3.58px 0px hsla(0, 0%, 0%, 0.01),
                            8.22px 11.07px 3.9px 0px hsla(0, 0%, 0%, 0)`,
                        rotate: '-5deg'
                    }}
                    className="h-[75px] w-[55.34px] bg-white p-[5px] rounded-[10px]">
                    <img
                        className="rounded-[5.38px] w-full h-full object-cover object-center"
                        style={{
                            aspectRatio: '45.34/64',
                        }}
                        src={`/misc/preview-textures/${paperType}.png`} />
                </div>

                <span className="flex items-center justify-center h-4 w-4 rounded-full bg-backgrounds-on-canvas border border-border-default absolute top-1 right-1">
                    {
                        paperType === currentLetter?.paper.texture ?
                            <Checkbox className="" />
                            : null
                    }
                </span>
            </div>
            <span className="mt-2 capitalize text-xs tracking-tight text-text-secondary font-medium leading-[18px]">{paperType.replace('-', ' ')}</span>
        </Button>
    }

    return <ExtraRow<PaperType>
        currentFilter={currentFilter}
        filterID="Backgrounds"
        beta={false}
        items={[...paperTypes]}
        itemSlot={SingleItem}
        className={className}
        overrideLimit={true}
        toggleFilter={toggleFilter}
        index={index}
    />
}

type StickerOptionsProps = ExtraChildProps & ExtraRowParentProps & {
    onActivate: OnActivate;
};
function StickerOptions({ currentFilter, className = '', currentLetter, updateLetter, onActivate, toggleFilter, index }: StickerOptionsProps) {

    function addSticker(sticker: StickerType) {
        if (currentLetter) {
            const newSticker = new SingleAddOn({ name: sticker, type: 'sticker', letterId: currentLetter.id });
            if (Array.isArray(currentLetter.addOns)) {
                updateLetter(currentLetter.id, { addOns: [...currentLetter.addOns, newSticker] })
            } else {
                updateLetter(currentLetter.id, { addOns: [newSticker] })
            }

            onActivate('extra');
        }
    }

    const SingleStickerItem = (sticker: StickerType, i: number) => {
        const { SvgIcon } = useSticker(sticker);
        return <div
            key={sticker}
            className="w-full h-full flex items-center justify-center extra-row-item"
            style={{
                '--item-index': String(i)
            } as React.CSSProperties}
        >
            <Button
                onClick={() => addSticker(sticker)}>
                <SvgIcon
                    style={{
                        filter: `drop-shadow(2px 0.16px 20px 0px hsla(0, 0%, 0%, 0.1))
                            drop-shadow(0.51px 0.67px 0.82px 0px hsla(0, 0%, 0%, 0.09))
                            drop-shadow(1.1px 1.49px 1.1px 0px hsla(0, 0%, 0%, 0.05))
                            drop-shadow(1.96px 2.63px 5px 0px hsla(0, 0%, 0%, 0.05))
                            drop-shadow(3.06px 4.12px 5px 0px hsla(0, 0%, 0%, 0.03))`
                    }} />
            </Button>
        </div>
    }

    return <ExtraRow<StickerType>
        index={index}
        filterID="Stickers"
        currentFilter={currentFilter}
        className={className}
        beta={true}
        items={[...stickerTypes]}
        itemSlot={SingleStickerItem}
        toggleFilter={toggleFilter}
    />
}

type EmojiOptionsProps = ExtraChildProps & ExtraRowParentProps & {
    onActivate: OnActivate
}
function EmojiOptions({ currentFilter, currentLetter, index, toggleFilter, updateLetter, className, onActivate }: EmojiOptionsProps) {
    function addEmoji(emoji: EmojiType) {
        if (currentLetter) {
            const newEmoji = new SingleAddOn({ name: emoji, type: 'emoji', letterId: currentLetter.id });
            if (Array.isArray(currentLetter.addOns)) {
                updateLetter(currentLetter.id, { addOns: [...currentLetter.addOns, newEmoji] })
            } else {
                updateLetter(currentLetter.id, { addOns: [newEmoji] })
            }

            onActivate('extra')
        }
    };

    const SingleEmojiItem = (emoji: EmojiType, i: number) => {
        const { imageUrl } = useEmoji(emoji);
        return <div
            key={emoji}
            className="w-full h-full flex items-center justify-center extra-row-item"
            style={{
                '--item-index': String(i)
            } as React.CSSProperties}
        >
            <Button
                onClick={() => addEmoji(emoji)}
            >
                <img className="w-14 h-14" src={imageUrl} />
            </Button>
        </div>
    }
    return <ExtraRow<EmojiType>
        index={index}
        filterID="Emojis"
        currentFilter={currentFilter}
        beta={true}
        items={[...emojiNames]}
        itemSlot={SingleEmojiItem}
        toggleFilter={toggleFilter}
        className={className}
    />
}