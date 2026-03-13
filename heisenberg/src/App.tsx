import { useState } from 'react'

import { FilmGrain } from './components/canvas/FilmGrain'
import { DesertCanvas } from './components/canvas/DesertCanvas'
import { GlitchText } from './components/ui/GlitchText'
import { Typewriter } from './components/ui/Typewriter'
import { Scanlines } from './components/canvas/Scanlines'
import { useUIStore } from './stores/useUIStore'

function App() {
  const [heroTyped, setHeroTyped] = useState(false)
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
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <h1
              style={{
                position: 'relative',
                zIndex: 1,
                color: 'var(--color-paper)',
                fontSize: 'var(--text-display)',
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: 'var(--tracking-display)',
              }}
            >
              <GlitchText always={true}>HEISENBERG</GlitchText>
            </h1>
            <div
              style={{
                fontFamily: "'IBM Plex Serif', serif",
                color: 'var(--color-ghost)',
                fontSize: 'var(--text-body)',
                marginTop: 'var(--space-4)',
                opacity: heroTyped ? 1 : 0.98,
              }}
            >
              <Typewriter
                text="I am the one who knocks."
                onComplete={() => setHeroTyped(true)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
