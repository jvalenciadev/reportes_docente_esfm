import regression from 'regression';
import { DatoHistorico, PuntoGrafica, ResultadoProyeccion } from './types';

/**
 * Calcula proyección polinomial sobre una serie temporal histórica.
 * Aplica normalización x = año - añoBase para evitar inestabilidad numérica
 * por potencias altas de años enteros (catastrophic cancellation).
 */
export function calcularProyeccionPolinomial(
  historico: DatoHistorico[],
  añosAFuturo: number = 4,
  ordenPolinomio: number = 2
): ResultadoProyeccion {
  if (!historico || historico.length === 0) {
    throw new Error('El conjunto de datos históricos no puede estar vacío.');
  }

  // Ordenar cronológicamente
  const ordenados = [...historico].sort((a, b) => a.año - b.año);

  // Validar grado de polinomio respecto al número de puntos (evitar sistema subdeterminado)
  const gradoValido = Math.min(
    Math.max(2, Math.floor(ordenPolinomio)),
    Math.max(2, ordenados.length - 1)
  );

  const añoBase = ordenados[0].año;
  const puntosNormalizados: [number, number][] = ordenados.map((item) => [
    item.año - añoBase,
    item.estudiantes,
  ]);

  const resultadoRegresion = regression.polynomial(puntosNormalizados, {
    order: gradoValido,
    precision: 4,
  });

  const ultimoAñoHistorico = ordenados[ordenados.length - 1].año;
  const proyecciones: DatoHistorico[] = [];

  for (let step = 1; step <= añosAFuturo; step++) {
    const añoObjetivo = ultimoAñoHistorico + step;
    const xNormalizado = añoObjetivo - añoBase;
    const prediccion = resultadoRegresion.predict(xNormalizado);
    const estudiantesCalculados = Math.max(0, Math.round(prediccion[1]));

    proyecciones.push({
      año: añoObjetivo,
      estudiantes: estudiantesCalculados,
    });
  }

  // Generar puntos continuos para la gráfica
  // El último año histórico comparte valor con la línea de proyección para dar continuidad visual
  const puntosGrafica: PuntoGrafica[] = [];

  ordenados.forEach((item, index) => {
    const esUltimo = index === ordenados.length - 1;
    puntosGrafica.push({
      año: item.año,
      historico: item.estudiantes,
      proyeccion: esUltimo ? item.estudiantes : undefined,
      tipo: 'historico',
    });
  });

  proyecciones.forEach((item) => {
    puntosGrafica.push({
      año: item.año,
      historico: undefined,
      proyeccion: item.estudiantes,
      tipo: 'proyeccion',
    });
  });

  return {
    r2: Number.isFinite(resultadoRegresion.r2) ? resultadoRegresion.r2 : 0,
    ecuacion: resultadoRegresion.string,
    string: resultadoRegresion.string,
    historico: ordenados,
    proyecciones,
    puntosGrafica,
  };
}
