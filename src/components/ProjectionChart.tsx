'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { PuntoGrafica } from '@/lib/types';

interface ProjectionChartProps {
  data: PuntoGrafica[];
  corteAño: number;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: number | string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-sm text-xs">
        <p className="font-semibold text-slate-200 mb-1">Año: {label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {entry.value?.toLocaleString()} estudiantes
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function ProjectionChart({ data, corteAño }: ProjectionChartProps) {
  return (
    <div className="w-full h-[420px] rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-2xl">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id="historicoGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="proyeccionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          
          <XAxis
            dataKey="año"
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickLine={{ stroke: '#475569' }}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickLine={{ stroke: '#475569' }}
            tickFormatter={(val: number) => val.toLocaleString()}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ fontSize: '13px', paddingTop: '4px' }}
          />

          <ReferenceLine
            x={corteAño}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            label={{
              value: `Último dato (${corteAño})`,
              fill: '#f59e0b',
              position: 'top',
              fontSize: 12,
            }}
          />

          <Line
            type="monotone"
            dataKey="historico"
            name="Histórico Real"
            stroke="#38bdf8"
            strokeWidth={3}
            dot={{ r: 5, fill: '#38bdf8', strokeWidth: 2, stroke: '#0f172a' }}
            activeDot={{ r: 7 }}
            connectNulls={false}
          />

          <Line
            type="monotone"
            dataKey="proyeccion"
            name="Proyección Polinomial"
            stroke="#a855f7"
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ r: 5, fill: '#a855f7', strokeWidth: 2, stroke: '#0f172a' }}
            activeDot={{ r: 7 }}
            connectNulls={true}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
