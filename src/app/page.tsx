'use client';

import React, { useState, useMemo } from 'react';
import rawData from '@/data/docentesData.json';
import { DatasetDocentes, FilaDocente, Año, ParamsModelo } from '@/lib/docentesTypes';
import { procesarDataset, construirComparativa } from '@/lib/docentesCalc';
import { ControlPanel } from '@/components/ControlPanel';
import { SummaryCards } from '@/components/SummaryCards';
import {
  DeficitChart, DocenteRealChart, TotalPorEspecialidadChart,
  ComparativaBarChart, ComparativaDeficitLine, ComparativaDeltaCards,
} from '@/components/DocentesCharts';
import { DataGrid } from '@/components/DataGrid';
import {
  BarChart3,
  Scale,
  TableProperties,
  Trophy,
  Calculator,
  Layers,
  GraduationCap,
} from 'lucide-react';

const dataset = rawData as DatasetDocentes;

const DEFAULT_PARAMS: ParamsModelo = {
  estudiantesPorParalelo: 35,
  cargaDocenteHrs: 96,
  errorPct: 20,
  atenderPct: 10,
  studentsPerDocReal: 30,
};

type TabId = 'analisis' | 'comparativa' | 'tabla';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'analisis', label: 'Análisis', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'comparativa', label: 'Comparativa 2026 vs 2031', icon: <Scale className="h-4 w-4" /> },
  { id: 'tabla', label: 'Tabla Detallada', icon: <TableProperties className="h-4 w-4" /> },
];

