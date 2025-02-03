import React, { CSSProperties, useEffect } from "react";
import useSticker, { StickerType } from "../AddOns/useSticker"
import { EditableAddOnManager, type EditAddOnType, type SingleAddOn } from "./addOnUtils";
import { useLetters } from "@/context/lettersContext";
import useEmoji, { EmojiType } from "../AddOns/useEmoji";

interface AddOnProps {
    addOn: SingleAddOn;
    className?: string;
    style?: CSSProperties;
}
const AddOn = ({ addOn, className, style }: AddOnProps) => {
    const { updateAddOn, deleteAddOn } = useLetters();
    const addOnId = `add-${addOn.id}`;

    const editAddOn: EditAddOnType = (value) => {
        updateAddOn(addOn.letterId, addOn.id, value);
    }

    useEffect(() => {
        const manager = new EditableAddOnManager(addOn, editAddOn, deleteAddOn);

        return () => {
            manager.destroy();
        }
    }, [])

    if (addOn.type === 'sticker') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { SvgIcon } = useSticker(addOn.name as StickerType);
        return <div
            style={{
                '--top': addOn.position.y,
                '--left': addOn.position.x,
                '--width': addOn.size?.width,
                '--height': addOn.size?.height,
            } as React.CSSProperties}
            className="addon-wrapper">
            <SvgIcon
                id={addOnId}
                className={`${className} select-none active:cursor-grabbing cursor-grab add-on`} style={{
                    ...style,
                    filter:
                        `drop-shadow(2px 0.16px 20px hsla(0, 0%, 0%, 0.1)) 
                    drop-shadow(0.51px 0.67px 0.82px hsla(0, 0%, 0%, 0.09)) 
                    drop-shadow(1.1px 1.49px 1.1px hsla(0, 0%, 0%, 0.05)) 
                    drop-shadow(1.96px 2.63px 5px hsla(0, 0%, 0%, 0.05)) 
                    drop-shadow(3.06px 4.12px 5px hsla(0, 0%, 0%, 0.03))`,
                    '--rotate': `${addOn?.rotation}deg`
                } as React.CSSProperties} />
        </div>

    } else if (addOn.type === 'emoji') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { imageUrl } = useEmoji(addOn.name as EmojiType);
        return <div
            style={{
                '--top': addOn.position.y,
                '--left': addOn.position.x,
                '--width': addOn.size?.width,
                '--height': addOn.size?.height,
            } as React.CSSProperties}
            className="addon-wrapper">
            <img
                src={imageUrl}
                id={addOnId}
                className={`${className} select-none active:cursor-grabbing cursor-grab add-on`} style={{
                    ...style,
                    filter:
                        `drop-shadow(2px 0.16px 20px hsla(0, 0%, 0%, 0.1)) 
                drop-shadow(0.51px 0.67px 0.82px hsla(0, 0%, 0%, 0.09)) 
                drop-shadow(1.1px 1.49px 1.1px hsla(0, 0%, 0%, 0.05)) 
                drop-shadow(1.96px 2.63px 5px hsla(0, 0%, 0%, 0.05)) 
                drop-shadow(3.06px 4.12px 5px hsla(0, 0%, 0%, 0.03))`,
                    '--rotate': `${addOn?.rotation}deg`
                } as React.CSSProperties} />
        </div>
    }
}

export default AddOn;