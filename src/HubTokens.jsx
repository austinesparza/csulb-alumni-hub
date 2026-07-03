const H = {
  bg:        '#FDFBF6',
  surface:   '#FFFFFF',
  surface2:  '#F7F7F4',
  surface3:  '#EDEDE8',
  border:    '#EDEDE8',
  borderMid: '#D8D8D0',
  text:      '#1A2008',
  textMid:   '#444440',
  textMuted: '#888880',
  teal:      '#075672',
  tealDim:   '#054458',
  tealGlow:  'rgba(7,86,114,0.07)',
  gold:      '#F5C04A',
  goldDim:   '#E5AB38',
  green:     '#8DC63F',
  greenLight:'#F2F9E8',
  greenDark: '#6B9E35',
  ink:       '#1A2008',
  biopharma:   '#C53A5A',
  diagnostics: '#2A6EBF',
  devices:     '#5B3DB0',
  research:    '#1E7A50',
  cro:         '#B07820',
  digital:     '#0A7A94',
  agri:        '#527A28',
  staffing:    '#606058',
  ui:   "'Quicksand', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

const INDUSTRY_COLOR = {
  'Biopharma':          H.biopharma,
  'Diagnostics':        H.diagnostics,
  'Med Devices':        H.devices,
  'Research Tools':     H.research,
  'CRO / CMO':          H.cro,
  'Digital Health':     H.digital,
  'Agri / Env':         H.agri,
  'Staffing':           H.staffing,
  'Cell & Gene Therapy':'#943030',
};

const INDUSTRY_BG = {
  'Biopharma':          '#FFF0F3',
  'Diagnostics':        '#E6F0FF',
  'Med Devices':        '#F0EEFF',
  'Research Tools':     '#EAFAF3',
  'CRO / CMO':          '#FFF8E6',
  'Digital Health':     '#E6F6FF',
  'Agri / Env':         '#F2F9E8',
  'Staffing':           '#F7F7F4',
  'Cell & Gene Therapy':'#FFF0F0',
};

// ─── Category normalization ──────────────────────────────────
// Sheet editors make typos; map "biopharma", "Med Device", "CRO/CMO" etc.
// onto the canonical names so categories never silently fragment.
const REGIONS = ['Orange County', 'San Diego', 'LA - East / SGV', 'LA - South Bay / LBC', 'LA - West / Valley', 'Ventura / SB', 'Central CA', 'Other SoCal'];

const canonKey = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const CANON_INDUSTRY = {};
Object.keys(INDUSTRY_COLOR).forEach(k => CANON_INDUSTRY[canonKey(k)] = k);
Object.assign(CANON_INDUSTRY, {
  meddevice: 'Med Devices', medicaldevice: 'Med Devices', medicaldevices: 'Med Devices', device: 'Med Devices', devices: 'Med Devices',
  cro: 'CRO / CMO', cmo: 'CRO / CMO', cdmo: 'CRO / CMO',
  diagnostic: 'Diagnostics', dx: 'Diagnostics',
  pharma: 'Biopharma', biopharmaceutical: 'Biopharma', biotech: 'Biopharma',
  researchtool: 'Research Tools', tools: 'Research Tools',
  cellgene: 'Cell & Gene Therapy', genetherapy: 'Cell & Gene Therapy', celltherapy: 'Cell & Gene Therapy',
  agrienv: 'Agri / Env', agriculture: 'Agri / Env', environmental: 'Agri / Env',
  digitalhealth: 'Digital Health', healthtech: 'Digital Health',
});
const CANON_REGION = {};
REGIONS.forEach(r => CANON_REGION[canonKey(r)] = r);
Object.assign(CANON_REGION, {
  oc: 'Orange County', sd: 'San Diego', sandiegocounty: 'San Diego',
  laeast: 'LA - East / SGV', sgv: 'LA - East / SGV', sangabrielvalley: 'LA - East / SGV',
  lasouthbay: 'LA - South Bay / LBC', southbay: 'LA - South Bay / LBC', longbeach: 'LA - South Bay / LBC', lbc: 'LA - South Bay / LBC',
  lawest: 'LA - West / Valley', valley: 'LA - West / Valley', sanfernandovalley: 'LA - West / Valley',
  ventura: 'Ventura / SB', santabarbara: 'Ventura / SB', venturasb: 'Ventura / SB',
  centralca: 'Central CA', centralcalifornia: 'Central CA',
  socal: 'Other SoCal', other: 'Other SoCal',
});
const canonIndustry = (v) => CANON_INDUSTRY[canonKey(v)] || String(v || '').trim();
const canonRegion = (v) => CANON_REGION[canonKey(v)] || String(v || '').trim();

// ─── LinkedIn name handling ──────────────────────────────────
// ALUM_NAMES maps profile URL → curated name (from the Google Sheet or
// embedded data). liName falls back to parsing the URL slug.
let ALUM_NAMES = {};

const LI_CREDS = new Set(['phd','md','mba','ms','msc','mb','ascp','cgmbs','rn','np','pa','cls','mt','mph','jd','pe','pmp','cpa','ii','iii']);
const liNameFromSlug = (url) => {
  try {
    const slug = (url.split('/in/')[1] || '').replace(/\/$/, '');
    const parts = slug.split('-').filter(p => {
      if (!p) return false;
      if (/^\d+$/.test(p)) return false;
      if (/^[a-z]{1,3}\d+[a-z0-9]*$/.test(p)) return false;
      if (/^[a-z]+\d+[a-z0-9]*$/.test(p) && p.length > 5) return false;
      if (LI_CREDS.has(p.toLowerCase())) return false;
      return true;
    });
    const name = parts.slice(0, 2).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    return name || 'View Profile';
  } catch { return 'View Profile'; }
};
const liName = (url) => ALUM_NAMES[url] || liNameFromSlug(url);

// ─── Data + derived aggregates ───────────────────────────────
// Starts with the embedded (build-time) copy; applyData() re-derives
// everything when live Google Sheet data arrives.
let COMPANIES, TOTAL_ALUMS, INDUSTRY_COUNTS, TOP_COMPANIES, CITY_GROUPS,
    REGION_COUNTS, UNIQUE_COMPANY_COUNT, MULTISITE, ALUMNI, INDUSTRY_LIST;

// Colors for categories that don't have a curated color yet — assigned
// deterministically so a new sheet category gets a stable, readable color
// with zero code changes.
const SPARE_COLORS = ['#7A3E9D','#1F6F8B','#A4552E','#3E7A5E','#8B2252','#4A5FA5','#867018','#5E5A8F'];
const SPARE_BGS    = ['#F5EDFA','#E8F4F8','#FBEFE8','#EAF5EF','#FAEAF1','#EDF0FA','#F7F4E2','#EEEDF7'];
const hashStr = (s) => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const ensureIndustryColor = (ind) => {
  if (INDUSTRY_COLOR[ind]) return;
  const i = hashStr(ind) % SPARE_COLORS.length;
  INDUSTRY_COLOR[ind] = SPARE_COLORS[i];
  INDUSTRY_BG[ind] = SPARE_BGS[i];
  CANON_INDUSTRY[canonKey(ind)] = ind;
};

function applyData(list, names) {
  if (names) ALUM_NAMES = { ...ALUM_NAMES, ...names };

  // Normalize categories and alums; object alum entries may carry curated names.
  list.forEach(c => {
    c.company = String(c.company || '').trim();
    c.city = String(c.city || '').trim();
    c.industry = canonIndustry(c.industry);
    c.region = canonRegion(c.region);
    if (!c.industry) console.warn(`[AlumniHub] Missing industry for "${c.company}" — check the sheet`);
    else if (!INDUSTRY_COLOR[c.industry]) {
      console.info(`[AlumniHub] New industry "${c.industry}" (${c.company}) — auto-assigned a color`);
      ensureIndustryColor(c.industry);
    }
    if (!c.region) console.warn(`[AlumniHub] Missing region for "${c.company}" — check the sheet`);
    c.alums = (c.alums || []).map(a => {
      const raw = typeof a === 'string' ? a : (a && a.url) || '';
      const url = ((raw.match(/https?:\/\/\S+/) || [''])[0]).replace(/\/+$/, '');
      if (url && a && typeof a === 'object' && a.name) ALUM_NAMES[url] = a.name;
      return url;
    }).filter(u => u.startsWith('http'));
    c.alums = [...new Set(c.alums)]; // same person listed twice in one cell
    c.alumCount = c.alums.length;
  });

  COMPANIES = list;
  TOTAL_ALUMS = COMPANIES.reduce((s,c) => s + c.alumCount, 0);
  INDUSTRY_COUNTS = Object.entries(
    COMPANIES.reduce((a,c) => { a[c.industry]=(a[c.industry]||0)+1; return a; }, {})
  ).sort((a,b)=>b[1]-a[1]);
  TOP_COMPANIES = [...COMPANIES].sort((a,b)=>b.alumCount-a.alumCount).slice(0,6);
  CITY_GROUPS = Object.values(
    COMPANIES.filter(c=>c.lat).reduce((acc,c) => {
      if (!acc[c.city]) acc[c.city] = { city:c.city, lat:c.lat, lng:c.lng, region:c.region, companies:[] };
      acc[c.city].companies.push(c);
      return acc;
    }, {})
  );
  REGION_COUNTS = Object.entries(
    COMPANIES.reduce((a,c) => { a[c.region]=(a[c.region]||0)+1; return a; }, {})
  ).sort((a,b)=>b[1]-a[1]);
  INDUSTRY_LIST = INDUSTRY_COUNTS.map(([i]) => i);
  UNIQUE_COMPANY_COUNT = new Set(COMPANIES.map(c => c.company)).size;
  MULTISITE = (() => {
    const n = {};
    COMPANIES.forEach(c => { n[c.company] = (n[c.company]||0)+1; });
    return new Set(Object.keys(n).filter(k => n[k] > 1));
  })();
  ALUMNI = COMPANIES.flatMap(c =>
    c.alums.map(u => ({ name: liName(u), url: u, company: c.company, city: c.city, region: c.region, industry: c.industry }))
  ).sort((a,b) => a.name.localeCompare(b.name));

  Object.assign(window, { COMPANIES, TOTAL_ALUMS, TOP_COMPANIES, INDUSTRY_COUNTS, REGION_COUNTS, CITY_GROUPS, UNIQUE_COMPANY_COUNT, MULTISITE, ALUMNI, INDUSTRY_LIST });
}

applyData(window.__EMBEDDED_COMPANIES__ || []);

// ─── Shared components ───────────────────────────────────────
const HCard = ({ children, style={} }) => (
  <div style={{ background: H.surface, border: `1px solid ${H.border}`, borderRadius: 10, boxShadow:'0 2px 8px rgba(26,32,8,0.06)', ...style }}>{children}</div>
);
const HEyebrow = ({ children, color=H.textMuted, style={} }) => (
  <div style={{ fontFamily: H.ui, fontWeight:600, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color, ...style }}>{children}</div>
);
const HBadge = ({ children, industry }) => {
  const color = INDUSTRY_COLOR[industry] || H.textMuted;
  const bg = INDUSTRY_BG[industry] || H.surface2;
  return (
    <span style={{ fontFamily:H.ui, fontWeight:600, fontSize:11, padding:'2px 8px', borderRadius:999,
      background:bg, color, border:`1px solid ${color}33` }}>{children}</span>
  );
};
const StatCard = ({ value, label, accent=H.green, delta }) => (
  <HCard style={{ padding:'20px 22px' }}>
    <div style={{ fontFamily:H.mono, fontWeight:400, fontSize:30, color:accent, lineHeight:1 }}>{value}</div>
    {delta && <div style={{ fontFamily:H.ui, fontSize:11, color:H.green, marginTop:4 }}>↑ {delta}</div>}
    <div style={{ fontFamily:H.ui, fontWeight:500, fontSize:12, color:H.textMuted, marginTop:8 }}>{label}</div>
  </HCard>
);

const useIsMobile = () => {
  const [mobile, setMobile] = React.useState(window.innerWidth < 640);
  React.useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return mobile;
};

Object.assign(window, { H, INDUSTRY_COLOR, INDUSTRY_BG, liName, applyData, HCard, HEyebrow, HBadge, StatCard, useIsMobile });
