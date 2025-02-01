import Button from "@/components/UI/SiteButton";
import DownloadCaret from "@/assets/svg/download-caret.svg?react";
import { type ConfigurationProps } from "./Customization";
import { motion } from "motion/react";
import { useFloating, offset } from "@floating-ui/react-dom";
import { MouseEventHandler, useEffect, useRef } from "react";
import { scaleAnimation } from "../letter";
import { domToPng } from "modern-screenshot";
import { select, selectFrom } from "@/utils";
import { A4_DIMENSIONS_Y } from "../LetterView";
import { useOutsideClick } from "@/utils";
// import html2canvas from "html2canvas";

const MotionButton = motion.create(Button);
export default function Download({ activeConfig, onActivate }: ConfigurationProps) {
    const { refs, floatingStyles, update } = useFloating({
        placement: 'bottom-end',
        middleware: [offset({
            // 16 to move under bar
            mainAxis: 16,

            // 8 to move to end of the bar (minus bar padding)
            crossAxis: 8
        })],
        open: activeConfig === 'download',
    });

    useEffect(() => {
        update();
    }, [activeConfig, update]);

    function action() {

    }

    function download() {
        const container = select(`#letter-view`) as HTMLElement;
        const clone = container.cloneNode();
        console.log(clone);
        if (container) {
            // html2canvas(container).then((canvas) => {
            //     document.body.appendChild(canvas);
            // })
            domToPng(container, {
                height: 1013,
                width: 839,
                quality: 1,
                scale: 4,
                style: {
                    '--su': `${854 / A4_DIMENSIONS_Y}px`
                } as unknown as CSSStyleDeclaration,
                features: {
                    copyScrollbar: false,
                },
                font: {
                    cssText: `@import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Gloria+Hallelujah&family=Instrument+Serif:ital@0;1&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');`
                },
                onCreateForeignObjectSvg(node) {
                    console.log(node);
                },
                onCloneNode: (node: Node) => {
                    return new Promise((resolve) => {
                        (node as HTMLElement).style.height = '1013px';
                        (node as HTMLElement).style.width = '839px';
                        const customizer: HTMLElement = selectFrom('.customizer', node as HTMLElement) as HTMLElement;
                        const papers: HTMLElement = selectFrom('#letter-view-papers', node as HTMLElement) as HTMLElement;
                        const mainPaperHolder: HTMLElement = selectFrom('.main-paper-holder', node as HTMLElement) as HTMLElement;

                        if (papers && customizer) {
                            console.log(selectFrom('#posthearts-paper-content', node as HTMLElement));
                            customizer.style.opacity = '0';
                            papers.style.width = '100%';
                            papers.style.gridTemplateColumns = `83px 1fr 83px`;
                            mainPaperHolder.style.width = '100%';
                        }

                        resolve();
                    });
                }
            }).then((dataUrl) => {
                const link = document.createElement('a');
                link.download = 'screenshot.png';
                link.href = dataUrl;
                link.click();
            })
        }
    }

    const ref = useRef<HTMLDivElement | null>(null);
    useOutsideClick(ref, () => {
        onActivate('download')
    }, [activeConfig]);

    function toggleDownload(e: MouseEvent) {
        e.stopPropagation();
        onActivate('download');
    }

    return <>
        <Button
            ref={refs.setReference}
            onClick={toggleDownload as unknown as MouseEventHandler} className="h-8 bg-button-accent flex items-center gap-2 pl-3 pr-2 rounded-full text-white text-sm font-medium">
            Download
            <span
                style={{
                    backgroundColor: 'hsla(0, 0%, 100%, 0.2)',
                }}
                className="w-4 h-4 rounded-full">
                <DownloadCaret />
            </span>
        </Button>

        <div ref={refs.setFloating} style={floatingStyles}>
            {activeConfig === 'download' ? <motion.div
                ref={ref}
                style={{
                    transformOrigin: '100% 0%'
                }}
                {...scaleAnimation}
                className="p-1 rounded-xl bg-backgrounds-on-canvas border border-solid border-border-default shadow-standard flex flex-col min-w-52"
            >
                <MotionButton
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                        transition: {
                            delay: (0 * 0.05) + 0.02
                        }
                    }}
                    onClick={download} className="text-sm leading-[21px] tracking-tight font-medium text-text-secondary h-8 w-full text-left px-2 hover:bg-backgrounds-hover_clicked rounded-lg">
                    Download as PNG
                </MotionButton>
                <MotionButton
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                        transition: {
                            delay: (1 * 0.05) + 0.02
                        }
                    }}
                    onClick={action} className="text-sm leading-[21px] tracking-tight font-medium text-text-secondary h-8 w-full text-left px-2 hover:bg-backgrounds-hover_clicked rounded-lg">
                    Download as PDF
                </MotionButton>
            </motion.div>
                :
                null}
        </div>
    </>
}