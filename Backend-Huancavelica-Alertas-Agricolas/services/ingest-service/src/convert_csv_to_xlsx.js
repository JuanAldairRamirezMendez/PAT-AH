const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'huancalpi_field5_preprocessed.csv');
const outPath = path.join(__dirname, 'huancalpi_field5_preprocessed.xlsx');

if (!fs.existsSync(csvPath)){
  console.error('CSV not found:', csvPath);
  process.exit(1);
}

const csv = fs.readFileSync(csvPath, 'utf8');
const aoa = csv.split(/\r?\n/).filter(l=>l!=='').map(l=>l.split(','));
const wb = XLSX.utils.book_new();
wb.SheetNames.push('Sheet1');
wb.Sheets['Sheet1'] = XLSX.utils.aoa_to_sheet(aoa);
XLSX.writeFile(wb, outPath);
console.log('WROTE', outPath);
