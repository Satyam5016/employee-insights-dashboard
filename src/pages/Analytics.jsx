import React, { useState, useEffect } from 'react';
import SalaryChart from '../components/SalaryChart';
import CityMap from '../components/CityMap';

const Analytics = () => {
  const [mergedImage, setMergedImage] = useState(null);

  useEffect(() => {
    const savedImage = localStorage.getItem('verification_image');
    if (savedImage) {
      setMergedImage(savedImage);
    }
  }, []);

  const analyticsData = [
    { city: 'Mumbai', salary: 85000 },
    { city: 'Delhi', salary: 72000 },
    { city: 'Bangalore', salary: 95000 },
    { city: 'Chennai', salary: 68000 },
  ];

  const activeCities = analyticsData.map(d => d.city);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">System Analytics</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Real-time insights and verification data from across the organization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center space-y-4">
          <div className="w-full text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Identity Pass</h3>
            <p className="text-sm text-gray-500 mb-4 font-mono uppercase tracking-widest">Verified Digital ID</p>
          </div>
          
          <div className="relative w-full aspect-[4/3] bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border-2 border-indigo-100 dark:border-indigo-900 shadow-inner group">
            {mergedImage ? (
              <img 
                src={mergedImage} 
                alt="Verified Identity" 
                className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0" 
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <div className="mb-4 text-4xl">🪪</div>
                <p className="text-sm font-medium">No verified identity found.</p>
                <p className="text-xs mt-1">Visit an employee's details page to complete verification.</p>
              </div>
            )}
            {mergedImage && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg animate-pulse">
                Authenticated
              </div>
            )}
          </div>
          
          <div className="w-full pt-4 border-t border-gray-50 dark:border-gray-700 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Issue Date</p>
              <p className="text-xs font-semibold dark:text-gray-300">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Trust Score</p>
              <p className="text-xs font-semibold text-green-500">98.4%</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Protocol</p>
              <p className="text-xs font-semibold dark:text-gray-300">VITE-AI-01</p>
            </div>
          </div>
        </div>

        <SalaryChart data={analyticsData} />
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Active Operational Hubs</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Regional distribution of employees across major cities.</p>
          </div>
          <CityMap cities={activeCities} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
