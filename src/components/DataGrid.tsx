'use client';
import React, { useState } from 'react';
import { FilaCalculada } from '@/lib/docentesTypes';

interface DataGridProps {
  data: FilaCalculada[];
  errorPct: number;
  atenderPct: number;
}

type SortKey = keyof FilaCalculada;

function abbrevEspecialidad(e: string): string {
  return e.replace(/\s*\d+\s*HRS\s*$/i, '').trim();
}
function cn(...v: (string | false | undefined)[]) { return v.filter(Boolean).join(' '); }

export const DataGrid = React.memo(function DataGrid({ data, errorPct, atenderPct }: DataGridProps) {
  const [sortKey, setSortKey] = useState<SortKey>('totalNecesitados');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey] as number | string;
    const bv = b[sortKey] as number | string;
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
    return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  const cols: { key: SortKey; label: string }[] = [
    { key: 'especialidad',      label: 'Especialidad' },
    { key: 'departamento',      label: 'Dpto.' },
    { key: 'estUE',             label: 'Est. UE' },
    { key: 'paralelos',         label: 'Paralelos' },
    { key: 'docNec',            label: 'Doc. Nec.' },
    { key: 'planilla',          label: 'Planilla' },
    { key: 'egresados',         label: 'Egresados' },
    { key: 'totalNecesitados',  label: 'Total Nec.' },
    { key: 'errorMargen',       label: `Error ${errorPct}%` },
    { key: 'atender',           label: `Atender ${atenderPct}%` },
    { key: 'docenteReal',       label: 'Doc. Real' },
    { key: 'docenteConMargen',  label: 'Doc. Margen' },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 shadow-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-200">Detalle por Especialidad y Departamento</h3>
          <p className="text-xs text-slate-400">Clic en columna para ordenar. Valores recalculados con parámetros actuales.</p>
        </div>
        <span className="text-xs bg-slate-800 px-2 py-1 rounded-lg text-slate-400">{data.length} registros</span>
      </div>
      <div className="overflow-x-auto max-h-[420px]">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800 z-10">
            <tr>
              {cols.map((c) => (
                <th
                  key={c.key as string}
                  onClick={() => handleSort(c.key)}
                  className={cn(
                    'px-3 py-2.5 font-medium cursor-pointer select-none whitespace-nowrap hover:text-slate-200 transition-colors',
                    sortKey === c.key && 'text-sky-400'
                  )}
                >
                  {c.label} {sortKey === c.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sorted.map((fila, i) => (
              <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                <td className="px-3 py-2 max-w-[180px] truncate text-slate-300" title={fila.especialidad}>
                  {abbrevEspecialidad(fila.especialidad)}
                </td>
                <td className="px-3 py-2 text-slate-400 whitespace-nowrap">{fila.departamento}</td>
                <td className="px-3 py-2 text-right font-mono text-slate-300">{Math.round(fila.estUE).toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-mono text-slate-300">{Math.round(fila.paralelos).toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-mono text-rose-400 font-semibold">{Math.round(fila.docNec).toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-mono text-sky-400">{fila.planilla.toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-mono text-teal-400">{fila.egresados.toLocaleString()}</td>
                <td className={cn('px-3 py-2 text-right font-mono font-bold', fila.totalNecesitados > 0 ? 'text-rose-400' : 'text-emerald-400')}>
                  {Math.round(fila.totalNecesitados).toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right font-mono text-orange-400">{Math.round(fila.errorMargen).toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-mono text-yellow-400">{Math.round(fila.atender).toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-mono text-purple-400 font-semibold">{Math.round(fila.docenteReal).toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-mono text-amber-400 font-bold">{Math.round(fila.docenteConMargen).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
