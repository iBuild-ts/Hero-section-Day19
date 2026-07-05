import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface OxidizationChartProps {
  accentColor: string;
}

export default function OxidizationChart({ accentColor }: OxidizationChartProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // 30 days data points
  // Brim preservation: stays high (around 98% to 92%)
  // Standard storage: drops rapidly (100% to 30% by day 15)
  const days = [1, 5, 10, 15, 20, 25, 30];
  const brimData = [100, 99, 97, 96, 94, 93, 91];
  const standardData = [100, 82, 60, 42, 28, 15, 8];

  const chartWidth = 500;
  const chartHeight = 220;
  const padding = 35;

  const getCoordinates = (dayIndex: number, value: number) => {
    const x = padding + (dayIndex / (days.length - 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - (value / 100) * (chartHeight - padding * 2);
    return { x, y };
  };

  // Generate SVG path for Brim
  const brimPoints = days.map((_, i) => getCoordinates(i, brimData[i]));
  const brimPath = `M ${brimPoints.map((p) => `${p.x},${p.y}`).join(" L ")}`;

  // Generate SVG path for Standard
  const standardPoints = days.map((_, i) => getCoordinates(i, standardData[i]));
  const standardPath = `M ${standardPoints.map((p) => `${p.x},${p.y}`).join(" L ")}`;

  return (
    <div className="relative w-full rounded-2xl border border-gray-200/10 dark:border-white/5 bg-white/5 dark:bg-black/40 p-6 backdrop-blur-md select-none transition-all duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h4 className="text-xs font-mono tracking-widest text-gray-400 uppercase">
            Flavor Preservation Analysis
          </h4>
          <h3 className="text-lg font-display font-medium text-gray-900 dark:text-white mt-1">
            Volatile Compound Retentivity
          </h3>
        </div>
        
        {/* Chart Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5" style={{ backgroundColor: accentColor }} />
            <span className="text-gray-900 dark:text-white font-medium">BRIM CANISTER</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-gray-400 dark:bg-gray-600" />
            <span className="text-gray-400">STANDARD BAG</span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full h-auto overflow-visible"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((level) => {
            const y = chartHeight - padding - (level / 100) * (chartHeight - padding * 2);
            return (
              <g key={level}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="rgba(128, 128, 128, 0.1)"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <text
                  x={padding - 8}
                  y={y + 3}
                  className="fill-gray-400 font-mono text-[8px]"
                  textAnchor="end"
                >
                  {level}%
                </text>
              </g>
            );
          })}

          {/* Time indicators X axis */}
          {days.map((day, i) => {
            const x = padding + (i / (days.length - 1)) * (chartWidth - padding * 2);
            return (
              <text
                key={day}
                x={x}
                y={chartHeight - padding + 16}
                className="fill-gray-400 font-mono text-[8px]"
                textAnchor="middle"
              >
                DAY {day}
              </text>
            );
          })}

          {/* Standard Degrade Area & Path */}
          <path
            d={`${standardPath} L ${standardPoints[standardPoints.length - 1].x},${chartHeight - padding} L ${standardPoints[0].x},${chartHeight - padding} Z`}
            fill="url(#standardGrad)"
            className="opacity-20"
          />
          <motion.path
            d={standardPath}
            fill="none"
            stroke="rgba(128, 128, 128, 0.4)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Brim Preservation Area & Path */}
          <path
            d={`${brimPath} L ${brimPoints[brimPoints.length - 1].x},${chartHeight - padding} L ${brimPoints[0].x},${chartHeight - padding} Z`}
            fill={`url(#brimGrad-${accentColor.replace('#','')})`}
            className="opacity-15"
          />
          <motion.path
            d={brimPath}
            fill="none"
            stroke={accentColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />

          {/* Render hover interactive indicators */}
          {days.map((_, i) => {
            const brimPt = brimPoints[i];
            const stdPt = standardPoints[i];
            const hoverTriggerX = brimPt.x;

            return (
              <g 
                key={i} 
                onMouseEnter={() => setHoveredDay(i)}
                onMouseLeave={() => setHoveredDay(null)}
                className="cursor-pointer"
              >
                {/* Invisible hover trigger columns */}
                <rect
                  x={hoverTriggerX - 15}
                  y={padding}
                  width="30"
                  height={chartHeight - padding * 2}
                  fill="transparent"
                />

                {hoveredDay === i && (
                  <g>
                    {/* Vertical line indicator */}
                    <line
                      x1={hoverTriggerX}
                      y1={padding}
                      x2={hoverTriggerX}
                      y2={chartHeight - padding}
                      stroke="rgba(128,128,128,0.2)"
                      strokeWidth="1.5"
                    />

                    {/* Standard storage dot */}
                    <circle
                      cx={stdPt.x}
                      cy={stdPt.y}
                      r="5"
                      fill="#777"
                      stroke="white"
                      strokeWidth="1.5"
                    />

                    {/* Brim storage dot */}
                    <circle
                      cx={brimPt.x}
                      cy={brimPt.y}
                      r="6"
                      fill={accentColor}
                      stroke="white"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </g>
            );
          })}

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="standardGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#888" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#888" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id={`brimGrad-${accentColor.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.5" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating details overlay based on interactive hover */}
        <AnimatePresence>
          {hoveredDay !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 left-1/2 -translate-x-1/2 p-3 bg-neutral-900 text-white rounded-lg border border-white/10 text-xs font-mono shadow-xl flex items-center gap-4 z-20 pointer-events-none"
            >
              <div>
                <span className="text-gray-400 block text-[9px]">TIMELINE</span>
                <span className="font-semibold text-white">Day {days[hoveredDay]}</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-gray-400 block text-[9px]">BRIM SEAL</span>
                <span className="font-semibold text-emerald-400">{brimData[hoveredDay]}% Flavor</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-gray-400 block text-[9px]">STD COFFEE BAG</span>
                <span className="font-semibold text-rose-400">{standardData[hoveredDay]}% Flavor</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-xs font-mono border-t border-gray-200/10 dark:border-white/5 pt-4">
        <div>
          <span className="text-gray-400 block">HALF-LIFE (50% DEGRADATION)</span>
          <span className="text-gray-900 dark:text-white font-medium mt-0.5 block">
            Standard: <span className="text-rose-500 font-semibold">13 Days</span>
          </span>
          <span className="text-gray-900 dark:text-white font-medium block">
            Brim Canister: <span className="text-emerald-500 font-semibold">&gt; 180 Days</span>
          </span>
        </div>
        <div>
          <span className="text-gray-400 block">KEY COMPOUNDS PRESERVED</span>
          <span className="text-gray-900 dark:text-white font-medium mt-0.5 block">
            Kahweol, Cafestol, & Volatile Esters
          </span>
        </div>
      </div>
    </div>
  );
}
