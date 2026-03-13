import { FilmGrain } from './components/canvas/FilmGrain'
import { DesertCanvas } from './components/canvas/DesertCanvas'
import { GlitchText } from './components/ui/GlitchText.tsx'
import { Scanlines } from './components/canvas/Scanlines'
import { useUIStore } from './stores/useUIStore'

function App() {
  const grainIntensity = useUIStore((state) => state.grainIntensity)

  return (
    <>
      <FilmGrain intensity={grainIntensity} />
      <Scanlines />
      <div className="scroll-container">
        <div
          id="section-01"
          className="section"
          style={{
            position: 'relative',
            minHeight: '100svh',
            background: 'var(--color-void)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <DesertCanvas />
          <h1
            style={{
              position: 'relative',
              zIndex: 1,
              color: 'var(--color-paper)',
              fontSize: 'var(--text-display)',
              fontFamily: "'Bebas Neue', sans-serif",
            }}
          >
            <GlitchText>HEISENBERG</GlitchText>
          </h1>
        </div>
      </div>
    </>
  )
}

export default App
