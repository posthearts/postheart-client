import { UserContext } from "@/context/UserContext";
import { useContext, useState } from "react";
import Button from "../UI/SiteButton";
import { offset, useFloating } from "@floating-ui/react-dom";
import { motion } from "motion/react";
import Broom from "@/assets/svg/broom.svg?react";
import HandFourFinger from "@/assets/svg/hand-four-finger.svg?react";
import { scaleAnimation } from "../LetterView/letter";

export default function User() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const userContext = useContext(UserContext);
    const user = userContext?.user;

    const { refs, floatingStyles } = useFloating({
        placement: 'top-start',
        middleware: [
            offset({
                mainAxis: 8,
            })
        ]
    });

    if (!user) return null;
    return <>
        <Button
            ref={refs.setReference}
            onClick={() => setIsOpen((prev) => !prev)}
        >
            <img src={user.profile_picture} alt="Profile" className="w-5 h-5 rounded-full" />
        </Button>

        <div
            ref={refs.setFloating}
            style={floatingStyles}
        >
            {isOpen ?
                <motion.div
                    {...scaleAnimation}
                    style={{
                        transformOrigin: `0% 100%`
                    }}
                >
                    <div className="p-1 border border-solid border-border-default bg-backgrounds-on-canvas shadow-standard rounded-xl">
                        <div className="flex gap-2 items-center p-2">
                            <img className="w-8 h-8 rounded-full" src={user.profile_picture} alt="Profile Picture" />
                            <div>
                                <h4 className="text-text-default text-sm tracking-tight leading-[21px] font-medium">{user.name}</h4>
                                <p className="text-text-tertiary tracking-tight leading-[18px] text-xs font-normal">{user.email}</p>
                            </div>
                        </div>

                        <hr className="border border-solid border-border-default my-2" />

                        <div>
                            <Button className="w-full text-sm text-text-secondary flex items-center gap-[10px] px-2 py-[5.5px] rounded-full hover:bg-backgrounds-hover_clicked">
                                <Broom />
                                Clear History
                            </Button>
                            <Button className="w-full text-sm text-text-secondary flex items-center gap-[10px] px-2 py-[5.5px] rounded-full hover:bg-backgrounds-hover_clicked">
                                <HandFourFinger />
                                Log Out
                            </Button>
                        </div>
                    </div>
                </motion.div>
                : null}
        </div>
    </>
}