import { FilmGrain } from "./components/canvas/FilmGrain";
import { DotNav } from "./components/ui/DotNav";
import { HeroSection } from "./components/sections/HeroSection";
import { TimelineSection } from "./components/sections/TimelineSection";
import { Scanlines } from "./components/canvas/Scanlines";
import { useUIStore } from "./stores/useUIStore";

function App() {
  const grainIntensity = useUIStore((state) => state.grainIntensity);

  return (
    <>
      <FilmGrain intensity={grainIntensity} />
      <Scanlines />
      <DotNav />

      <div className="scroll-container">
        <HeroSection />
        <TimelineSection />
      </div>
    </>
  );
}

export default App;
