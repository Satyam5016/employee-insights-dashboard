import { useState, useEffect, useCallback, useRef } from 'react';

export const useVirtualScroll = ({ itemCount, rowHeight, containerHeight, buffer = 5 }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const onScroll = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
  const visibleRows = Math.ceil(containerHeight / rowHeight);
  const endIndex = Math.min(itemCount - 1, startIndex + visibleRows + 2 * buffer);

  const totalHeight = itemCount * rowHeight;

  const offset = startIndex * rowHeight;

  return {
    startIndex,
    endIndex,
    totalHeight,
    offset,
    onScroll,
    containerRef,
  };
};
