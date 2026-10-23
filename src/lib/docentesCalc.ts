import {
  FilaDocente, FilaCalculada, ParamsModelo, PuntoComparativa,
  FilaIPE, ParamsIPE, FilaCalculadaIPE
} from './docentesTypes';

const cargaCache = new Map<string, number>();
export function extractCargaHoraria(especialidad: string): number {
  if (!especialidad) return 96;
  const cached = cargaCache.get(especialidad);
  if (cached !== undefined) return cached;
  const match = especialidad.match(/(\d+)\s*HRS/i);
  const val = match ? parseInt(match[1], 10) : 96;
  cargaCache.set(especialidad, val);
  return val;
}

function r2(v: number): number {
  return Math.round(v * 100) / 100;
}

/** Formateo determinista de enteros con punto de miles (evita hydration mismatch entre servidor Node y navegador) */
export function formatMiles(v: number): string {
  if (isNaN(v)) return '0';
  return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Recalcula todas las columnas derivadas con parámetros dinámicos.
 *
 * FÓRMULAS CORREGIDAS:
 *   PARALELOS         = EST_UE / estudiantesPorParalelo
 *   DOC_NEC           = PARALELOS / (cargaEsp / cargaDocente)
 *   TOTAL_NECESITADOS = DOC_NEC - (PLANILLA + EGRESADOS)   [positivo = déficit]
 *   ERROR_MARGEN      = TOTAL_NECESITADOS × (errorPct/100)
 *   ATENDER           = TOTAL_NECESITADOS × (atenderPct/100)
 *   DOCENTE_REAL      = TOTAL_NECESITADOS / studentsPerDocReal
 *   DOCENTE_CON_MARGEN= (TOTAL_NECESITADOS + ERROR_MARGEN) / studentsPerDocReal
 */
export function recalcularFila(fila: FilaDocente, params: ParamsModelo): FilaCalculada {
  const { estudiantesPorParalelo, cargaDocenteHrs, errorPct, atenderPct, studentsPerDocReal } = params;
  const cargaHoraria = extractCargaHoraria(fila.ESPECIALIDAD);
  const estUE = fila['EST UE'] ?? 0;
  const planilla = fila.PLANILLA ?? 0;
  const egresados = fila.EGRESADOS ?? 0;

  const paralelos = estUE / estudiantesPorParalelo;
  const docNec = (paralelos * cargaHoraria) / cargaDocenteHrs;
  const totalNecesitados = docNec - (planilla + egresados); // positivo = déficit
  // Error invertido: para 20%, totalNecesitados * 0.8
  const factorErrorInvertido = (100 - errorPct) / 100;
  const errorMargen = totalNecesitados * factorErrorInvertido;
  // Atender % basado en el error: ej. 10% del error (error * 0.1)
  const atender = errorMargen * (atenderPct / 100);
  // Docente Real = Error / estudiantesPorDocReal (ej. 30)
  const docenteReal = errorMargen / studentsPerDocReal;
  // Docente con Margen = Atender / estudiantesPorDocReal (ej. 30)
  const docenteConMargen = atender / studentsPerDocReal;

  return {
    especialidad: fila.ESPECIALIDAD,
    departamento: fila.DEPARTAMENTO,
    estUE,
    paralelos: r2(paralelos),
    docNec: r2(docNec),
    planilla,
    egresados,
    totalNecesitados: r2(totalNecesitados),
    errorMargen: r2(errorMargen),
    atender: r2(atender),
    docenteReal: r2(docenteReal),
    docenteConMargen: r2(docenteConMargen),
    cargaHoraria,
  };
}

/** Filtra y recalcula el dataset completo */
export function procesarDataset(
  filas: FilaDocente[],
  params: ParamsModelo,
  filtroEspecialidad?: string,
  filtroDepartamento?: string
): FilaCalculada[] {
  return filas
    .filter((f) => {
      if (filtroEspecialidad && f.ESPECIALIDAD !== filtroEspecialidad) return false;
      if (filtroDepartamento && f.DEPARTAMENTO !== filtroDepartamento) return false;
      return true;
    })
    .map((f) => recalcularFila(f, params));
}

/** Suma campos numéricos de un grupo de filas */
function sumarFilas(filas: FilaCalculada[]): Omit<FilaCalculada, 'especialidad' | 'departamento' | 'cargaHoraria'> {
  return filas.reduce(
    (acc, f) => ({
      estUE: acc.estUE + f.estUE,
      paralelos: acc.paralelos + f.paralelos,
      docNec: acc.docNec + f.docNec,
      planilla: acc.planilla + f.planilla,
      egresados: acc.egresados + f.egresados,
      totalNecesitados: acc.totalNecesitados + f.totalNecesitados,
      errorMargen: acc.errorMargen + f.errorMargen,
      atender: acc.atender + f.atender,
      docenteReal: acc.docenteReal + f.docenteReal,
      docenteConMargen: acc.docenteConMargen + f.docenteConMargen,
    }),
    {
      estUE: 0, paralelos: 0, docNec: 0, planilla: 0, egresados: 0,
      totalNecesitados: 0, errorMargen: 0, atender: 0, docenteReal: 0, docenteConMargen: 0,
    }
  );
}

/** Agrupa por departamento para comparativas */
export function agruparPorDepartamento(filas: FilaCalculada[]): FilaCalculada[] {
  const mapa = new Map<string, FilaCalculada[]>();
  for (const f of filas) {
    if (!mapa.has(f.departamento)) mapa.set(f.departamento, []);
    mapa.get(f.departamento)!.push(f);
  }
  return Array.from(mapa.entries()).map(([depto, grupo]) => ({
    especialidad: 'TODOS',
    departamento: depto,
    cargaHoraria: 0,
    ...sumarFilas(grupo),
  }));
}

/** Agrupa por especialidad para gráfica de balance */
export function agruparPorEspecialidad(filas: FilaCalculada[]): FilaCalculada[] {
  const mapa = new Map<string, FilaCalculada[]>();
  for (const f of filas) {
    if (!mapa.has(f.especialidad)) mapa.set(f.especialidad, []);
    mapa.get(f.especialidad)!.push(f);
  }
  return Array.from(mapa.entries()).map(([esp, grupo]) => ({
    especialidad: esp,
    departamento: 'TODOS',
    cargaHoraria: extractCargaHoraria(esp),
    ...sumarFilas(grupo),
  }));
}

/**
 * Construye puntos de comparativa 2026 vs 2031 por departamento.
 * Calcula crecimiento porcentual y deltas absolutos.
 */
export function construirComparativa(
  filas2026: FilaCalculada[],
  filas2031: FilaCalculada[],
  departamentos: string[]
): PuntoComparativa[] {
  return departamentos.map((depto) => {
    const g26 = filas2026.filter((f) => f.departamento === depto);
    const g31 = filas2031.filter((f) => f.departamento === depto);
    const s26 = sumarFilas(g26);
    const s31 = sumarFilas(g31);
    const crecimiento = s26.docNec > 0 ? ((s31.docNec - s26.docNec) / s26.docNec) * 100 : 0;

    return {
      nombre: depto,
      docNec2026: Math.round(s26.docNec),
      docNec2031: Math.round(s31.docNec),
      deficit2026: Math.round(s26.totalNecesitados),
      deficit2031: Math.round(s31.totalNecesitados),
      docenteReal2026: Math.round(s26.docenteReal),
      docenteReal2031: Math.round(s31.docenteReal),
      crecimiento: Math.round(crecimiento * 10) / 10,
    };
  });
}

/** Recalcula una fila de Inicial, Primaria y Especial (IPE-2026) */
export function recalcularFilaIPE(fila: FilaIPE, params: ParamsIPE): FilaCalculadaIPE {
  const estUE = fila['EST UE'] ?? 0;
  const planilla = fila.PLANILLA ?? 0;
  const egresados = fila.EGRESADOS ?? 0;
  const paralelos = estUE / params.estudiantesPorParalelo;
  const total = (planilla + egresados) - paralelos;
  // Si total < 0 (déficit de docentes frente a paralelos), docenteReal = |total| / studentsPerDocReal
  const docenteReal = total < 0 ? Math.abs(total) / params.studentsPerDocReal : 0;

  return {
    especialidad: fila.ESPECIALIDAD,
    departamento: fila.DEPARTAMENTO,
    estUE,
    paralelos: r2(paralelos),
    planilla,
    egresados,
    total: r2(total),
    docenteReal: r2(docenteReal),
  };
}

/** Filtra y procesa el dataset IPE-2026 */
export function procesarDatasetIPE(
  filas: FilaIPE[],
  params: ParamsIPE,
  filtroEspecialidad?: string,
  filtroDepartamento?: string
): FilaCalculadaIPE[] {
  return filas
    .filter((f) => {
      if (filtroEspecialidad && f.ESPECIALIDAD !== filtroEspecialidad) return false;
      if (filtroDepartamento && f.DEPARTAMENTO !== filtroDepartamento) return false;
      return true;
    })
    .map((f) => recalcularFilaIPE(f, params));
}
