import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('AlumniHub.html', 'utf8');
const errors = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'http://localhost/',
  pretendToBeVisual: true,
  beforeParse(window) {
    window.matchMedia = window.matchMedia || (() => ({ matches:false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} }));
    window.scrollTo = () => {};
    window.addEventListener('error', e => errors.push('window error: ' + e.message));
  },
});

const { window } = dom;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const clickNav = (label) => {
  const btns = [...window.document.querySelectorAll('nav button')];
  const b = btns.find(x => x.textContent.trim() === label);
  if (!b) throw new Error(`nav button "${label}" not found`);
  b.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
};

await sleep(1200);
const doc = window.document;
const bodyText = () => doc.body.textContent;

let pass = 0, fail = 0;
const check = (name, cond) => { cond ? pass++ : (fail++, console.log('FAIL:', name)); };

// Dashboard (default page)
check('renders app root', doc.getElementById('root').children.length > 0);
check('dashboard heading', bodyText().includes('SoCal Alumni Network'));
check('unique company stat (188)', bodyText().includes('188'));
check('sites label', bodyText().includes('196 sites'));
const T = window.TOTAL_ALUMS;
check('total alumni stat shown', bodyText().includes(String(T)));
check('offline footer', bodyText().includes('Offline copy'));
check('5 nav items', [...doc.querySelectorAll('nav button')].length === 5);
check('logo img present', !!doc.querySelector('img[alt*="logo"], img[alt*="Logo"], img[alt*="CSULB"]'));

// Directory
clickNav('Directory'); await sleep(300);
check('directory renders', bodyText().includes('SoCal Life Sciences'));
check('multi-site tag shown', bodyText().includes('multi-site'));
check('directory count', bodyText().includes('(196 of 196)'));

// Pathways
clickNav('Pathways'); await sleep(300);
check('pathways renders', bodyText().includes('Career Pathways') || bodyText().includes('Biopharma'));

// Alumni
clickNav('Alumni'); await sleep(300);
check('alumni page renders', bodyText().includes('CSULB Alumni in Industry'));
check('alumni count matches data', bodyText().includes(`(${T} of ${T})`));
check('linkedin links', [...doc.querySelectorAll('a[href*="linkedin.com"]')].length > 100);

// Alumni search
const input = doc.querySelector('input[aria-label="Search alumni"]');
check('alumni search input', !!input);
if (input) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, 'Zymo');
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
  await sleep(200);
  check('search filters (Zymo)', /\(\d+ of \d+\)/.test(bodyText()) && !bodyText().includes(`(${T} of ${T})`));
}

// Map (Leaflet under jsdom is best-effort; just ensure no crash on nav)
try { clickNav('Map'); await sleep(500); check('map page mounts without crash', true); }
catch (e) { check('map page mounts without crash: ' + e.message, false); }

// Back to dashboard via localStorage persistence path
clickNav('Dashboard'); await sleep(200);
check('back to dashboard', bodyText().includes('Industry Distribution'));

const realErrors = errors.filter(e => !/leaflet|_leaflet|appendChild.*null/i.test(e));
check('no unexpected window errors', realErrors.length === 0);
if (realErrors.length) console.log(realErrors.slice(0,5));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
