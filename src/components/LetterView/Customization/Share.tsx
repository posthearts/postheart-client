import Button from "@/components/UI/SiteButton";
import { type ConfigurationProps } from "./Customization";
import { motion } from "motion/react";
import Confetti from "@/assets/svg/confetti.svg?react";
import { offset, useFloating } from "@floating-ui/react-dom";
import { useEffect } from "react";
import { scaleAnimation } from "../letter";

export default function Share({ onActivate, activeConfig }: ConfigurationProps) {
    const { refs, floatingStyles, update } = useFloating({
        placement: 'bottom-end',
        middleware: [
            offset({
                mainAxis: 16,
            }),
        ]
    })

    useEffect(() => {
        update();
    }, [update, activeConfig])

    return <>
        <Button ref={refs.setReference} onClick={() => onActivate('share')} className="h-8 rounded-full bg-backgrounds-default text-sm text-text-secondary px-3 flex items-center gap-1 font-medium opacity-50">
            Share
        </Button>

        <div
            ref={refs.setFloating} style={floatingStyles}
        >
            {
                activeConfig === 'share' ?
                    <motion.div
                        {...scaleAnimation}
                        className="bg-text-default rounded-xl px-4 py-2 flex gap-2"
                        style={{
                            transformOrigin: '100% 0%'
                        }}
                    >
                        <Confetti className="mt-1" />
                        <div className="flex flex-col">
                            <h4 className="text-sm tracking-tight leading-[21px] text-text-on-primary font-medium flex gap-2">
                                Recipient
                                <span
                                    className="font-medium text-[10px] tracking-tight px-2 leading-[15px] rounded-full h-5 flex items-center justify-center bg-candy-gradient text-text-default">
                                    Soon
                                </span>
                            </h4>
                            <p className="text-text-tertiary tracking-tight leading-[18px] text-xs font-normal">
                                A cool way to view letters.
                            </p>
                        </div>
                    </motion.div>
                    : null
            }
        </div>

    </>
}