/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';

interface DistributionPlotProps {
  values: number[];
  title: string;
  unitPrefix?: string;
  binsCount?: number;
}

export const DistributionPlot: React.FC<DistributionPlotProps> = ({
  values,
  title,
  unitPrefix = '₹',
  binsCount = 10,
}) => {
  const stats = useMemo(() => {
    if (values.length === 0) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const mean = sum / sorted.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    const variance = sorted.reduce((acc, v) => acc + (v - mean) * (v - mean), 0) / sorted.length;
    const std = Math.sqrt(variance);

    const range = Math.max(1, max - min);
    const step = range / binsCount;

    const bins = Array.from({ length: binsCount }, (_, i) => {
      const start = min + i * step;
      const end = start + step;
      return {
        start,
        end,
        label: `${Math.round(start)} - ${Math.round(end)}`,
        count: 0,
      };
    });

    sorted.forEach((v) => {
      let idx = Math.floor((v - min) / step);
      if (idx >= binsCount) idx = binsCount - 1;
      if (idx < 0) idx = 0;
      bins[idx].count++;
    });

    const maxCount = Math.max(...bins.map((b) => b.count), 1);

    return {
      mean: Math.round(mean),
      median: Math.round(median),
      std: Math.round(std),
      min: Math.round(min),
      max: Math.round(max),
      bins,
      maxCount,
    };
  }, [values, binsCount]);

  if (!stats) return null;

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-neutral-900">{title}</h4>
          <p className="text-xs text-neutral-500">Distribution across {values.length} historical records</p>
        </div>
        <div className="flex gap-4 font-mono text-xs text-neutral-600">
          <div>
            <span className="text-neutral-400">Mean:</span> {unitPrefix}{stats.mean.toLocaleString()}
          </div>
          <div>
            <span className="text-neutral-400">Med:</span> {unitPrefix}{stats.median.toLocaleString()}
          </div>
          <div>
            <span className="text-neutral-400">Std:</span> {unitPrefix}{stats.std.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid h-40 grid-cols-10 items-end gap-1.5 border-b border-neutral-200 pb-2">
        {stats.bins.map((bin, i) => {
          const heightPercent = Math.max(4, (bin.count / stats.maxCount) * 100);
          return (
            <div key={i} className="group relative flex h-full flex-col justify-end items-center">
              <div className="pointer-events-none absolute -top-8 z-10 hidden whitespace-nowrap rounded bg-neutral-900 px-2 py-1 text-[10px] text-white group-hover:block">
                {bin.count} items ({bin.label})
              </div>
              <div
                style={{ height: `${heightPercent}%` }}
                className="w-full rounded-t bg-slate-600 transition-all group-hover:bg-emerald-600"
              />
              <span className="mt-1 text-[9px] font-mono text-neutral-400 truncate max-w-full">
                {Math.round(bin.start)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
        <span>Min: {unitPrefix}{stats.min.toLocaleString()}</span>
        <span>Max: {unitPrefix}{stats.max.toLocaleString()}</span>
      </div>
    </div>
  );
};
