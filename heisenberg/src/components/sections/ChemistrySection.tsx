import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MoleculeCanvas } from '../canvas/MoleculeCanvas';
import { useTypedData } from '../../hooks/useTypedData';
import { useChemStore } from '../../stores/useChemStore';
import { useUIStore } from '../../stores/useUIStore';
import type { Molecule } from '../../types/chemistry';
import styles from './ChemistrySection.module.css';

export interface ChemistrySectionProps {
  className?: string;
}

export function ChemistrySection({ className }: ChemistrySectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const setSection = useUIStore((state) => state.setSection);
  const activeMolecule = useChemStore((state) => state.activeMolecule);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          sectionRef.current?.classList.add('revealed');
          setRevealed(true);
          setSection(3);
        }
      },
      { threshold: 0.45 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [setSection]);

  const moleculesLoader = useCallback(async () => {
    const module = await import('../../data/molecules.json');
    return module.default as Molecule[];
  }, []);
  const moleculesState = useTypedData<Molecule[]>(moleculesLoader);

  const fallbackMolecule = useMemo(() => {
    if (moleculesState.status !== 'success') {
      return null;
    }

    return moleculesState.data.find((molecule) => molecule.name === 'Methamphetamine') ?? null;
  }, [moleculesState]);

  const resolvedMolecule = activeMolecule ?? fallbackMolecule;

  const rootClasses = ['section', styles.sectionRoot, revealed ? styles.revealed : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <section id="section-04" className={rootClasses} ref={sectionRef}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.kicker}>04 / CHEMISTRY EXPLORER</p>
          <h2 className={styles.title}>Reactive Molecule View</h2>
        </header>

        {moleculesState.status === 'loading' || moleculesState.status === 'idle' ? (
          <div className={`skeleton ${styles.shimmer}`} data-testid="chemistry-shimmer" />
        ) : null}

        {moleculesState.status === 'error' ? (
          <div className={styles.errorWrap}>
            <p className={styles.errorText}>{moleculesState.error.message}</p>
            <button type="button" className={styles.retryBtn} onClick={moleculesState.retry}>
              Retry
            </button>
          </div>
        ) : null}

        {resolvedMolecule ? <MoleculeCanvas molecule={resolvedMolecule} /> : null}
      </div>
    </section>
  );
}
