'use client';
import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend, ReferenceLine, Cell,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar, ScatterChart, Scatter, ZAxis,
} from 'recharts';
import { FilaCalculada, PuntoComparativa } from '@/lib/docentesTypes';
import { BarChart3, UserCheck, ClipboardList, TrendingUp, AlertTriangle, MapPin } from 'lucide-react';

const DEPTOS_ABBREV: Record<string, string> = {
  BENI: 'BEN', CHUQUISACA: 'CHU', COCHABAMBA: 'COC',
  'LA PAZ': 'LPZ', ORURO: 'ORU', PANDO: 'PAN',
  POTOSI: 'POT', 'SANTA CRUZ': 'SCZ', TARIJA: 'TAR',
};
const abbrevD = (d: string) => DEPTOS_ABBREV[d] ?? d.slice(0, 3);

function abbrevEsp(e: string): string {
  const match = e.match(/:\s*(.*?)\s+\d+\s*HRS/i);
  if (match) return match[1].trim().slice(0, 22);
  return e.slice(0, 18);
}

// ─── Tooltip genérico ───────────────────────────────────────
interface TTItem { name: string; value: number; color: string }
function TTip({ active, payload, label }: { active?: boolean; payload?: TTItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/98 p-3 shadow-2xl text-xs max-w-[220px] backdrop-blur-sm">
      <p className="font-bold text-slate-100 mb-2 truncate border-b border-slate-800 pb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex justify-between gap-3 items-center py-0.5">
          <span className="flex items-center gap-1" style={{ color: p.color }}>
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-mono font-bold text-slate-100">{Math.round(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 1. GRÁFICA: Docentes necesarios vs disponibles (Planilla+Egres) por Dpto
// ────────────────────────────────────────────────────────────
export const DeficitChart = React.memo(function DeficitChart({ data }: { data: FilaCalculada[] }) {
  const byDepto = data.reduce<Record<string, { docNec: number; disponibles: number; deficit: number }>>((acc, f) => {
    if (!acc[f.departamento]) acc[f.departamento] = { docNec: 0, disponibles: 0, deficit: 0 };
    acc[f.departamento].docNec += f.docNec;
    acc[f.departamento].disponibles += f.planilla + f.egresados;
    acc[f.departamento].deficit += f.totalNecesitados;
    return acc;
  }, {});

  const chartData = Object.entries(byDepto)
    .map(([d, v]) => ({
      name: abbrevD(d),
      'Necesarios': Math.round(v.docNec),
      'Disponibles': Math.round(v.disponibles),
      'Déficit': Math.round(v.deficit),
    }))
    .sort((a, b) => b['Necesarios'] - a['Necesarios']);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-xl">
      <h3 className="text-sm font-bold text-slate-100 mb-0.5 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-rose-400 shrink-0" />
        <span>Necesarios vs. Disponibles</span>
      </h3>
      <p className="text-xs text-slate-400 mb-4">Docentes requeridos frente a planilla + egresados por departamento</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
          <Tooltip content={<TTip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Necesarios" fill="#f43f5e" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="Disponibles" fill="#38bdf8" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

// ────────────────────────────────────────────────────────────
// 2. GRÁFICA: Docente Real y Con Margen por Departamento
// ────────────────────────────────────────────────────────────
export const DocenteRealChart = React.memo(function DocenteRealChart({ data }: { data: FilaCalculada[] }) {
  const byDepto = data.reduce<Record<string, { docenteReal: number; docenteConMargen: number }>>((acc, f) => {
    if (!acc[f.departamento]) acc[f.departamento] = { docenteReal: 0, docenteConMargen: 0 };
    acc[f.departamento].docenteReal += f.docenteReal;
    acc[f.departamento].docenteConMargen += f.docenteConMargen;
    return acc;
  }, {});

  const chartData = Object.entries(byDepto)
    .map(([d, v]) => ({
      name: abbrevD(d),
      'Doc. Real': Math.round(v.docenteReal),
      'Doc. Con Margen': Math.round(v.docenteConMargen),
    }))
    .sort((a, b) => b['Doc. Con Margen'] - a['Doc. Con Margen']);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-xl">
      <h3 className="text-sm font-bold text-slate-100 mb-0.5 flex items-center gap-2">
        <UserCheck className="h-4 w-4 text-purple-400 shrink-0" />
        <span>Doc. Real vs. Con Margen</span>
      </h3>
      <p className="text-xs text-slate-400 mb-4">Docentes a contratar (real) y con margen de error por departamento</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip content={<TTip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Doc. Real" fill="#a855f7" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="Doc. Con Margen" fill="#f59e0b" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

// ────────────────────────────────────────────────────────────
// 3. GRÁFICA: Déficit por especialidad (horizontal, colores)
// ────────────────────────────────────────────────────────────
export const TotalPorEspecialidadChart = React.memo(function TotalPorEspecialidadChart({ data }: { data: FilaCalculada[] }) {
  const byEsp = data.reduce<Record<string, number>>((acc, f) => {
    acc[f.especialidad] = (acc[f.especialidad] ?? 0) + f.totalNecesitados;
    return acc;
  }, {});

  const chartData = Object.entries(byEsp)
    .map(([esp, v]) => ({ name: abbrevEsp(esp), value: Math.round(v) }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-xl">
      <h3 className="text-sm font-bold text-slate-100 mb-0.5 flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-amber-400 shrink-0" />
        <span>Total Necesitados por Especialidad</span>
      </h3>
      <p className="text-xs text-slate-400 mb-4">Déficit de docentes acumulado por área de conocimiento</p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 150, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={145} />
          <Tooltip content={<TTip />} />
          <ReferenceLine x={0} stroke="#475569" />
          <Bar dataKey="value" name="Total Nec." radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.value > 0 ? '#f43f5e' : '#34d399'} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

// ────────────────────────────────────────────────────────────
// 4. COMPARATIVA 2026 vs 2031: Barras agrupadas + crecimiento
// ────────────────────────────────────────────────────────────
export const ComparativaBarChart = React.memo(function ComparativaBarChart({ data }: { data: PuntoComparativa[] }) {
  const chartData = [...data].sort((a, b) => b.docNec2031 - a.docNec2031)
    .map((d) => ({
      name: abbrevD(d.nombre),
      '2026': d.docNec2026,
      '2031': d.docNec2031,
      '▲ Crecimiento': Math.round(d.crecimiento * 10) / 10,
    }));

  return (
    <div className="rounded-2xl border border-purple-900/40 bg-gradient-to-br from-slate-950 to-purple-950/20 p-4 shadow-xl">
      <h3 className="text-sm font-bold text-slate-100 mb-0.5 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-sky-400 shrink-0" />
        <span>Doc. Necesarios: 2026 → 2031</span>
      </h3>
      <p className="text-xs text-slate-400 mb-4">Crecimiento de la demanda docente entre períodos por departamento</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#f59e0b', fontSize: 10 }} unit="%" />
          <Tooltip content={<TTip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar yAxisId="left" dataKey="2026" fill="#38bdf8" radius={[4, 4, 0, 0]} opacity={0.8} isAnimationActive={false} />
          <Bar yAxisId="left" dataKey="2031" fill="#a855f7" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export const ComparativaDeficitLine = React.memo(function ComparativaDeficitLine({ data }: { data: PuntoComparativa[] }) {
  const chartData = [...data]
    .sort((a, b) => b.deficit2031 - a.deficit2031)
    .map((d) => ({
      name: abbrevD(d.nombre),
      'Déficit 2026': d.deficit2026,
      'Déficit 2031': d.deficit2031,
    }));

  return (
    <div className="rounded-2xl border border-rose-900/40 bg-gradient-to-br from-slate-950 to-rose-950/20 p-4 shadow-xl">
      <h3 className="text-sm font-bold text-slate-100 mb-0.5 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
        <span>Evolución del Déficit Docente</span>
      </h3>
      <p className="text-xs text-slate-400 mb-4">Total necesitados (déficit) en 2026 y proyectado a 2031</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
          <Tooltip content={<TTip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
          <Line type="monotone" dataKey="Déficit 2026" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4, fill: '#38bdf8' }} isAnimationActive={false} />
          <Line type="monotone" dataKey="Déficit 2031" stroke="#f43f5e" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4, fill: '#f43f5e' }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

// ────────────────────────────────────────────────────────────
// 6. TARJETAS de comparativa delta 2026 vs 2031
// ────────────────────────────────────────────────────────────
interface DeltaCardProps {
  depto: PuntoComparativa;
}
function DeltaCard({ depto }: DeltaCardProps) {
  const crecPos = depto.crecimiento > 0;
  const deltaDeficit = depto.deficit2031 - depto.deficit2026;
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 hover:border-slate-700 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-slate-200">{depto.nombre}</span>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${crecPos ? 'text-rose-400 bg-rose-950/50' : 'text-emerald-400 bg-emerald-950/50'}`}>
          {crecPos ? '▲' : '▼'} {Math.abs(depto.crecimiento)}%
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <p className="text-slate-500">Doc.Nec. 2026</p>
          <p className="font-mono font-bold text-sky-400">{depto.docNec2026.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-500">Doc.Nec. 2031</p>
          <p className="font-mono font-bold text-purple-400">{depto.docNec2031.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-500">Déficit 2026</p>
          <p className="font-mono font-bold text-slate-300">{depto.deficit2026.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-500">Δ Déficit</p>
          <p className={`font-mono font-bold ${deltaDeficit > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {deltaDeficit > 0 ? '+' : ''}{deltaDeficit.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export const ComparativaDeltaCards = React.memo(function ComparativaDeltaCards({ data }: { data: PuntoComparativa[] }) {
  const sorted = [...data].sort((a, b) => b.crecimiento - a.crecimiento);
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-xl">
      <h3 className="text-sm font-bold text-slate-100 mb-0.5 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-teal-400 shrink-0" />
        <span>Análisis por Departamento: 2026 vs 2031</span>
      </h3>
      <p className="text-xs text-slate-400 mb-4">Crecimiento del requerimiento y evolución del déficit docente</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {sorted.map((d) => <DeltaCard key={d.nombre} depto={d} />)}
      </div>
    </div>
  );
});
