const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

(async ()=>{
  const csvPath = path.join(__dirname, 'huancalpi_field5.csv');
  if (!fs.existsSync(csvPath)){
    console.error('CSV not found:', csvPath);
    process.exit(1);
  }

  let raw = fs.readFileSync(csvPath);
  try { raw = raw.toString('utf16le'); } catch(e){ raw = raw.toString('utf8'); }
  raw = raw.replace(/\u0000/g, '');

  const lines = raw.split(/\r?\n/).filter(l=>l.trim()!=='');
  const rawHeaders = lines[0].split(',').map(h=> (h==null?'':String(h)));
  const headers = rawHeaders.map((h,i)=> String(h || (`column_${i}`)).replace(/[\x00-\x1F\x7F]/g,'').trim());

  const dataLines = lines.slice(1);
  const rows = dataLines.map(line=>{
    const parts = line.split(',');
    const obj = {};
    headers.forEach((h,idx)=> { obj[h] = parts[idx] !== undefined ? parts[idx] : null });
    return obj;
  }).filter(r=>r.obs_date && r.obs_date.trim() !== '');

  rows.forEach(r => { r._date = new Date(String(r.obs_date)); });
  rows.sort((a,b)=> a._date - b._date);

  function toNum(v){ if (v===null || v===undefined || v==='') return NaN; const n = Number(String(v).replace(/[,\s]/g,'')); return isNaN(n)?NaN:n; }
  const targetName = 'field5';
  const values = rows.map(r => toNum(r[targetName]));

  const featureCols = ['year','month','day','field4','field6'];
  const outRows = [];
  for (let i = 0; i < rows.length; i++){
    const lag1 = i-1 >= 0 ? toNum(rows[i-1][targetName]) : NaN;
    const lag7 = i-7 >= 0 ? toNum(rows[i-7][targetName]) : NaN;
    let roll7 = NaN;
    if (i-7 >= 0){
      const slice = values.slice(i-7, i).map(x=>isNaN(x)?null:x).filter(x=>x!==null);
      if (slice.length === 7) roll7 = slice.reduce((a,b)=>a+b,0)/slice.length;
    }

    const target = toNum(rows[i][targetName]);
    if (isNaN(target)) continue;
    if (isNaN(lag1) || isNaN(lag7) || isNaN(roll7)) continue;

    const out = {};
    featureCols.forEach(c => { out[c] = toNum(rows[i][c]); });
    out.lag1_field5 = lag1;
    out.lag7_field5 = lag7;
    out.roll7_field5 = roll7;
    const d = rows[i]._date;
    const start = new Date(d.getFullYear(),0,0);
    const diff = d - start + ((start.getTimezoneOffset() - d.getTimezoneOffset())*60*1000);
    const dayOfYear = Math.floor(diff / (1000*60*60*24));
    out.dayOfYear = dayOfYear;
    out.field5 = target;

    const ok = Object.keys(out).every(k => k==='field5' ? true : !isNaN(out[k]));
    if (!ok) continue;
    outRows.push(out);
  }

  if (outRows.length < 20){
    console.error('Too few preprocessed rows:', outRows.length);
    process.exit(1);
  }

  const featureNames = Object.keys(outRows[0]).filter(k=>k!=='field5');
  const stats = {};
  featureNames.forEach(fn=>{
    const vals = outRows.map(r=>r[fn]);
    const mean = vals.reduce((a,b)=>a+b,0)/vals.length;
    const std = Math.sqrt(vals.reduce((s,x)=>s+Math.pow(x-mean,2),0)/vals.length);
    stats[fn] = { mean, std: std || 1 };
  });

  const normalizedRows = outRows.map(r=>{
    const o = {};
    featureNames.forEach(fn=>{ o[fn] = (r[fn] - stats[fn].mean) / stats[fn].std });
    o.field5 = r.field5;
    return o;
  });

  const outCsvPath = path.join(__dirname, 'huancalpi_field5_preprocessed.csv');
  const header = [...featureNames, 'field5'];
  const outLines = [header.join(',')];
  normalizedRows.forEach(r=>{
    const line = header.map(h=> String(r[h]));
    outLines.push(line.join(','));
  });
  fs.writeFileSync(outCsvPath, outLines.join('\n'));
  console.log('WROTE', outCsvPath, 'rows:', normalizedRows.length);

  fs.writeFileSync(path.join(__dirname,'preprocess_scaler.json'), JSON.stringify(stats, null, 2));

  const csvAbs = path.join(__dirname, 'huancalpi_field5_preprocessed.csv').replace(/\\/g,'/');
  const xlsxAbs = path.join(__dirname, 'huancalpi_field5_preprocessed.xlsx').replace(/\\/g,'/');
  console.log('Converting CSV to XLSX...');
  let XLSX;
  try {
    XLSX = require('xlsx');
  } catch (e) {
    console.log('`xlsx` not installed locally — installing temporarily (no-save)...');
    execSync('npm install xlsx --no-save', { cwd: __dirname, stdio: 'inherit' });
    XLSX = require('xlsx');
  }
  const csvContent = fs.readFileSync(csvAbs, 'utf8');
  const aoa = csvContent.split(/\r?\n/).filter(l=>l!=='').map(l=>l.split(','));
  const wb = XLSX.utils.book_new();
  wb.SheetNames.push('Sheet1');
  wb.Sheets['Sheet1'] = XLSX.utils.aoa_to_sheet(aoa);
  XLSX.writeFile(wb, xlsxAbs);
  console.log('WROTE', xlsxAbs);

  // Use ai-service on port 3003
  const AI_BASE = process.env.AI_BASE || 'http://localhost:3003/api/ai';

  const uploadCmd = `curl.exe -s -X POST ${AI_BASE}/upload-excel -F file=@"${xlsxAbs}"`;
  console.log('Uploading to', AI_BASE + '/upload-excel');
  const uploadOut = execSync(uploadCmd, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  console.log('Upload response:', uploadOut);
  const uploadJson = JSON.parse(uploadOut);
  const filePath = uploadJson.fileInfo.path;

  const trainBody = {
    filePath: filePath,
    targetColumn: 'field5',
    featureColumns: featureNames,
    modelType: 'multivariate',
    modelName: 'huancalpi_preprocessed_v1',
    missingValues: [],
    valSplit: 0.15,
    testSplit: 0.15,
    seed: 42
  };

  const trainBodyPath = path.join(__dirname, 'train_body_preprocessed.json');
  fs.writeFileSync(trainBodyPath, JSON.stringify(trainBody, null, 2));

  const trainCmd = `curl.exe -v -X POST "${AI_BASE}/train-model" -H "Content-Type: application/json" --data-binary @"${trainBodyPath}"`;
  console.log('Calling', AI_BASE + '/train-model');
  const trainOut = execSync(trainCmd, { encoding: 'utf8', stdio: 'pipe', maxBuffer: 20 * 1024 * 1024 });
  console.log('Train response:', trainOut);

})();
