import CalendarEmpty from "@/assets/svg/calendar-empty.svg?react";
import Plus from "@/assets/svg/plus.svg?react";
import Logo from "@/assets/svg/logo.svg?react";
import Help from "@/assets/svg/help.svg?react";
import SiteButton from "./UI/SiteButton";
import { useCallback, useEffect, useRef, useState, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLetters } from "@/context/lettersContext";
import { type GroupByDateType } from "@/context/lettersUtils";
import { LetterType } from "./LetterView/letter";
import { UserContext } from "@/context/UserContext";

export default function NavBar() {
  const { groupedLetters, letters, createLetter, currentLetter, setCurrentLetter } = useLetters();
  const userContext = useContext(UserContext);
  const user = userContext?.user;
  const COLLAPSIBLE_FROM = 1300;
  const [isCollapsible, setIsCollapsible] = useState(window.innerWidth < COLLAPSIBLE_FROM);
  const [isCollapsed, setIsCollapsed] = useState(isCollapsible);

  const ref = useRef<HTMLDivElement | null>(null);

  const toggleIsCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      if (ref.current) {
        if (newValue) {
          ref.current.removeEventListener("mouseleave", toggleIsCollapsed);
        } else {
          ref.current.addEventListener("mouseleave", toggleIsCollapsed);
        }
      }
      return newValue;
    });
  }, []);

  useEffect(() => {
    const manageCollapsibility = () => {
      const shouldCollapse = window.innerWidth < COLLAPSIBLE_FROM;
      setIsCollapsible(shouldCollapse);
      setIsCollapsed(shouldCollapse);
    };

    window.addEventListener("resize", manageCollapsibility);
    return () => window.removeEventListener("resize", manageCollapsibility);
  }, []);

  return (
    <header>
      <nav className={isCollapsible ? "fixed left-0 top-0 bottom-0 z-10" : "w-fit"}>
        {isCollapsible && (
          <SiteButton
            onClick={toggleIsCollapsed}
            className="h-12 w-12 rounded-full flex items-center justify-center bg-button-neutral absolute top-4 left-4 shadow-small"
          >
            <span className="h-8 w-8 rounded-full flex items-center justify-center bg-backgrounds-default">
              <CalendarEmpty />
            </span>
          </SiteButton>
        )}

        <AnimatePresence initial={false}>
          <motion.div
            ref={ref}
            animate={{
              x: isCollapsed && isCollapsible ? "calc(-100% - 16px)" : 0,
              transition: { type: "spring", bounce: 0.3, duration: 0.5 },
            }}
            className={`w-[337px] bg-backgrounds-on-canvas py-6 px-4 border-r border-border-default sm:w-[220px] flex flex-col 
              ${isCollapsible ? "absolute left-4 top-4 bottom-4 rounded-2xl shadow-standard" : "h-screen border-r-border-default"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 pl-4">
                <Logo />
                <span className="font-medium text-xs tracking-tight px-2 leading-[18px] rounded-full h-5 flex items-center justify-center bg-candy-gradient">
                  Beta
                </span>
              </div>
              <SiteButton
                onClick={createLetter}
                className="h-8 w-8 rounded-full flex items-center justify-center bg-backgrounds-hover_clicked"
              >
                <Plus />
              </SiteButton>
            </div>

            <div className="mt-8 flex flex-col gap-8">
              {letters.length > 0 &&
                Object.entries(groupedLetters).map(([description, letters]) =>
                  description !== "byYear" && Array.isArray(letters) && letters.length ? (
                    <LetterGroup
                      key={description}
                      letters={letters}
                      description={description as LetterGroupType['description']}
                      currentLetterID={currentLetter?.id as string}
                      setCurrentLetter={setCurrentLetter}
                    />
                  ) : null
                )}
            </div>

            <div className="mt-auto flex items-center gap-2">
              <button className="w-5 h-5">
                <Help />
              </button>
              {user && (
                <img src={user.profile_picture} alt="Profile" className="w-8 h-8 rounded-full" />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </nav>
    </header>
  );
}

type LetterGroupTypeDescription = keyof Omit<GroupByDateType, "byYear">;

interface LetterGroupType {
  description: LetterGroupTypeDescription;
  currentLetterID: LetterType["id"];
  setCurrentLetter: ReturnType<typeof useLetters>["setCurrentLetter"];
  letters: GroupByDateType[LetterGroupTypeDescription];
}

function LetterGroup({ description, letters, currentLetterID, setCurrentLetter }: LetterGroupType) {
  return (
    <div>
      <h3 className="h-6 flex items-center px-3 text-text-disabled text-xs leading-small font-semibold tracking-tight capitalize">
        {description}
      </h3>
      <ul className="mt-1 w-full flex flex-col gap-1">
        {letters.map((letter) => (
          <li key={letter.id}>
            <SiteButton
              onClick={() => setCurrentLetter(letter.id)}
              className={`w-full rounded-full h-8 text-text-default text-sm leading-[21px] tracking-tight px-3 flex items-center font-medium cursor-pointer 
                ${letter.id === currentLetterID ? "bg-backgrounds-hover_clicked" : "hover:bg-backgrounds-hover_clicked"}`}
            >
              {letter.title || "Untitled"}
            </SiteButton>
          </li>
        ))}
      </ul>
    </div>
  );
}
