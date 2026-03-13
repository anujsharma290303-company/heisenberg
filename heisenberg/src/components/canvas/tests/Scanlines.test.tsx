import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Scanlines } from '../Scanlines';

describe('Scanlines', () => {
  it('renders a div element', () => {
    const { container } = render(<Scanlines />);
    expect(container.querySelector('div')).not.toBeNull();
  });

  it('has fixed positioning', () => {
    const { container } = render(<Scanlines />);
    const overlay = container.querySelector('div');

    expect(overlay).not.toBeNull();
    expect(overlay).toHaveStyle({ position: 'fixed' });
  });

  it('has pointer-events none so it does not block clicks', () => {
    const { container } = render(<Scanlines />);
    const overlay = container.querySelector('div');

    expect(overlay).not.toBeNull();
    expect(overlay).toHaveStyle({ pointerEvents: 'none' });
  });
});
