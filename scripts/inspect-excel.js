const XLSX = require('xlsx');
const wb = XLSX.readFile('./public/Proyeccion ESFM DOCENTES.xlsx');
console.log('Hojas:', wb.SheetNames);

for (let i = 0; i < wb.SheetNames.length; i++) {
  const name = wb.SheetNames[i];
  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log(`\n=== HOJA ${i+1}: "${name}" (${data.length} filas) ===`);
  for (let r = 0; r < Math.min(5, data.length); r++) {
    console.log(`  Fila ${r}:`, JSON.stringify(data[r]));
  }
}
