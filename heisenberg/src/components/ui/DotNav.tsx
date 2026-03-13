import { useUIStore } from '../../stores/useUIStore';
import styles from './DotNav.module.css';

export interface DotNavProps {
  readonly _?: never;
}

const sectionIds = ['section-01', 'section-02', 'section-03', 'section-04'] as const;

export function DotNav(props: DotNavProps) {
  void props;
  const activeSection = useUIStore((state) => state.activeSection);

  const handleClick = (index: number) => {
    const sectionId = sectionIds[index];
    if (!sectionId) {
      return;
    }

    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`${styles.root} root`} aria-label="Section navigation">
      {sectionIds.map((_, index) => {
        const isActive = activeSection === index;

        return (
          <button
            key={index}
            type="button"
            aria-label={`Go to section ${index + 1}`}
            className={`${styles.dot} ${isActive ? styles.active : styles.inactive} ${isActive ? 'active' : 'inactive'}`}
            onClick={() => {
              handleClick(index);
            }}
          />
        );
      })}
    </nav>
  );
}