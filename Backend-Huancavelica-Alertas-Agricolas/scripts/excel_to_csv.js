const path = require('path');
let XLSX;
try {
  XLSX = require('xlsx');
} catch (e) {
  // Fallback to look for xlsx in graphql-backend node_modules (when running from project root)
  try {
    XLSX = require(path.join(process.cwd(), 'node_modules', 'xlsx'));
  } catch (e2) {
    throw e;
  }
}
const fs = require('fs');

if (process.argv.length < 3) {
  console.error('Usage: node excel_to_csv.js <file.xlsx>');
  process.exit(2);
}

const input = process.argv[2];
if (!fs.existsSync(input)) {
  console.error('File not found:', input);
  process.exit(2);
}

try {
  const workbook = XLSX.readFile(input);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ',', RS: '\n' });

  const outDir = path.dirname(input);
  const base = path.basename(input, path.extname(input));
  const csvPath = path.join(outDir, base + '.csv');

  fs.writeFileSync(csvPath, csv, 'utf8');

  // compute headers and row count
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const headers = lines.length > 0 ? lines[0].split(',').map(h => h.trim()) : [];
  const rowCount = Math.max(0, lines.length - 1);

  console.log(JSON.stringify({ csvPath, headers, rowCount }, null, 2));
} catch (err) {
  console.error('Error converting Excel:', err.message);
  process.exit(1);
}
