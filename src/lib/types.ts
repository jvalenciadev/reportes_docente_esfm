export interface DatoHistorico {
  año: number;
  estudiantes: number;
}

export interface PuntoGrafica {
  año: number;
  historico?: number;
  proyeccion?: number;
  tipo: 'historico' | 'proyeccion';
}

export interface ResultadoProyeccion {
  r2: number;
  ecuacion: string;
  string: string;
  historico: DatoHistorico[];
  proyecciones: DatoHistorico[];
  puntosGrafica: PuntoGrafica[];
}
