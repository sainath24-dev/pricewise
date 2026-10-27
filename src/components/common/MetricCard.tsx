/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    type: 'positive' | 'negative' | 'neutral' | 'accent';
  };
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  highlight = false,
}) => {
  const badgeStyles = {
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    negative: 'bg-rose-50 text-rose-700 border-rose-200/60',
    neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    accent: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  };

  return (
    <div
      className={`rounded-xl border p-4 shadow-xs transition-all ${
        highlight
          ? 'border-emerald-600/30 bg-emerald-50/20'
          : 'border-neutral-200/80 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-neutral-500">{title}</span>
        {Icon && (
          <div className="rounded-lg bg-neutral-100 p-1.5 text-neutral-600">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-2xl font-semibold tracking-tight text-neutral-900">
          {value}
        </span>
        {badge && (
          <span
            className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium ${badgeStyles[badge.type]}`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>}
    </div>
  );
};
