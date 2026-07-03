// Verifies the live-sheet path: stub fetch to return a CSV with an EXTRA
// company + corrected alum name, and check the app switches to it.
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const csvRows = [
  'id,company,city,region,description,website,industry,lat,lng,alums',
];
// 11 real-ish rows + 1 new company with no lat/lng (tests city-coords fallback)
for (let i = 1; i <= 11; i++) {
  csvRows.push(`${i},Test Co ${i},Irvine,Orange County,Testing,https://example.com,Biopharma,33.68,-117.82,"Person ${i} | https://www.linkedin.com/in/person-${i}"`);
}
csvRows.push('12,Brand New Biotech,Irvine,Orange County,Novel therapies,https://newbio.com,Biopharma,,,"Corrected Name | https://www.linkedin.com/in/xy12345"');
const csv = csvRows.join('\n');

const html = fs.readFileSync('AlumniHub.html', 'utf8');
const dom = new JSDOM(html, {
  runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true,
  beforeParse(window) {
    window.fetch = async (url) => {
      if (String(url).includes('docs.google.com')) return { ok: true, status: 200, text: async () => csv };
      throw new Error('unexpected fetch: ' + url);
    };
  },
});
const w = dom.window;
const sleep = ms => new Promise(r => setTimeout(r, ms));
await sleep(1500);

const doc = w.document, body = () => doc.body.textContent;
let pass = 0, fail = 0;
const check = (n, c) => { c ? pass++ : (fail++, console.log('FAIL:', n)); };

check('live footer badge', body().includes('Live from Google Sheet'));
check('12 sites in footer', body().includes('12 sites'));
check('12 alumni in footer', body().includes('12 alumni'));

const click = l => [...doc.querySelectorAll('nav button')].find(x => x.textContent.trim() === l).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
click('Directory'); await sleep(300);
check('directory shows live rows', body().includes('Brand New Biotech'));
check('directory count 12', body().includes('(12 of 12)'));
click('Alumni'); await sleep(300);
check('curated name used', body().includes('Corrected Name'));
check('alumni count 12', body().includes('(12 of 12)'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