export default function DocentesDashboard() {
  const [año, setAño] = useState<Año>('2031');
  const [params, setParams] = useState<ParamsModelo>(DEFAULT_PARAMS);
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('analisis');

  const [isPending, startTransition] = React.useTransition();

  const patchParams = (patch: Partial<ParamsModelo>) => {
    startTransition(() => {
      setParams((prev) => ({ ...prev, ...patch }));
    });
  };

  // Datos del año seleccionado, recalculados con parámetros dinámicos
  const datosRaw: FilaDocente[] = año === '2026' ? dataset.data2026 : dataset.data2031;
  const datosCalculados = useMemo(
    () => procesarDataset(datosRaw, params, filtroEspecialidad, filtroDepartamento),
    [datosRaw, params, filtroEspecialidad, filtroDepartamento]
  );

  // Datos para comparativa (solo se procesan si la pestaña comparativa está activa)
  const comparativa = useMemo(() => {
    if (activeTab !== 'comparativa') return [];
    const c26 = procesarDataset(dataset.data2026, params, filtroEspecialidad, filtroDepartamento);
    const c31 = procesarDataset(dataset.data2031, params, filtroEspecialidad, filtroDepartamento);
    const deptos = [...new Set([...c26.map(f => f.departamento), ...c31.map(f => f.departamento)])];
    return construirComparativa(c26, c31, deptos);
  }, [activeTab, params, filtroEspecialidad, filtroDepartamento]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm sticky top-0 z-20 px-6 py-3">
        <div className="max-w-[1680px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-0.5 text-[11px] font-semibold text-purple-400 border border-purple-500/20 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
              Sistema de Análisis Docente ESFM — Bolivia
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              Proyección de Requerimiento Docente
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700">{dataset.especialidades.length} especialidades</span>
            <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700">{dataset.departamentos.length} departamentos</span>
            <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700">{datosCalculados.length} registros</span>
            <span className={`px-2 py-1 rounded-lg border font-semibold ${año === '2026' ? 'text-sky-400 border-sky-800 bg-sky-950/40' : 'text-purple-400 border-purple-800 bg-purple-950/40'}`}>
              {año}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Panel lateral */}
        <ControlPanel
          año={año} onAñoChange={setAño}
          params={params} onParamsChange={patchParams}
          especialidades={dataset.especialidades}
          filtroEspecialidad={filtroEspecialidad} onEspecialidadChange={setFiltroEspecialidad}
          departamentos={dataset.departamentos}
          filtroDepartamento={filtroDepartamento} onDepartamentoChange={setFiltroDepartamento}
        />

        {/* Contenido principal */}
        <main className="flex-1 min-w-0 space-y-5">
          {/* KPI Cards — 9 métricas */}
          <SummaryCards
            data={datosCalculados} año={año}
            errorPct={params.errorPct} atenderPct={params.atenderPct}
            studentsPerDocReal={params.studentsPerDocReal}
          />

          {/* Tabs */}
          <div className="flex gap-1 border-b border-slate-800">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === tab.id
                    ? 'border-purple-500 text-purple-300 bg-purple-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── TAB: ANÁLISIS ─────────────────────────────── */}
          {activeTab === 'analisis' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <DeficitChart data={datosCalculados} />
              <DocenteRealChart data={datosCalculados} />
              <TotalPorEspecialidadChart data={datosCalculados} />

              {/* Mini-tabla de top déficits */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-xl">
                <h3 className="text-sm font-bold text-slate-100 mb-0.5 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Top Déficits por Especialidad</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4">Registros con mayor cantidad de docentes necesitados</p>
                <div className="space-y-2">
                  {[...datosCalculados]
                    .sort((a, b) => b.totalNecesitados - a.totalNecesitados)
                    .slice(0, 8)
                    .map((f, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <span className="text-slate-600 w-4 text-right">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <span className="truncate text-slate-300 max-w-[160px]" title={f.especialidad}>
                              {f.especialidad.replace(/\s*\d+\s*HRS\s*$/i, '').trim().slice(0, 22)}
                            </span>
                            <span className="text-slate-400 ml-2 shrink-0">{f.departamento}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex-1 h-1 rounded-full bg-slate-800">
                              <div
                                className="h-1 rounded-full bg-rose-500"
                                style={{ width: `${Math.min(100, (f.totalNecesitados / datosCalculados[0]?.totalNecesitados) * 100)}%` }}
                              />
                            </div>
                            <span className="text-rose-400 font-mono font-bold shrink-0">{Math.round(f.totalNecesitados).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: COMPARATIVA 2026 vs 2031 ─────────────── */}
          {activeTab === 'comparativa' && (
            <div className="space-y-5">
              {/* Resumen delta global */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: 'Total Doc. Nec. 2026',
                    value: comparativa.reduce((s, d) => s + d.docNec2026, 0),
                    color: 'text-sky-400', bg: 'bg-sky-950/20 border-sky-900/50',
                  },
                  {
                    label: 'Total Doc. Nec. 2031',
                    value: comparativa.reduce((s, d) => s + d.docNec2031, 0),
                    color: 'text-purple-400', bg: 'bg-purple-950/20 border-purple-900/50',
                  },
                  {
                    label: 'Δ Crecimiento Docentes',
                    value: comparativa.reduce((s, d) => s + d.docNec2031, 0) - comparativa.reduce((s, d) => s + d.docNec2026, 0),
                    color: 'text-rose-400', bg: 'bg-rose-950/20 border-rose-900/50',
                    prefix: '+',
                  },
                  {
                    label: 'Δ Déficit Adicional 2031',
                    value: comparativa.reduce((s, d) => s + d.deficit2031, 0) - comparativa.reduce((s, d) => s + d.deficit2026, 0),
                    color: 'text-amber-400', bg: 'bg-amber-950/20 border-amber-900/50',
                  },
                ].map((c, i) => (
                  <div key={i} className={`rounded-2xl border p-4 ${c.bg}`}>
                    <p className="text-xs text-slate-400 mb-1">{c.label}</p>
                    <p className={`text-2xl font-extrabold font-mono ${c.color}`}>
                      {c.prefix}{Math.round(c.value).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <ComparativaBarChart data={comparativa} />
                <ComparativaDeficitLine data={comparativa} />
              </div>
              <ComparativaDeltaCards data={comparativa} />
            </div>
          )}

          {/* ── TAB: TABLA DETALLADA ──────────────────────── */}
          {activeTab === 'tabla' && (
            <DataGrid
              data={datosCalculados}
              errorPct={params.errorPct}
              atenderPct={params.atenderPct}
            />
          )}

          {/* Nota metodológica */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-[11px] text-slate-400 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <p className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5 text-sky-400" />
                <span>Fórmulas Base</span>
              </p>
              <p>PARALELOS = EST ÷ {params.estudiantesPorParalelo}</p>
              <p>DOC_NEC = (PARALELOS × CHR) ÷ {params.cargaDocenteHrs}</p>
            </div>
            <div>
              <p className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                <span>Derivadas</span>
              </p>
              <p>TOTAL_NEC = DOC_NEC − (PLANILLA+EGRES)</p>
              <p>ERROR {params.errorPct}% = TOTAL_NEC × {((100 - params.errorPct) / 100).toFixed(2)} (inv.)</p>
              <p>ATENDER {params.atenderPct}% = ERROR × {params.atenderPct}%</p>
            </div>
            <div>
              <p className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-purple-400" />
                <span>Docentes Reales</span>
              </p>
              <p>DOC_REAL = ERROR ÷ {params.studentsPerDocReal}</p>
              <p>DOC_MARGEN = ATENDER ÷ {params.studentsPerDocReal}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
