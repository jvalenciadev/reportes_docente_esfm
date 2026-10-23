const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const wb = XLSX.readFile('./public/Proyeccion ESFM DOCENTES.xlsx');

function parseHoja(sheetName) {
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const headers = rows[0];
  const data = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[0]) continue; // skip empty rows
    const obj = {};
    headers.forEach((h, idx) => {
      if (h) obj[h] = row[idx] ?? null;
    });
    data.push(obj);
  }
  return data;
}

const data2026 = parseHoja('2026-1');
const data2031 = parseHoja('2031-1');

// Parse IPE-2026
const rawIPE = parseHoja('IPE-2026');
const dataIPE2026 = rawIPE.map(r => ({
  ESPECIALIDAD: String(r['ESPECIALIDAD'] || '').trim(),
  DEPARTAMENTO: String(r['DEPARTAMENTO'] || '').trim(),
  'EST UE': Number(r['EST UE'] || 0),
  PARALELOS: Number(r['PARALELOS'] || 0),
  PLANILLA: Number(r['PLANILLA'] || 0),
  EGRESADOS: Number(r['EGRESADOS'] || 0),
  TOTAL: Number(r['TOTAL'] || 0),
  'DOCENTE REAL': r['DOCENTE REAL'] !== null && r['DOCENTE REAL'] !== '' ? Number(r['DOCENTE REAL']) : null,
})).filter(r => r.ESPECIALIDAD && r.DEPARTAMENTO);

// Extract unique specialties and departments
const especialidades = [...new Set(data2031.map(r => r['ESPECIALIDAD']))].filter(Boolean);
const departamentos = [...new Set(data2031.map(r => r['DEPARTAMENTO']))].filter(Boolean);
const especialidadesIPE = [...new Set(dataIPE2026.map(r => r.ESPECIALIDAD))].filter(Boolean);
const departamentosIPE = [...new Set(dataIPE2026.map(r => r.DEPARTAMENTO))].filter(Boolean);

const output = {
  especialidades,
  departamentos,
  data2026,
  data2031,
  dataIPE2026,
  especialidadesIPE,
  departamentosIPE,
};

const outPath = path.join('./src/data', 'docentesData.json');
fs.mkdirSync('./src/data', { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');
console.log(`Exportado ${data2026.length} filas 2026, ${data2031.length} filas 2031 y ${dataIPE2026.length} filas IPE-2026`);
