import NavBar from "./components/NavBar.tsx";
import LetterInput from "./components/LetterInput/LetterInput.tsx";
import LetterView from "./components/LetterView/LetterView.tsx";
import { LettersProvider } from "./context/lettersContext.tsx";

function Editor() {
  return <LettersProvider>
    <div className="flex h-screen w-screen overflow-hidden bg-backgrounds-canvas">
      <NavBar />
      <div className="canvas grow grid grid-cols-[1fr_minmax(664px,_1fr)] items-end p-2 gap-4">
        <LetterInput />
        <LetterView />
      </div>
    </div>
  </LettersProvider>

}

export default Editor
