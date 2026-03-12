import React, { useState, useEffect, useCallback, useMemo } from 'react';
import VirtualizedTable from '../components/VirtualizedTable';

const List = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateStats = () => {
    console.log('Running expensive stats calculation...');
    let total = 0;
    for (let i = 0; i < 1000000; i++) {
      total += Math.sqrt(i);
    }
    return total;
  };

  const stats = calculateStats();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('https://backend.jotish.in/backend_dev/gettabledata.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'test',
          password: '123456',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();
      setData(Array.isArray(result) ? result : (result.data || []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Active Employees</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            A comprehensive list of all employees in the system with virtualization for high performance.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400 text-center">
          Error: {error}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg flex justify-between items-center">
            <span className="text-indigo-700 dark:text-indigo-300 font-medium"> Total Records: {data.length} </span>
            <span className="text-xs text-indigo-500 dark:text-indigo-400"> (System Stats ready) </span>
          </div>
          <VirtualizedTable data={data} />
        </div>
      )}
    </div>
  );
};

export default List;
