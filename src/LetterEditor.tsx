import NavBar from "./components/NavBar";
import LetterInput from "./components/LetterInput/LetterInput";
import LetterView from "./components/LetterView/LetterView";
import { LettersProvider } from "./context/lettersContext";

function Editor() {
  return (
    <LettersProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-backgrounds-canvas">
        <NavBar />
        <div className="canvas grow grid grid-cols-[1fr_minmax(664px,_1fr)] items-end p-2 gap-4">
          <LetterInput />
          <LetterView />
        </div>
      </div>
    </LettersProvider> 
  ); 
}

export default Editor;