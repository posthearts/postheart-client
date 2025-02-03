import NavBar from "./components/NavBar.tsx";
import LetterInput from "./components/LetterInput/LetterInput.tsx";
import LetterView from "./components/LetterView/LetterView.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LettersProvider } from "./context/lettersContext.tsx";

const queryClient = new QueryClient();

function Editor() {
  return <QueryClientProvider client={queryClient}>
  <LettersProvider>
  return <LettersProvider>
    <div className="flex h-screen w-screen overflow-hidden bg-backgrounds-canvas">
      <NavBar />
      <div className="canvas grow grid grid-cols-[1fr_minmax(664px,_1fr)] items-end p-2 gap-4">
        <LetterInput />
        <LetterView />
      </div>
    </div>
  </LettersProvider>
  </LettersProvider>
</QueryClientProvider>
}

export default Editor
