'use client';

import React, { useState, useMemo, useTransition } from 'react';
import { FilaIPE, ParamsIPE, FilaCalculadaIPE } from '@/lib/docentesTypes';
import { procesarDatasetIPE, formatMiles } from '@/lib/docentesCalc';
import {
  GraduationCap,
  ClipboardList,
  CheckCircle2,
  Award,
  AlertTriangle,
  UserCheck,
  BarChart3,
  Search,
  SlidersHorizontal,
  TableProperties,
  Scale,
  School,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine, Cell
} from 'recharts';

interface IPEDashboardProps {
  data: FilaIPE[];
  especialidades: string[];
  departamentos: string[];
}

const DEFAULT_PARAMS_IPE: ParamsIPE = {
  estudiantesPorParalelo: 25,
  studentsPerDocReal: 30,
};

type IPETab = 'analisis' | 'tabla';

interface TTItem { name: string; value: number; color: string }
function TooltipCustom({ active, payload, label }: { active?: boolean; payload?: TTItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md text-xs space-y-1">
      <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}:</span>
          <span className="font-mono font-bold text-slate-100">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export function IPEDashboard({ data, especialidades, departamentos }: IPEDashboardProps) {
  const [params, setParams] = useState<ParamsIPE>(DEFAULT_PARAMS_IPE);
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');
  const [activeTab, setActiveTab] = useState<IPETab>('analisis');
  const [sortKey, setSortKey] = useState<keyof FilaCalculadaIPE>('total');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc'); // asc = deficits first

  const [, startTransition] = useTransition();

  const patchParams = (patch: Partial<ParamsIPE>) => {
    startTransition(() => {
      setParams((prev) => ({ ...prev, ...patch }));
    });
  };

  const filasCalculadas = useMemo(
    () => procesarDatasetIPE(data, params, filtroEspecialidad, filtroDepartamento),
    [data, params, filtroEspecialidad, filtroDepartamento]
  );

  // Totales en un solo recorrido
  const totals = useMemo(() => {
    let est = 0, par = 0, plan = 0, egr = 0, tot = 0, docReal = 0, deficitCount = 0;
    for (let i = 0; i < filasCalculadas.length; i++) {
      const f = filasCalculadas[i];
      est += f.estUE;
      par += f.paralelos;
      plan += f.planilla;
      egr += f.egresados;
      tot += f.total;
      docReal += f.docenteReal;
      if (f.total < 0) deficitCount++;
    }
    return {
      est: Math.round(est),
      par: Math.round(par),
      plan: Math.round(plan),
      egr: Math.round(egr),
      tot: Math.round(tot),
      docReal: Math.round(docReal * 10) / 10,
      deficitCount,
    };
  }, [filasCalculadas]);

  // Datos para gráfico por Departamento
  const chartDepto = useMemo(() => {
    const map = new Map<string, { paralelos: number; disponibles: number; balance: number; docReal: number }>();
    for (const f of filasCalculadas) {
      if (!map.has(f.departamento)) {
        map.set(f.departamento, { paralelos: 0, disponibles: 0, balance: 0, docReal: 0 });
      }
      const item = map.get(f.departamento)!;
      item.paralelos += f.paralelos;
      item.disponibles += (f.planilla + f.egresados);
      item.balance += f.total;
      item.docReal += f.docenteReal;
    }
    return Array.from(map.entries()).map(([depto, v]) => ({
      name: depto.slice(0, 3).toUpperCase(),
      fullName: depto,
      'Paralelos': Math.round(v.paralelos),
      'Disponibles': Math.round(v.disponibles),
      'Balance': Math.round(v.balance),
      'Doc. Real': Math.round(v.docReal * 10) / 10,
    }));
  }, [filasCalculadas]);

  // Datos para gráfico por Especialidad
  const chartEsp = useMemo(() => {
    const map = new Map<string, { paralelos: number; disponibles: number; balance: number; docReal: number }>();
    for (const f of filasCalculadas) {
      if (!map.has(f.especialidad)) {
        map.set(f.especialidad, { paralelos: 0, disponibles: 0, balance: 0, docReal: 0 });
      }
      const item = map.get(f.especialidad)!;
      item.paralelos += f.paralelos;
      item.disponibles += (f.planilla + f.egresados);
      item.balance += f.total;
      item.docReal += f.docenteReal;
    }
    return Array.from(map.entries()).map(([esp, v]) => ({
      name: esp,
      'Paralelos': Math.round(v.paralelos),
      'Disponibles': Math.round(v.disponibles),
      'Balance': Math.round(v.balance),
      'Doc. Real': Math.round(v.docReal * 10) / 10,
    }));
  }, [filasCalculadas]);

  const sortedRows = useMemo(() => {
    return [...filasCalculadas].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [filasCalculadas, sortKey, sortDir]);

  const toggleSort = (key: keyof FilaCalculadaIPE) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── TARJETAS DE RESUMEN IPE ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-sky-900/50 bg-sky-950/20 p-3.5 shadow-lg flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-sky-400 shrink-0" />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Estudiantes UE</span>
          </div>
          <span className="text-xl font-extrabold font-mono text-sky-400">{formatMiles(totals.est)}</span>
          <span className="text-[10px] text-slate-500">Inicial + Primaria + Especial</span>
        </div>

        <div className="rounded-2xl border border-indigo-900/50 bg-indigo-950/20 p-3.5 shadow-lg flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4 text-indigo-400 shrink-0" />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Paralelos</span>
          </div>
          <span className="text-xl font-extrabold font-mono text-indigo-400">{formatMiles(totals.par)}</span>
          <span className="text-[10px] text-slate-500">EST ÷ {params.estudiantesPorParalelo}</span>
        </div>

        <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-3.5 shadow-lg flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Planilla Actual</span>
          </div>
          <span className="text-xl font-extrabold font-mono text-emerald-400">{formatMiles(totals.plan)}</span>
          <span className="text-[10px] text-slate-500">Docentes en planilla</span>
        </div>

        <div className="rounded-2xl border border-teal-900/50 bg-teal-950/20 p-3.5 shadow-lg flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-teal-400 shrink-0" />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Egresados Disp.</span>
          </div>
          <span className="text-xl font-extrabold font-mono text-teal-400">{formatMiles(totals.egr)}</span>
          <span className="text-[10px] text-slate-500">Graduados disponibles</span>
        </div>

        <div className={`rounded-2xl border p-3.5 shadow-lg flex flex-col gap-1.5 ${
          totals.tot < 0 ? 'border-rose-900/50 bg-rose-950/20' : 'border-emerald-900/50 bg-emerald-950/20'
        }`}>
          <div className="flex items-center gap-1.5">
            <Scale className={`h-4 w-4 shrink-0 ${totals.tot < 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Balance Total</span>
          </div>
          <span className={`text-xl font-extrabold font-mono ${totals.tot < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {totals.tot > 0 ? '+' : ''}{formatMiles(totals.tot)}
          </span>
          <span className="text-[10px] text-slate-500">
            {totals.tot < 0 ? `${totals.deficitCount} dptos en déficit` : 'Superávit global'}
          </span>
        </div>

        <div className="rounded-2xl border border-purple-900/50 bg-purple-950/20 p-3.5 shadow-lg flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <UserCheck className="h-4 w-4 text-purple-400 shrink-0" />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Docente Real</span>
          </div>
          <span className="text-xl font-extrabold font-mono text-purple-400">{totals.docReal.toLocaleString()}</span>
          <span className="text-[10px] text-slate-500">Déficit ÷ {params.studentsPerDocReal} est.</span>
        </div>
      </div>

      {/* ── CUERPO PRINCIPAL: PANEL LATERAL + VISTAS ── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Panel lateral de controles */}
        <aside className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-sky-400" />
              <span>Parámetros IPE</span>
            </h3>

            {/* Slider Estudiantes por Paralelo */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-300">Est. por Paralelo</label>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded text-sky-400 bg-sky-500/10">
                  {params.estudiantesPorParalelo} est.
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={45}
                step={1}
                value={params.estudiantesPorParalelo}
                onChange={(e) => patchParams({ estudiantesPorParalelo: Number(e.target.value) })}
                className="w-full h-1.5 appearance-none rounded-full bg-slate-700 cursor-pointer"
                style={{ accentColor: '#38bdf8' }}
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>15</span>
                <span className="text-sky-500 font-semibold">25 base</span>
                <span>45</span>
              </div>
            </div>

            {/* Slider Estudiantes por Docente Real */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-300">Est. por Doc. Real</label>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded text-purple-400 bg-purple-500/10">
                  {params.studentsPerDocReal} est.
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={50}
                step={1}
                value={params.studentsPerDocReal}
                onChange={(e) => patchParams({ studentsPerDocReal: Number(e.target.value) })}
                className="w-full h-1.5 appearance-none rounded-full bg-slate-700 cursor-pointer"
                style={{ accentColor: '#a855f7' }}
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>15</span>
                <span className="text-purple-500 font-semibold">30 base</span>
                <span>50</span>
              </div>
            </div>

            {/* Fórmulas IPE */}
            <div className="text-[10px] text-slate-500 bg-slate-900/60 rounded-lg p-2.5 font-mono leading-relaxed space-y-0.5 border border-slate-800">
              <p className="text-slate-400 font-semibold text-[11px] mb-1">Modelo IPE (Sin carga horaria):</p>
              <p>PARALELOS = EST ÷ {params.estudiantesPorParalelo}</p>
              <p>TOTAL = (PLANILLA + EGRES) − PARALELOS</p>
              <p className="text-slate-400 mt-1">Si TOTAL &lt; 0 (Déficit):</p>
              <p>DOCENTE_REAL = |TOTAL| ÷ {params.studentsPerDocReal}</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-sky-400" />
              <span>Filtros IPE</span>
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Especialidad</label>
              <select
                value={filtroEspecialidad}
                onChange={(e) => setFiltroEspecialidad(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 focus:border-sky-500 focus:outline-none"
              >
                <option value="">Todas (Inicial, Primaria, Especial)</option>
                {especialidades.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Departamento</label>
              <select
                value={filtroDepartamento}
                onChange={(e) => setFiltroDepartamento(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 focus:border-sky-500 focus:outline-none"
              >
                <option value="">Todos los departamentos</option>
                {departamentos.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {(filtroEspecialidad || filtroDepartamento) && (
              <button
                onClick={() => { setFiltroEspecialidad(''); setFiltroDepartamento(''); }}
                className="w-full py-1.5 text-xs text-rose-400 border border-rose-800/50 rounded-lg hover:bg-rose-950/30 transition-colors"
              >
                ✕ Limpiar filtros
              </button>
            )}
          </div>
        </aside>

        {/* Contenido principal con pestañas */}
        <main className="flex-1 min-w-0 space-y-5">
          {/* Navegación por pestañas */}
          <div className="flex gap-1 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('analisis')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'analisis'
                  ? 'border-teal-500 text-teal-300 bg-teal-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Gráficos y Balance</span>
            </button>
            <button
              onClick={() => setActiveTab('tabla')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'tabla'
                  ? 'border-teal-500 text-teal-300 bg-teal-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableProperties className="h-4 w-4" />
              <span>Tabla IPE Detallada</span>
            </button>
          </div>

          {/* TAB 1: ANÁLISIS */}
          {activeTab === 'analisis' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {/* Gráfico 1: Paralelos Requeridos vs Disponibles por Departamento */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-xl">
                  <h3 className="text-sm font-bold text-slate-100 mb-0.5 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-sky-400 shrink-0" />
                    <span>Paralelos Requeridos vs. Disponibles por Dpto</span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Paralelos (docentes necesarios) frente a Planilla + Egresados</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartDepto} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
                      <Tooltip content={<TooltipCustom />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Paralelos" fill="#38bdf8" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                      <Bar dataKey="Disponibles" fill="#34d399" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico 2: Balance Neto por Departamento (Superávit vs Déficit) */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-xl">
                  <h3 className="text-sm font-bold text-slate-100 mb-0.5 flex items-center gap-2">
                    <Scale className="h-4 w-4 text-teal-400 shrink-0" />
                    <span>Balance Neto: (Planilla + Egres) − Paralelos</span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Valores negativos indican déficit; valores positivos indican superávit</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartDepto} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip content={<TooltipCustom />} />
                      <ReferenceLine y={0} stroke="#475569" />
                      <Bar dataKey="Balance" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                        {chartDepto.map((entry, i) => (
                          <Cell key={i} fill={entry.Balance < 0 ? '#f43f5e' : '#10b981'} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico 3: Comparativa por Área (Inicial vs Primaria vs Especial) */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-xl">
                <h3 className="text-sm font-bold text-slate-100 mb-0.5 flex items-center gap-2">
                  <School className="h-4 w-4 text-purple-400 shrink-0" />
                  <span>Resumen por Nivel: Inicial, Primaria y Especial</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4">Total de demanda y cobertura docente por nivel formativo</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {chartEsp.map((c) => (
                    <div key={c.name} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-200">{c.name}</span>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          c.Balance < 0 ? 'text-rose-400 bg-rose-950/50' : 'text-emerald-400 bg-emerald-950/50'
                        }`}>
                          {c.Balance < 0 ? 'Déficit' : 'Superávit'}: {formatMiles(c.Balance)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-[10px] text-slate-400">Paralelos Requeridos</p>
                          <p className="font-mono font-bold text-sky-400">{formatMiles(c.Paralelos)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400">Planilla + Egresados</p>
                          <p className="font-mono font-bold text-emerald-400">{formatMiles(c.Disponibles)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TABLA IPE DETALLADA */}
          {activeTab === 'tabla' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Tabla Detallada IPE-2026</h3>
                  <p className="text-xs text-slate-400">
                    Campos exactos del modelo IPE. Clic en las columnas para ordenar.
                  </p>
                </div>
                <span className="text-xs bg-slate-800 px-2 py-1 rounded-lg text-slate-400">
                  {sortedRows.length} registros
                </span>
              </div>

              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800 z-10">
                    <tr>
                      {[
                        { key: 'especialidad', label: 'ESPECIALIDAD' },
                        { key: 'departamento', label: 'DEPARTAMENTO' },
                        { key: 'estUE', label: 'EST UE' },
                        { key: 'paralelos', label: 'PARALELOS' },
                        { key: 'planilla', label: 'PLANILLA' },
                        { key: 'egresados', label: 'EGRESADOS' },
                        { key: 'total', label: 'TOTAL' },
                        { key: 'docenteReal', label: 'DOCENTE REAL' },
                      ].map((col) => (
                        <th
                          key={col.key}
                          onClick={() => toggleSort(col.key as keyof FilaCalculadaIPE)}
                          className="px-3.5 py-2.5 font-semibold cursor-pointer hover:text-slate-100 select-none transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>{col.label}</span>
                            {sortKey === col.key && (
                              <span className="text-sky-400 font-bold">{sortDir === 'asc' ? '▲' : '▼'}</span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {sortedRows.map((fila, idx) => {
                      const isDeficit = fila.total < 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-900/40 transition-colors font-sans">
                          <td className="px-3.5 py-2.5 font-bold text-slate-200">{fila.especialidad}</td>
                          <td className="px-3.5 py-2.5 text-slate-300">{fila.departamento}</td>
                          <td className="px-3.5 py-2.5 text-right font-mono text-sky-400">{formatMiles(fila.estUE)}</td>
                          <td className="px-3.5 py-2.5 text-right font-mono text-indigo-400 font-semibold">{fila.paralelos.toFixed(2)}</td>
                          <td className="px-3.5 py-2.5 text-right font-mono text-emerald-400">{formatMiles(fila.planilla)}</td>
                          <td className="px-3.5 py-2.5 text-right font-mono text-teal-400">{formatMiles(fila.egresados)}</td>
                          <td className={`px-3.5 py-2.5 text-right font-mono font-bold ${
                            isDeficit ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {fila.total.toFixed(2)}
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-mono text-purple-400 font-bold">
                            {isDeficit ? fila.docenteReal.toFixed(2) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
