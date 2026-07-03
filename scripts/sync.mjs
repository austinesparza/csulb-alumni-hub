#!/usr/bin/env node
// Refreshes the embedded fallback copy from the Google Sheet, then rebuilds.
// The app already loads live sheet data on every open — run this only
// occasionally so the offline fallback doesn't fall too far behind.
//
// Usage:  node scripts/sync.mjs

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'data/config.json'), 'utf8'));
if (!config.sheetId) { console.error('No sheetId in data/config.json'); process.exit(1); }

const url = `https://docs.google.com/spreadsheets/d/${config.sheetId}/gviz/tq?tqx=out:csv`;
const res = await fetch(url);
if (!res.ok) { console.error(`Fetch failed (HTTP ${res.status}). Is the sheet shared as "Anyone with the link → Viewer"?`); process.exit(1); }
const text = await res.text();

// CSV parser (same logic as the in-app one)
const rows = [[]]; let field = '', inQ = false;
for (let i = 0; i < text.length; i++) {
  const ch = text[i];
  if (inQ) {
    if (ch === '"') { if (text[i+1] === '"') { field += '"'; i++; } else inQ = false; }
    else field += ch;
  } else if (ch === '"') inQ = true;
  else if (ch === ',') { rows[rows.length-1].push(field); field = ''; }
  else if (ch === '\n' || ch === '\r') {
    if (ch === '\r' && text[i+1] === '\n') i++;
    rows[rows.length-1].push(field); field = '';
    rows.push([]);
  } else field += ch;
}
rows[rows.length-1].push(field);
const clean = rows.filter(r => r.length > 1 || (r.length === 1 && r[0].trim() !== ''));

const header = clean[0].map(h => h.trim().toLowerCase());
const col = {}; header.forEach((h, i) => col[h] = i);
const companies = [];
for (let r = 1; r < clean.length; r++) {
  const g = (n) => (clean[r][col[n]] || '').trim();
  const company = g('company');
  if (!company) continue;
  const alums = [];
  g('alums').split(';').forEach(tok => {
    tok = tok.trim(); if (!tok) return;
    let name = '', rest = tok;
    if (tok.includes('|')) { const p = tok.split('|'); name = p[0].trim(); rest = p.slice(1).join('|'); }
    const m = rest.match(/https?:\/\/\S+/); if (!m) return;
    const url = m[0].replace(/\/+$/, '');
    alums.push(name ? { name, url } : url);
  });
  const lat = parseFloat(g('lat')), lng = parseFloat(g('lng'));
  companies.push({
    id: companies.length + 1,
    company, location: 'CA - ' + g('city'), city: g('city'), region: g('region'),
    description: g('description'), website: g('website'), industry: g('industry'),
    alumCount: alums.length, alums,
    lat: isNaN(lat) ? null : lat, lng: isNaN(lng) ? null : lng,
  });
}

if (companies.length < 10) { console.error(`Only ${companies.length} rows parsed — aborting, not overwriting companies.json`); process.exit(1); }
fs.writeFileSync(path.join(root, 'data/companies.json'), JSON.stringify(companies, null, 2));
console.log(`Synced ${companies.length} sites from the sheet → data/companies.json`);
execSync('node scripts/build.mjs', { cwd: root, stdio: 'inherit' });
