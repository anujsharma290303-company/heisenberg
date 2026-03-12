export const debounce = <T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timer !== null) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      fn(...args);
    }, ms);
  };
};

export const throttle = <T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = -Infinity;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCall >= ms) {
      lastCall = now;
      fn(...args);
    }
  };
};
