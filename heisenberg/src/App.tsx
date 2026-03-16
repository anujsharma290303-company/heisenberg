import { useMemo, useCallback } from "react";
import { FilmGrain } from "./components/canvas/FilmGrain";
import { DotNav } from "./components/ui/DotNav";
import { HeroSection } from "./components/sections/HeroSection";
import { TimelineSection } from "./components/sections/TimelineSection";
import { QuotesSection } from "./components/sections/QuotesSection";
import { QuoteReveal } from "./components/overlays/QuoteReveal";
import { Scanlines } from "./components/canvas/Scanlines";
import { useExplorerStore } from "./stores/useExplorerStore";
import { useUIStore } from "./stores/useUIStore";
import { useTypedData } from "./hooks/useTypedData";
import type { Character } from "./types/character";

function App() {
  const grainIntensity = useUIStore((state) => state.grainIntensity);
  const activeQuote = useExplorerStore((state) => state.activeQuote);

  const charactersLoader = useCallback(async () => {
    const module = await import("./data/characters.json");
    return module.default as Character[];
  }, []);
  const charactersState = useTypedData<Character[]>(charactersLoader);

  const resolvedCharacter = useMemo(() => {
    if (!activeQuote) return null;
    if (charactersState.status !== "success") return null;
    return charactersState.data.find((c) => c.id === activeQuote.characterId) ?? null;
  }, [activeQuote, charactersState]);

  return (
    <>
      <FilmGrain intensity={grainIntensity} />
      <Scanlines />
      <DotNav />

      <div className="scroll-container">
        <HeroSection />
        <TimelineSection />
        <QuotesSection />
      </div>

      <QuoteReveal character={resolvedCharacter} />
    </>
  );
}

export default App;
