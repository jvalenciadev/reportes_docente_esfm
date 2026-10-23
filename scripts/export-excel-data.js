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

// Extract unique specialties and departments
const especialidades = [...new Set(data2031.map(r => r['ESPECIALIDAD']))].filter(Boolean);
const departamentos = [...new Set(data2031.map(r => r['DEPARTAMENTO']))].filter(Boolean);

// Extract carga horaria from specialty name (e.g. "96 HRS" -> 96)
function extractCargaHoraria(especialidad) {
  const match = especialidad?.match(/(\d+)\s*HRS/i);
  return match ? parseInt(match[1]) : 96;
}

const output = {
  especialidades,
  departamentos,
  data2026,
  data2031,
};

const outPath = path.join('./src/data', 'docentesData.json');
fs.mkdirSync('./src/data', { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');
console.log(`Exportado ${data2026.length} filas 2026 y ${data2031.length} filas 2031`);
console.log('Especialidades:', especialidades.length);
console.log('Departamentos:', departamentos);
