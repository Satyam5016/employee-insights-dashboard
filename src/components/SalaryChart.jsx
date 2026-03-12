import React from 'react';

const SalaryChart = ({ data }) => {
  const chartData = data || [
    { city: 'Mumbai', salary: 85000 },
    { city: 'Delhi', salary: 72000 },
    { city: 'Bangalore', salary: 95000 },
    { city: 'Chennai', salary: 68000 },
  ];

  const maxSalary = Math.max(...chartData.map(d => d.salary));
  const height = 300;
  const width = 500;
  const barWidth = 60;
  const gap = 40;
  const paddingBottom = 40;
  const paddingTop = 20;

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Salary Distribution per City</h3>
      <div className="flex justify-center">
        <svg width={width} height={height} className="overflow-visible">
          {chartData.map((item, index) => {
            const barHeight = (item.salary / maxSalary) * (height - paddingBottom - paddingTop);
            const x = index * (barWidth + gap) + gap;
            const y = height - paddingBottom - barHeight;

            return (
              <g key={item.city} className="transition-all duration-500 ease-out">
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#barGradient)"
                  rx="8"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <title>{`${item.city}: $${item.salary.toLocaleString()}`}</title>
                </rect>
                
                <text
                  x={x + barWidth / 2}
                  y={y - 10}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-gray-600 dark:fill-gray-400"
                >
                  ${(item.salary / 1000).toFixed(1)}k
                </text>

                <text
                  x={x + barWidth / 2}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-500 dark:fill-gray-400"
                >
                  {item.city}
                </text>
              </g>
            );
          })}

          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default SalaryChart;
