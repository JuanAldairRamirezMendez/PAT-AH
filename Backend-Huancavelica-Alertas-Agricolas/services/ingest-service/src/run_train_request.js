(async ()=>{
  const fs = require('fs');
  const path = require('path');
  const bodyPath = path.join(__dirname, 'train_body_preprocessed.json');
  if(!fs.existsSync(bodyPath)){ console.error('train body not found:', bodyPath); process.exit(1); }
  const body = JSON.parse(fs.readFileSync(bodyPath,'utf8'));
  try{
    const res = await fetch('http://localhost:4000/ai/train-model', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const text = await res.text();
    console.log('Status', res.status);
    try{ console.log(JSON.parse(text)); } catch(e){ console.log(text); }
  }catch(err){ console.error('Fetch error', err.message||err); process.exit(1); }
})();
