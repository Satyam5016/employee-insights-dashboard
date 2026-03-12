import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

const Row = React.memo(({ item, index, style, onClick }) => {
  return (
    <div
      style={style}
      onClick={() => onClick(item)}
      className={`absolute w-full flex items-center px-6 border-b border-neutral-700/50 hover:bg-neutral-700/50 cursor-pointer transition-colors ${
        index % 2 === 0 ? 'bg-neutral-900/40' : 'bg-neutral-800/30'
      }`}
    >
      <div className="flex-1 min-w-[150px] font-medium text-white truncate pr-4">{item[0]}</div>
      <div className="flex-1 min-w-[200px] text-neutral-300 truncate pr-4">{item[1]}</div>
      <div className="flex-[0.8] min-w-[150px] text-neutral-400 truncate pr-4">{item[2]}</div>
      <div className="flex-[0.5] min-w-[100px] text-neutral-500 truncate pr-4">{item[3]}</div>
      <div className="flex-[0.6] min-w-[120px] text-neutral-400 truncate pr-4">{item[4]}</div>
      <div className="flex-[0.6] min-w-[120px] font-medium text-emerald-400 text-right">{item[5]}</div>
    </div>
  );
});

const VirtualizedList = ({ data, onRowClick }) => {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const rowHeight = 60; 
  const buffer = 5;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { visibleStartIndex, visibleEndIndex } = useMemo(() => {
    // If container height isn't set yet, render first 20 items just in case
    if (containerHeight === 0) return { visibleStartIndex: 0, visibleEndIndex: 20 };

    const start = Math.floor(scrollTop / rowHeight);
    const visibleRowCount = Math.ceil(containerHeight / rowHeight);
    
    const startIndex = Math.max(0, start - buffer);
    const endIndex = Math.min(data.length - 1, start + visibleRowCount + buffer);
    
    return { visibleStartIndex: startIndex, visibleEndIndex: endIndex };
  }, [scrollTop, containerHeight, data.length, rowHeight, buffer]);

  const totalHeight = data.length * rowHeight;

  const visibleRows = [];
  for (let i = visibleStartIndex; i <= visibleEndIndex; i++) {
    const item = data[i];
    if (item) {
      visibleRows.push(
        <Row
          key={i}
          item={item}
          index={i}
          onClick={onRowClick}
          style={{
            height: `${rowHeight}px`,
            top: `${i * rowHeight}px`
          }}
        />
      );
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 border border-neutral-700/50 rounded-xl overflow-hidden shadow-xl" ref={containerRef}>
      <div className="flex items-center px-6 h-[50px] bg-neutral-800/80 backdrop-blur z-10 border-b border-neutral-700 top-0 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
        <div className="flex-1 min-w-[150px] pr-4">Name</div>
        <div className="flex-1 min-w-[200px] pr-4">Position</div>
        <div className="flex-[0.8] min-w-[150px] pr-4">Office</div>
        <div className="flex-[0.5] min-w-[100px] pr-4">Ext.</div>
        <div className="flex-[0.6] min-w-[120px] pr-4">Start date</div>
        <div className="flex-[0.6] min-w-[120px] text-right">Salary</div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scroll-smooth no-scrollbar"
        style={{ position: 'relative' }}
      >
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          {visibleRows}
        </div>
      </div>
    </div>
  );
};

export default VirtualizedList;
