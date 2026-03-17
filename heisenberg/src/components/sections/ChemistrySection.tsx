import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MoleculeCanvas } from '../canvas/MoleculeCanvas';
import { useTypedData } from '../../hooks/useTypedData';
import { useChemStore } from '../../stores/useChemStore';
import { useUIStore } from '../../stores/useUIStore';
import { hexToRgba } from '../../utils/color';
import type { Element, Molecule } from '../../types/chemistry';
import styles from './ChemistrySection.module.css';

export interface ChemistrySectionProps {
  className?: string;
}

export function ChemistrySection({ className }: ChemistrySectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const setSection = useUIStore((state) => state.setSection);
  const activeElement = useChemStore((state) => state.activeElement);
  const activeMolecule = useChemStore((state) => state.activeMolecule);
  const selectElement = useChemStore((state) => state.selectElement);
  const clearElement = useChemStore((state) => state.clearElement);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
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

  const elementsLoader = useCallback(async () => {
    const module = await import('../../data/elements.json');
    return module.default as Element[];
  }, []);
  const elementsState = useTypedData<Element[]>(elementsLoader);

  const moleculesLoader = useCallback(async () => {
    const module = await import('../../data/molecules.json');
    return module.default as Molecule[];
  }, []);
  const moleculesState = useTypedData<Molecule[]>(moleculesLoader);

  const molecules = moleculesState.status === 'success' ? moleculesState.data : [];
  const elements = elementsState.status === 'success' ? elementsState.data : [];

  const activeElementData = useMemo(() => {
    if (activeElement === null || elementsState.status !== 'success') {
      return null;
    }

    return elementsState.data.find((element) => element.symbol === activeElement) ?? null;
  }, [activeElement, elementsState]);

  const fallbackMolecule = useMemo(() => {
    if (moleculesState.status !== 'success') {
      return null;
    }

    return moleculesState.data.find((molecule) => molecule.name === 'Methamphetamine') ?? null;
  }, [moleculesState]);

  const resolvedMolecule = activeMolecule ?? fallbackMolecule;

  const isLoading =
    elementsState.status === 'idle' ||
    elementsState.status === 'loading' ||
    moleculesState.status === 'idle' ||
    moleculesState.status === 'loading';

  const elementError = elementsState.status === 'error' ? elementsState.error.message : null;
  const moleculeError = moleculesState.status === 'error' ? moleculesState.error.message : null;
  const errorMessage = elementError ?? moleculeError;

  const handleTileClick = (symbol: string) => {
    if (activeElement === symbol) {
      clearElement();
      return;
    }

    if (molecules.length > 0) {
      selectElement(symbol, molecules);
    }
  };

  const rootClasses = [
    'section',
    styles.sectionRoot,
    revealed ? styles.revealed : '',
    revealed ? 'revealed' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section id="section-04" className={rootClasses} ref={sectionRef}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.kicker}>04 / THE SCIENCE</p>
        </header>

        {isLoading ? (
          <div className={`skeleton shimmer ${styles.shimmer}`} data-testid="chemistry-loading" />
        ) : null}

        {errorMessage ? (
          <div className={styles.errorWrap}>
            <p className={styles.errorText}>{errorMessage}</p>
            <button
              type="button"
              className={styles.retryBtn}
              onClick={() => {
                if (elementsState.status === 'error') {
                  elementsState.retry();
                }
                if (moleculesState.status === 'error') {
                  moleculesState.retry();
                }
              }}
            >
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !errorMessage ? (
          <div className={styles.layout}>
            <div className={styles.leftCol}>
              <div className={styles.tilesGrid}>
                {elements.map((element, index) => {
                  const isActive = activeElement === element.symbol;
                  const hasActive = activeElement !== null;
                  const tileClasses = [
                    styles.tile,
                    isActive ? styles.tileActive : '',
                    isActive ? 'active-tile' : '',
                    hasActive && !isActive ? styles.tileDimmed : '',
                    hasActive && !isActive ? 'dimmed-tile' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <button
                      key={element.symbol}
                      type="button"
                      data-testid={`element-tile-${element.symbol}`}
                      className={tileClasses}
                      aria-label={`Select element ${element.symbol}`}
                      style={{
                        animationDelay: `${index * 0.05}s`,
                        ...(isActive
                          ? {
                              background: hexToRgba(element.color, 0.1),
                              borderColor: element.color,
                              boxShadow: `0 0 20px ${hexToRgba(element.color, 0.44)}`,
                              transform: 'scale(1.1)',
                            }
                          : null),
                      }}
                      onClick={() => {
                        handleTileClick(element.symbol);
                      }}
                    >
                      <span className={styles.atomicNumber}>{element.num}</span>
                      <span className={styles.symbol}>{element.symbol}</span>
                      <span className={styles.elementName}>{element.name}</span>
                    </button>
                  );
                })}
              </div>

              {activeElementData ? (
                <div className={styles.connectionPanel} data-testid="connection-panel">
                  <p className={styles.connectionNote}>{activeElementData.note}</p>
                </div>
              ) : null}
            </div>

            <div className={styles.rightCol}>
              {resolvedMolecule ? <MoleculeCanvas molecule={resolvedMolecule} /> : null}
              <p className={styles.rotateHint}>DRAG TO ROTATE</p>
              {resolvedMolecule ? (
                <div className={styles.moleculeMeta}>
                  <p className={styles.formula}>{resolvedMolecule.formula}</p>
                  <p className={styles.moleculeName}>{resolvedMolecule.name}</p>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
