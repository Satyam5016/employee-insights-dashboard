import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVirtualScroll } from '../hooks/useVirtualScroll';

const VirtualizedTable = ({ data, rowHeight = 60 }) => {
  const navigate = useNavigate();
  const containerHeight = 600;
  
  const {
    startIndex,
    endIndex,
    totalHeight,
    offset,
    onScroll,
    containerRef
  } = useVirtualScroll({
    itemCount: data.length,
    rowHeight,
    containerHeight,
  });

  const visibleData = data.slice(startIndex, endIndex);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Designation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">City</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
        </table>
      </div>
      
      <div 
        ref={containerRef}
        onScroll={onScroll}
        style={{ height: containerHeight, overflowY: 'auto', position: 'relative' }}
        className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div 
            style={{ 
              transform: `translateY(${offset}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0
            }}
          >
            {visibleData.map((item, index) => (
              <div 
                key={item.id} 
                style={{ height: rowHeight }}
                className="flex items-center px-6 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="w-1/5 text-sm font-medium text-gray-900 dark:text-white">#{item.id}</div>
                <div className="w-1/5 text-sm text-gray-600 dark:text-gray-300">{item.name}</div>
                <div className="w-1/5 text-sm text-gray-600 dark:text-gray-300">{item.designation}</div>
                <div className="w-1/5 text-sm text-gray-600 dark:text-gray-300">{item.city}</div>
                <div className="w-1/5">
                  <button 
                    onClick={() => navigate(`/details/${item.id}`)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualizedTable;
