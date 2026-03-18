export interface LetterboxProps {
  className?: string;
}

export function Letterbox({ className }: LetterboxProps) {
  return (
    <>
      <div
        aria-hidden="true"
        className={className}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: '#000000',
          zIndex: 9996,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        className={className}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: '#000000',
          zIndex: 9996,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
