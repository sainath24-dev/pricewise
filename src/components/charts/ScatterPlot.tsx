/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TestPrediction } from '../../types';

interface ScatterPlotProps {
  predictions: TestPrediction[];
  title?: string;
  formatCurrency: (val: number) => string;
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({
  predictions,
  title = 'Actual vs. Predicted Selling Price (Test Set)',
  formatCurrency,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TestPrediction | null>(null);

  if (!predictions || predictions.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[12px] border border-[#dedee5] bg-white text-xs text-[#686b82]">
        No test predictions available to display.
      </div>
    );
  }

  const allValues = predictions.flatMap((p) => [p.actual, p.predicted]);
  const minVal = Math.min(...allValues) * 0.9;
  const maxVal = Math.max(...allValues) * 1.05;
  const range = maxVal - minVal || 1;

  const width = 600;
  const height = 360;
  const padding = { top: 20, right: 30, bottom: 45, left: 65 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const getX = (val: number) => padding.left + ((val - minVal) / range) * plotWidth;
  const getY = (val: number) => padding.top + plotHeight - ((val - minVal) / range) * plotHeight;

  const ticks = Array.from({ length: 5 }, (_, i) => minVal + (i / 4) * range);

  return (
    <div className="kraken-card p-5 relative">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-[#101114]">{title}</h4>
          <p className="text-xs text-[#686b82]">Points closer to the diagonal line denote higher prediction accuracy</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#7132f5]"></span>
            <span className="text-[#686b82]">Predictions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 bg-[#9497a9] border-dashed"></span>
            <span className="text-[#686b82]">Ideal y = x</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full select-none"
          style={{ minWidth: '460px' }}
        >
          {/* Grid lines and Y-Ticks */}
          {ticks.map((tick, i) => {
            const y = getY(tick);
            return (
              <g key={`y-${i}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#dedee5"
                  strokeWidth="0.8"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-[#686b82] text-[10px] font-mono"
                >
                  {formatCurrency(tick)}
                </text>
              </g>
            );
          })}

          {/* Grid lines and X-Ticks */}
          {ticks.map((tick, i) => {
            const x = getX(tick);
            return (
              <g key={`x-${i}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke="#dedee5"
                  strokeWidth="0.8"
                />
                <text
                  x={x}
                  y={height - padding.bottom + 16}
                  textAnchor="middle"
                  className="fill-[#686b82] text-[10px] font-mono"
                >
                  {formatCurrency(tick)}
                </text>
              </g>
            );
          })}

          {/* 45-degree Reference Line (y = x) */}
          <line
            x1={getX(minVal)}
            y1={getY(minVal)}
            x2={getX(maxVal)}
            y2={getY(maxVal)}
            stroke="#9497a9"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Scatter Points */}
          {predictions.map((p, idx) => {
            const cx = getX(p.actual);
            const cy = getY(p.predicted);
            const isHovered = hoveredPoint === p;

            return (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                className={`cursor-pointer transition-all ${
                  isHovered
                    ? 'fill-[#5b1ecf] stroke-white stroke-2'
                    : 'fill-[#7132f5] hover:fill-[#5741d8]'
                }`}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* Axis Labels */}
          <text
            x={padding.left + plotWidth / 2}
            y={height - 8}
            textAnchor="middle"
            className="fill-[#101114] text-xs font-semibold"
          >
            Actual Target Price
          </text>
          <text
            x={-height / 2}
            y={18}
            transform="rotate(-90)"
            textAnchor="middle"
            className="fill-[#101114] text-xs font-semibold"
          >
            Predicted Model Price
          </text>
        </svg>
      </div>

      {/* Tooltip Overlay */}
      {hoveredPoint && (
        <div className="pointer-events-none absolute right-6 top-16 z-20 rounded-[10px] border border-[#dedee5] bg-[#101114] p-3 text-white shadow-xl">
          <p className="text-xs font-bold text-white">
            {hoveredPoint.product_name || 'Evaluation Item'}
          </p>
          <div className="mt-1 space-y-0.5 font-mono text-[11px]">
            <p>
              <span className="text-[#9497a9]">Actual:</span> {formatCurrency(hoveredPoint.actual)}
            </p>
            <p>
              <span className="text-[#9497a9]">Predicted:</span> {formatCurrency(hoveredPoint.predicted)}
            </p>
            <p>
              <span className="text-[#9497a9]">Residual:</span>{' '}
              <span className={hoveredPoint.residual >= 0 ? 'text-[#149e61]' : 'text-rose-400'}>
                {hoveredPoint.residual > 0 ? '+' : ''}
                {formatCurrency(hoveredPoint.residual)}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
