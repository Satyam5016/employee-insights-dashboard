import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Analytics = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { auditImage, employeeId } = location.state || {};
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the city and salary data again (or pass it through context in a real app)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://backend.jotish.in/backend_dev/gettabledata.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: user?.username || 'testuser',
            password: 'Test123'
          })
        });
        
        const result = await response.json();
        if (result?.TABLE_DATA?.data) {
          setData(result.TABLE_DATA.data);
        }
      } catch (err) {
        console.error("Failed to fetch data for analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.username]);

  // Transform data for City Salary Chart
  // Index 2 is City, Index 5 is Salary (string e.g. "$320,800")
  const cityStats = useMemo(() => {
    if (!data.length) return [];
    
    const statsMap = {};
    
    data.forEach(item => {
      const city = item[2];
      const salaryStr = item[5];
      // Convert "$320,800" to 320800
      const salaryNum = parseInt(salaryStr.replace(/[^0-9]/g, ''), 10);
      
      if (!statsMap[city]) {
        statsMap[city] = { totalSalary: 0, count: 0 };
      }
      statsMap[city].totalSalary += salaryNum;
      statsMap[city].count += 1;
    });

    const parsedStats = Object.keys(statsMap).map(city => ({
      city,
      avgSalary: Math.round(statsMap[city].totalSalary / statsMap[city].count)
    }));

    // Sort by salary
    return parsedStats.sort((a, b) => b.avgSalary - a.avgSalary);
  }, [data]);

  // Custom SVG Bar Chart Configuration
  const chartHeight = 300;
  const chartWidth = 600;
  const chartPadding = 40;
  
  const maxSalary = Math.max(...cityStats.map(c => c.avgSalary), 1);
  const barWidth = cityStats.length > 0 ? (chartWidth - chartPadding * 2) / cityStats.length - 20 : 0;

  // City coordinate mapping for Geospatial SVG Map (using relative SVG percentages approximation)
  const cityCoordinates = {
    "Edinburgh": { cx: "45%", cy: "30%" },
    "Tokyo": { cx: "85%", cy: "45%" },
    "San Francisco": { cx: "15%", cy: "45%" },
    "New York": { cx: "25%", cy: "40%" },
    "London": { cx: "48%", cy: "32%" },
    "Sidney": { cx: "90%", cy: "80%" },
    "Singapore": { cx: "75%", cy: "60%" }
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-neutral-400 text-sm mt-1">Global Insights & Identity Verification</p>
        </div>
        <button
          onClick={() => navigate('/list')}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-sm transition-colors"
        >
          Back to Roster
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Audit Image Panel */}
        <div className="col-span-1 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col items-center shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4 w-full text-left">Identity Audit</h2>
          
          {auditImage ? (
            <div className="w-full">
              <div className="bg-black rounded-lg overflow-hidden border-2 border-neutral-800 mb-4">
                <img src={auditImage} alt="Verification Audit" className="w-full h-auto object-contain" />
              </div>
              <div className="text-sm text-neutral-400 p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                <p><span className="text-neutral-500">Employee ID:</span> {employeeId}</p>
                <p><span className="text-neutral-500">Timestamp:</span> {new Date().toLocaleString()}</p>
                <p><span className="text-neutral-500">Status:</span> <span className="text-emerald-500">Verified Signature</span></p>
              </div>
            </div>
          ) : (
             <div className="h-64 w-full flex items-center justify-center bg-neutral-950 border border-neutral-800 rounded-lg border-dashed">
                <p className="text-neutral-500 text-sm">No audit image captured</p>
             </div>
          )}
        </div>

        <div className="col-span-1 lg:col-span-2 space-y-6">
          
          {/* Custom SVG Salary Chart */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-lg overflow-x-auto">
             <h2 className="text-xl font-semibold text-white mb-6">Average Salary by Region</h2>
             
             {loading ? (
                <div className="h-[300px] flex items-center justify-center text-neutral-500">Loading data...</div>
             ) : (
                <div className="flex justify-center w-full min-w-[600px]">
                  <svg width={chartWidth} height={chartHeight} className="overflow-visible">
                    {/* Y-Axis Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                      const y = chartHeight - chartPadding - (chartHeight - chartPadding * 2) * ratio;
                      const val = Math.round(maxSalary * ratio);
                      return (
                        <g key={`grid-${i}`}>
                          <line x1={chartPadding} y1={y} x2={chartWidth - chartPadding} y2={y} stroke="#333" strokeDasharray="4 4" />
                          <text x={chartPadding - 10} y={y + 4} fill="#666" fontSize="10" textAnchor="end">
                            ${(val / 1000).toFixed(0)}k
                          </text>
                        </g>
                      );
                    })}

                    {/* Bars */}
                    {cityStats.map((stat, i) => {
                      const barHeight = ((stat.avgSalary / maxSalary) * (chartHeight - chartPadding * 2));
                      const x = chartPadding + 20 + i * (barWidth + 20);
                      const y = chartHeight - chartPadding - barHeight;

                      return (
                        <g key={stat.city} className="group">
                          {/* Invisible hover area to catch mouse events easier */}
                          <rect x={x} y={chartPadding} width={barWidth} height={chartHeight - chartPadding * 2} fill="transparent" />
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            className="fill-blue-600 transition-all duration-300 group-hover:fill-blue-400 group-hover:-translate-y-1"
                            rx="4"
                            ry="4"
                          />
                          <text
                            x={x + barWidth / 2}
                            y={chartHeight - chartPadding + 20}
                            fill="#999"
                            fontSize="11"
                            textAnchor="middle"
                            // Rotate text if needed, but keeping horizontal for simplicity here
                          >
                            {stat.city}
                          </text>
                          {/* Tooltip emulation using SVG group-hover opacity toggle (requires external CSS or inline magic, simplifying to text tag visibility below) */}
                          <text
                            x={x + barWidth / 2}
                            y={y - 10}
                            fill="#fff"
                            fontSize="10"
                            textAnchor="middle"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ${stat.avgSalary.toLocaleString()}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
             )}
          </div>

          {/* Geospatial Map */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-lg">
             <h2 className="text-xl font-semibold text-white mb-6">Global Office Distribution</h2>
             <div className="relative w-full aspect-[2/1] bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800 flex items-center justify-center">
                {/* Simplified World Map SVG background outline */}
                <svg viewBox="0 0 1000 500" className="w-full h-full opacity-20 pointer-events-none absolute inset-0">
                  <path fill="#444" d="M120,80 Q200,60 280,100 T440,80 T600,120 T760,100 T920,150 L920,400 Q760,450 600,420 T280,480 T120,400 Z" />
                  <path fill="#444" d="M30,200 Q80,180 150,250 T250,350 L100,450 Z" />
                </svg>
                
                <svg className="w-full h-full absolute inset-0 overflow-visible">
                  {Object.entries(cityCoordinates).map(([city, coords]) => {
                     // Get count of employees in this city to scale dot size
                     const cityData = cityStats.find(c => c.city === city);
                     const employeeCount = cityData ? cityData.count : 1;
                     const radius = Math.min(15, Math.max(4, employeeCount * 1.5)); // Dynamic size based on employees

                     return (
                        <g key={city} className="group relative">
                          <circle
                            cx={coords.cx}
                            cy={coords.cy}
                            r={radius}
                            className="fill-emerald-500/50 stroke-emerald-400 stroke-2 cursor-pointer hover:fill-emerald-400 transition-colors duration-300"
                          />
                          <circle
                            cx={coords.cx}
                            cy={coords.cy}
                            r={radius}
                            className="fill-none stroke-emerald-500 cursor-pointer animate-ping opacity-75"
                          />
                          <text
                            x={coords.cx}
                            y={coords.cy}
                            dy="-20"
                            fill="#fff"
                            fontSize="12"
                            textAnchor="middle"
                            className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none drop-shadow-md font-medium"
                          >
                            {city} ({employeeCount})
                          </text>
                        </g>
                     )
                  })}
                </svg>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Analytics;
