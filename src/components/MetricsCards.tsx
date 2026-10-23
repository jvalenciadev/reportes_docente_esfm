'use client';

import React from 'react';
import { ResultadoProyeccion } from '@/lib/types';

interface MetricsCardsProps {
  resultado: ResultadoProyeccion;
}

export function MetricsCards({ resultado }: MetricsCardsProps) {
  const { r2, ecuacion, historico, proyecciones } = resultado;

  const ultimoHistorico = historico[historico.length - 1];
  const ultimoProyectado = proyecciones[proyecciones.length - 1];

  const diferencia = ultimoProyectado && ultimoHistorico
    ? ultimoProyectado.estudiantes - ultimoHistorico.estudiantes
    : 0;

  const variacionPorcentual = ultimoHistorico && ultimoHistorico.estudiantes > 0
    ? ((diferencia / ultimoHistorico.estudiantes) * 100).toFixed(1)
    : '0.0';

  const r2Porcentaje = (r2 * 100).toFixed(1);

  const getCalidadAjuste = (coef: number) => {
    if (coef >= 0.9) return { label: 'Ajuste Excelente', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (coef >= 0.75) return { label: 'Ajuste Bueno', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' };
    if (coef >= 0.5) return { label: 'Ajuste Moderado', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Baja Correlación', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const calidad = getCalidadAjuste(r2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* R² Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Coeficiente R² (Bondad)
          </span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${calidad.color}`}>
            {calidad.label}
          </span>
        </div>
        <div className="mt-1">
          <span className="text-3xl font-extrabold text-slate-100 font-mono">
            {r2Porcentaje}%
          </span>
          <p className="mt-1 text-xs text-slate-400">
            El modelo explica el {r2Porcentaje}% de la varianza histórica.
          </p>
        </div>
      </div>

      {/* Proyección Final */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
          Proyección a {ultimoProyectado?.año} ({proyecciones.length} Años)
        </span>
        <div className="mt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-400 font-mono">
              {ultimoProyectado?.estudiantes.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">estudiantes</span>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-400">
            {diferencia >= 0 ? (
              <span className="text-emerald-400 font-semibold">+{variacionPorcentual}% </span>
            ) : (
              <span className="text-rose-400 font-semibold">{variacionPorcentual}% </span>
            )}
            vs. {ultimoHistorico?.año} ({ultimoHistorico?.estudiantes.toLocaleString()})
          </p>
        </div>
      </div>

      {/* Ecuación Polinomial */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
          Ecuación del Modelo
        </span>
        <div className="mt-1">
          <div className="rounded bg-slate-900/80 p-2.5 border border-slate-800 text-xs font-mono text-amber-300 break-all select-all">
            {ecuacion || 'y = f(x)'}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Donde x = 0 representa el año inicial ({historico[0]?.año}).
          </p>
        </div>
      </div>
    </div>
  );
}
