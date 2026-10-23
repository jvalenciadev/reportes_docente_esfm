// Fila raw del Excel (campos numéricos tal como vienen)
export interface FilaDocente {
  ESPECIALIDAD: string;
  DEPARTAMENTO: string;
  'EST UE': number;
  PARALELOS: number;
  'DOC NEC': number;
  PLANILLA: number;
  EGRESADOS: number;
  TOTAL: number;
  'ERROR 20%': number;
  'ATENDER 10%': number;
  'DOCENTE REAL': number;
  'DOCENTE CON MARGEN DE ERROR': number;
}

/** Parámetros dinámicos del modelo — todos modificables en runtime */
export interface ParamsModelo {
  /** Estudiantes por paralelo (default 35) */
  estudiantesPorParalelo: number;
  /** Horas que debe cubrir el docente por año (default 96) */
  cargaDocenteHrs: number;
  /** % de margen de error (default 20) */
  errorPct: number;
  /** % de población a atender (default 10) */
  atenderPct: number;
  /** Divisor para docente real — estudiantes que un docente adicional cubre (default 30) */
  studentsPerDocReal: number;
}

// Fila recalculada con parámetros dinámicos
export interface FilaCalculada {
  especialidad: string;
  departamento: string;
  estUE: number;
  paralelos: number;
  docNec: number;
  planilla: number;
  egresados: number;
  /** Déficit neto: docNec − (planilla + egresados). Positivo = faltan docentes */
  totalNecesitados: number;
  /** errorPct% del total necesitado */
  errorMargen: number;
  /** atenderPct% del total necesitado */
  atender: number;
  /** totalNecesitados / studentsPerDocReal */
  docenteReal: number;
  /** (totalNecesitados + errorMargen) / studentsPerDocReal */
  docenteConMargen: number;
  cargaHoraria: number;
}

// Fila raw de IPE (Inicial, Primaria, Especial 2026)
export interface FilaIPE {
  ESPECIALIDAD: string;
  DEPARTAMENTO: string;
  'EST UE': number;
  PARALELOS: number;
  PLANILLA: number;
  EGRESADOS: number;
  TOTAL: number;
  'DOCENTE REAL': number | null;
}

export interface ParamsIPE {
  estudiantesPorParalelo: number;
  studentsPerDocReal: number;
}

export interface FilaCalculadaIPE {
  especialidad: string;
  departamento: string;
  estUE: number;
  paralelos: number;
  planilla: number;
  egresados: number;
  total: number;
  docenteReal: number;
}

export interface DatasetDocentes {
  especialidades: string[];
  departamentos: string[];
  data2026: FilaDocente[];
  data2031: FilaDocente[];
  dataIPE2026: FilaIPE[];
  especialidadesIPE: string[];
  departamentosIPE: string[];
}

export type Año = '2026' | '2031';

/** Punto de comparativa entre dos años para un mismo departamento/especialidad */
export interface PuntoComparativa {
  nombre: string;
  docNec2026: number;
  docNec2031: number;
  deficit2026: number;
  deficit2031: number;
  docenteReal2026: number;
  docenteReal2031: number;
  crecimiento: number; // % de crecimiento de docNec
}
