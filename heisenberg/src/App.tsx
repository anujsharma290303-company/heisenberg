import { useMemo, useCallback, useEffect, useRef } from "react";
import { FilmGrain } from "./components/canvas/FilmGrain";
import { DotNav } from "./components/ui/DotNav";
import { HeroSection } from "./components/sections/HeroSection";
import { TimelineSection } from "./components/sections/TimelineSection";
import { QuotesSection } from "./components/sections/QuotesSection";
import { ChemistrySection } from "./components/sections/ChemistrySection";
import { QuoteReveal } from "./components/overlays/QuoteReveal";
import { Scanlines } from "./components/canvas/Scanlines";
import { Letterbox } from "./components/ui/Letterbox";
import { useExplorerStore } from "./stores/useExplorerStore";
import { useUIStore } from "./stores/useUIStore";
import { useTypedData } from "./hooks/useTypedData";
import { useURLSync } from "./hooks/useURLSync";
import type { Character } from "./types/character";

const sectionIds = ["section-01", "section-02", "section-03", "section-04"] as const;
const AUTO_SCROLL_DELAY_MS = 4600;
const USER_PAUSE_MS = 8000;
const AUTO_SCROLL_CHECK_MS = 350;

function App() {
  useURLSync();

  const grainIntensity = useUIStore((state) => state.grainIntensity);
  const activeSection = useUIStore((state) => state.activeSection);
  const activeQuote = useExplorerStore((state) => state.activeQuote);
  const lastInteractionAtRef = useRef<number>(Date.now() - USER_PAUSE_MS);
  const sectionEnteredAtRef = useRef<number>(Date.now());

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

  useEffect(() => {
    const markInteraction = () => {
      lastInteractionAtRef.current = Date.now();
    };

    window.addEventListener("wheel", markInteraction, { passive: true });
    window.addEventListener("touchstart", markInteraction, { passive: true });
    window.addEventListener("keydown", markInteraction);

    return () => {
      window.removeEventListener("wheel", markInteraction);
      window.removeEventListener("touchstart", markInteraction);
      window.removeEventListener("keydown", markInteraction);
    };
  }, []);

  useEffect(() => {
    sectionEnteredAtRef.current = Date.now();
  }, [activeSection]);

  useEffect(() => {
    if (activeQuote) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const interactionElapsed = now - lastInteractionAtRef.current;
      const sectionElapsed = now - sectionEnteredAtRef.current;

      if (interactionElapsed < USER_PAUSE_MS || sectionElapsed < AUTO_SCROLL_DELAY_MS) {
        return;
      }

      const nextIndex = (activeSection + 1) % sectionIds.length;
      const targetId = sectionIds[nextIndex];
      const target = document.getElementById(targetId);

      if (target) {
        sectionEnteredAtRef.current = Date.now();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, AUTO_SCROLL_CHECK_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeQuote, activeSection]);

  return (
    <>
      <FilmGrain intensity={grainIntensity} />
      <Scanlines />
      <Letterbox />
      <DotNav />

      <div className="scroll-container">
        <HeroSection />
        <TimelineSection />
        <QuotesSection />
        <ChemistrySection />
      </div>

      <QuoteReveal character={resolvedCharacter} />
    </>
  );
}

export default App;
