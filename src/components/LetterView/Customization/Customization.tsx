import Button from "@/components/UI/SiteButton";
import Customize from "@/assets/svg/customize.svg?react";
// import Download from "@/assets/svg/download.svg?react";
import { MouseEventHandler, useEffect, useState } from "react";
import Extra from "./Extra";
import ColorConfiguration from "./ColorConfiguration";
import FontConfiguration from "./FontConfiguration";
import { useFloating, offset, size } from "@floating-ui/react-dom";
import Download from "./Download";
import Share from "./Share";
import Alignment from "./Alignment";

export type Config = '' | 'fonts' | 'extra' | 'share' | 'color' | 'download' | 'alignment';
export type OnActivate = (config: Config) => void;
export interface ConfigurationProps {
    activeConfig: Config;
    onActivate: OnActivate
}
export default function LetterConfiguration() {
    const [activeConfig, setActiveConfig] = useState<Config>('');
    function onActivate(config: Config) {
        if (activeConfig === config) {
            setActiveConfig('')
        } else {
            setActiveConfig(config)
        }
    }

    const { refs, floatingStyles, update } = useFloating({
        placement: 'bottom-start',
        middleware: [
            offset({
                mainAxis: 7,
            }),
            size({
                apply({ rects, elements }) {
                    Object.assign(elements.floating.style, {
                        minWidth: `${rects.reference.width}px`,
                    });
                },
            })
        ]
    });

    useEffect(() => {
        update();
    }, [update, activeConfig]);

    function toggleExtra(e: MouseEvent) {
        e.stopPropagation();
        onActivate('extra')
    }

    return (
        <>
            <div className="relative z-10">
                <div ref={refs.setReference} className="flex gap-2 bg-button-neutral shadow-small p-2 rounded-full">
                    <Button onClick={toggleExtra as unknown as MouseEventHandler} className="h-8 rounded-full flex items-center justify-center w-[110px]">
                        <Customize />
                    </Button>
                    <ColorConfiguration onActivate={onActivate} activeConfig={activeConfig} />
                    <Alignment onActivate={onActivate} activeConfig={activeConfig} />
                    <FontConfiguration onActivate={onActivate} activeConfig={activeConfig} />
                    <Share onActivate={onActivate} activeConfig={activeConfig} />
                    <Download activeConfig={activeConfig} onActivate={onActivate} />
                </div>

                <div ref={refs.setFloating} style={floatingStyles}>
                    {
                        activeConfig === 'extra' ? <Extra onActivate={onActivate} activeConfig="" />
                            : null
                    }
                </div>

            </div>

        </>)
}