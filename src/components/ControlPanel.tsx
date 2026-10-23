'use client';
import React from 'react';
import { ParamsModelo } from '@/lib/docentesTypes';
import { SlidersHorizontal, Search, Calendar } from 'lucide-react';

interface ControlPanelProps {
  año: '2026' | '2031';
  onAñoChange: (a: '2026' | '2031') => void;
  params: ParamsModelo;
  onParamsChange: (p: Partial<ParamsModelo>) => void;
  especialidades: string[];
  filtroEspecialidad: string;
  onEspecialidadChange: (v: string) => void;
  departamentos: string[];
  filtroDepartamento: string;
  onDepartamentoChange: (v: string) => void;
}

function Slider({
  label, value, min, max, step, onChange, unit, color = 'sky',
}: {
  label: string; value: number; min: number; max: number;
  step: number; onChange: (v: number) => void; unit: string; color?: string;
}) {
  const colorMap: Record<string, string> = {
    sky: 'text-sky-400 bg-sky-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    rose: 'text-rose-400 bg-rose-500/10',
  };
  const cls = colorMap[color] ?? colorMap.sky;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-slate-300">{label}</label>
        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${cls}`}>
          {value} {unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 appearance-none rounded-full bg-slate-700 cursor-pointer"
        style={{ accentColor: color === 'sky' ? '#38bdf8' : color === 'purple' ? '#a855f7' : color === 'amber' ? '#f59e0b' : color === 'emerald' ? '#34d399' : '#f43f5e' }}
      />
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

function abbrevEspecialidad(e: string): string {
  return e.replace(/\s*\d+\s*HRS\s*$/i, '').trim();
}

export const ControlPanel = React.memo(function ControlPanel({
  año, onAñoChange, params, onParamsChange,
  especialidades, filtroEspecialidad, onEspecialidadChange,
  departamentos, filtroDepartamento, onDepartamentoChange,
}: ControlPanelProps) {
  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-4">

      {/* Selector de Año */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Período</h3>
        <div className="grid grid-cols-2 gap-2">
          {(['2026', '2031'] as const).map((a) => (
            <button key={a} onClick={() => onAñoChange(a)}
              className={`py-2 rounded-xl text-sm font-bold border transition-all ${año === a
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
            >{a}</button>
          ))}
        </div>
      </div>

      {/* Parámetros del Modelo */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg space-y-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-sky-400" />
          <span>Parámetros del Modelo</span>
        </h3>

        <Slider label="Est. por Paralelo" value={params.estudiantesPorParalelo}
          min={20} max={60} step={1} unit="est." color="sky"
          onChange={(v) => onParamsChange({ estudiantesPorParalelo: v })} />

        <Slider label="Carga Docente (hrs/año)" value={params.cargaDocenteHrs}
          min={48} max={180} step={4} unit="hrs" color="purple"
          onChange={(v) => onParamsChange({ cargaDocenteHrs: v })} />

        <div className="border-t border-slate-800 pt-4 space-y-5">
          <Slider label="Margen de Error" value={params.errorPct}
            min={5} max={50} step={1} unit="%" color="rose"
            onChange={(v) => onParamsChange({ errorPct: v })} />

          <Slider label="Población a Atender" value={params.atenderPct}
            min={5} max={50} step={1} unit="%" color="amber"
            onChange={(v) => onParamsChange({ atenderPct: v })} />

          <Slider label="Est. por Docente Real" value={params.studentsPerDocReal}
            min={10} max={60} step={1} unit="est." color="emerald"
            onChange={(v) => onParamsChange({ studentsPerDocReal: v })} />
        </div>

        {/* Preview de fórmulas */}
        <div className="text-[10px] text-slate-500 bg-slate-900/60 rounded-lg p-2.5 font-mono leading-relaxed space-y-0.5 border border-slate-800">
          <p className="text-slate-400 font-semibold text-[11px] mb-1">Fórmulas activas:</p>
          <p>DOC_NEC = (PARALELOS × CHR) ÷ {params.cargaDocenteHrs}</p>
          <p>TOTAL_NEC = DOC_NEC − (PLANILLA+EGRES)</p>
          <p>ERROR = TOTAL_NEC × {((100 - params.errorPct) / 100).toFixed(2)} (inv. {params.errorPct}%)</p>
          <p>ATENDER = ERROR × {params.atenderPct}%</p>
          <p>DOC_REAL = ERROR ÷ {params.studentsPerDocReal}</p>
          <p>DOC_MARGEN = ATENDER ÷ {params.studentsPerDocReal}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5 text-sky-400" />
          <span>Filtros</span>
        </h3>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Departamento</label>
          <select value={filtroDepartamento} onChange={(e) => onDepartamentoChange(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 focus:border-sky-500 focus:outline-none">
            <option value="">Todos los departamentos</option>
            {departamentos.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Especialidad</label>
          <select value={filtroEspecialidad} onChange={(e) => onEspecialidadChange(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 focus:border-sky-500 focus:outline-none">
            <option value="">Todas las especialidades</option>
            {especialidades.map((e) => (
              <option key={e} value={e}>{abbrevEspecialidad(e)}</option>
            ))}
          </select>
        </div>
        {(filtroEspecialidad || filtroDepartamento) && (
          <button onClick={() => { onEspecialidadChange(''); onDepartamentoChange(''); }}
            className="w-full py-1.5 text-xs text-rose-400 border border-rose-800/50 rounded-lg hover:bg-rose-950/30 transition-colors">
            ✕ Limpiar filtros
          </button>
        )}
      </div>
    </aside>
  );
});
