'use client';

import React from 'react';
import { DatoHistorico } from '@/lib/types';

interface DataTableProps {
  historico: DatoHistorico[];
  onUpdateHistorico: (nuevosDatos: DatoHistorico[]) => void;
  ordenPolinomio: number;
  onChangeOrden: (orden: number) => void;
  añosAFuturo: number;
  onChangeAñosFuturo: (años: number) => void;
}

export function DataTable({
  historico,
  onUpdateHistorico,
  ordenPolinomio,
  onChangeOrden,
  añosAFuturo,
  onChangeAñosFuturo,
}: DataTableProps) {
  const handleInputChange = (index: number, campo: keyof DatoHistorico, valor: number) => {
    const actualizados = [...historico];
    actualizados[index] = {
      ...actualizados[index],
      [campo]: Number.isNaN(valor) ? 0 : valor,
    };
    onUpdateHistorico(actualizados);
  };

  const handleAgregarFila = () => {
    const ultimo = historico[historico.length - 1];
    const siguienteAño = ultimo ? ultimo.año + 1 : new Date().getFullYear();
    const promedio = ultimo ? ultimo.estudiantes : 100;
    onUpdateHistorico([...historico, { año: siguienteAño, estudiantes: promedio }]);
  };

  const handleEliminarFila = (index: number) => {
    if (historico.length <= 3) return; // Mínimo 3 puntos para polinomio grado 2
    const filtrados = historico.filter((_, i) => i !== index);
    onUpdateHistorico(filtrados);
  };

  return (
    <div className="space-y-6">
      {/* Controles de Configuración */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-lg backdrop-blur-sm">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-400 mb-4">
          Parámetros del Modelo
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Grado del Polinomio
            </label>
            <select
              value={ordenPolinomio}
              onChange={(e) => onChangeOrden(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value={2}>Grado 2 (Cuadrático - Recomendado)</option>
              <option value={3}>Grado 3 (Cúbico - Curvas de inflexión)</option>
              <option value={4}>Grado 4 (Polinomio orden 4)</option>
            </select>
            <p className="mt-1 text-[11px] text-slate-400">
              {ordenPolinomio === 2
                ? 'Ideal para series con aceleración/desaceleración suave.'
                : 'Permite capturar cambios de tendencia más abruptos.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Años de Proyección
            </label>
            <input
              type="number"
              min={1}
              max={15}
              value={añosAFuturo}
              onChange={(e) => onChangeAñosFuturo(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Horizonte temporal de estimación (por defecto: 4 años).
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de Datos Históricos */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-400">
              Datos Históricos ({historico.length} Años)
            </h3>
            <p className="text-xs text-slate-500">
              Modifica los valores directamente en la tabla.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAgregarFila}
            className="rounded-lg bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 transition-colors"
          >
            + Añadir Año
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 sticky top-0 border-b border-slate-800">
              <tr>
                <th className="px-4 py-2.5 font-medium">Año</th>
                <th className="px-4 py-2.5 font-medium">Matrícula (Estudiantes)</th>
                <th className="px-3 py-2.5 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {historico.map((item, index) => (
                <tr key={index} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-2 w-28">
                    <input
                      type="number"
                      value={item.año}
                      onChange={(e) => handleInputChange(index, 'año', Number(e.target.value))}
                      className="w-full rounded bg-slate-900/80 px-2 py-1 text-slate-200 border border-slate-700/60 focus:border-sky-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min={0}
                      value={item.estudiantes}
                      onChange={(e) =>
                        handleInputChange(index, 'estudiantes', Number(e.target.value))
                      }
                      className="w-full rounded bg-slate-900/80 px-2 py-1 text-slate-200 border border-slate-700/60 focus:border-sky-500 focus:outline-none font-mono"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      disabled={historico.length <= 3}
                      onClick={() => handleEliminarFila(index)}
                      className="text-rose-400 hover:text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                      title="Eliminar registro"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
