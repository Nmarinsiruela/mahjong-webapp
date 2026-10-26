import { useLayoutEffect, useState } from 'react';

/** The content size of `ref`'s element as { width, height }, or null before it's measured. */
export function useElementSize(ref) {
  const [size, setSize] = useState(null);
  useLayoutEffect(() => {
    // ResizeObserver reports the initial size before the first paint
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}
