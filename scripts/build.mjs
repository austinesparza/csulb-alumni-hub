#!/usr/bin/env node
// Build script — assembles AlumniHub.html from src/ + data/companies.json.
// Output is a single self-contained file: production React, precompiled JSX,
// inlined Leaflet, inlined logo. Only network deps at runtime: Google Fonts + map tiles.
//
// Usage:  npm install && node scripts/build.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

// ── 1. Data ──────────────────────────────────────────────────
const companies = JSON.parse(read('data/companies.json'));
const config = JSON.parse(read('data/config.json'));
const logoB64 = fs.readFileSync(path.join(root, 'assets/logo.png')).toString('base64');
const dataDate = new Date().toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });

// Sanity checks — fail the build on bad data, not in the browser.
const errs = [];
companies.forEach((c, i) => {
  if (!c.company) errs.push(`row ${i}: missing company name`);
  if (typeof c.lat !== 'number' || typeof c.lng !== 'number') errs.push(`${c.company}: missing lat/lng`);
  if (!c.industry) errs.push(`${c.company}: missing industry`);
  const links = (c.alums || []).length;
  if (c.alumCount !== links) errs.push(`${c.company}: alumCount ${c.alumCount} != ${links} links`);
});
if (errs.length) { console.error('DATA ERRORS:\n' + errs.join('\n')); process.exit(1); }

// ── 2. Compile JSX (build-time Babel — nothing compiles in the browser) ──
const Babel = require('@babel/standalone');
const MODULE_ORDER = ['HubTokens', 'HubNav', 'DashboardPage', 'MapPage', 'DirectoryPage', 'PathwaysPage', 'AlumniPage', 'App'];
const compiled = MODULE_ORDER.map(name => {
  const src = read(`src/${name}.jsx`);
  try {
    const out = Babel.transform(src, { presets: ['react'], filename: `${name}.jsx` }).code;
    return `// ── ${name} ──\n${out}`;
  } catch (e) {
    console.error(`Compile error in src/${name}.jsx: ${e.message}`);
    process.exit(1);
  }
}).join('\n\n');

// ── 3. Vendor libraries (production builds, inlined) ─────────
const nm = (p) => path.join(root, 'node_modules', p);
const vendor = [
  fs.readFileSync(nm('react/umd/react.production.min.js'), 'utf8'),
  fs.readFileSync(nm('react-dom/umd/react-dom.production.min.js'), 'utf8'),
  fs.readFileSync(nm('leaflet/dist/leaflet.js'), 'utf8'),
].join('\n;\n');
const leafletCss = fs.readFileSync(nm('leaflet/dist/leaflet.css'), 'utf8');

// Escape </script> so inlined JS can't terminate its own <script> tag.
const esc = (js) => js.replace(/<\/script/gi, '<\\/script');

// ── 4. Assemble ──────────────────────────────────────────────
const dataBlock = `
window.__BUILD_INFO__ = { dataDate: ${JSON.stringify(dataDate)}, sheetId: ${JSON.stringify(config.sheetId || null)}, logo: "data:image/png;base64,${logoB64}" };
window.__EMBEDDED_COMPANIES__ = ${JSON.stringify(companies)};
`;

const html = read('src/template.html')
  .replace('/*__LEAFLET_CSS__*/', leafletCss)
  .replace('//__VENDOR__', esc(vendor))
  .replace('//__DATA__', esc(dataBlock))
  .replace('//__APP__', esc(compiled));

const out = path.join(root, 'AlumniHub.html');
fs.writeFileSync(out, html);
fs.writeFileSync(path.join(root, 'index.html'), html); // same file, for GitHub Pages
console.log(`Built AlumniHub.html + index.html (${(html.length / 1024).toFixed(0)} KB) — ${companies.length} sites, data date ${dataDate}`);
