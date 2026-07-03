// Alumni Hub — App shell, live data loader, entry point

// localStorage can throw on file:// in some browsers — guard it.
const storage = {
  get(k) { try { return window.localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { window.localStorage.setItem(k, v); } catch {} },
};

// ─── Live data from Google Sheet ─────────────────────────────
// The sheet is the editable source of truth. This fetches it as CSV on every
// app open; if the fetch fails (offline, sheet moved, not shared), the app
// silently keeps the data that was embedded at build time.

const parseCsv = (text) => {
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
  return rows.filter(r => r.length > 1 || (r.length === 1 && r[0].trim() !== ''));
};

const rowsToData = (rows) => {
  const header = rows[0].map(h => h.trim().toLowerCase());
  const col = {}; header.forEach((h, i) => col[h] = i);
  ['company','city','region','industry','alums'].forEach(c => {
    if (!(c in col)) throw new Error(`sheet is missing the "${c}" column`);
  });
  // City → coords fallback from embedded data, for new rows without lat/lng
  const cityCoords = {};
  (window.__EMBEDDED_COMPANIES__ || []).forEach(c => { if (c.lat) cityCoords[c.city] = [c.lat, c.lng]; });

  const companies = [], names = {};
  for (let r = 1; r < rows.length; r++) {
    const g = (n) => (rows[r][col[n]] || '').trim();
    const company = g('company');
    if (!company) continue;
    const alums = [];
    g('alums').split(';').forEach(tok => {
      tok = tok.trim(); if (!tok) return;
      let name = '', rest = tok;
      if (tok.includes('|')) { const p = tok.split('|'); name = p[0].trim(); rest = p.slice(1).join('|'); }
      const m = rest.match(/https?:\/\/\S+/); if (!m) return;
      const url = m[0].replace(/\/+$/, '');
      alums.push(url);
      if (name) names[url] = name;
    });
    let lat = parseFloat(g('lat')), lng = parseFloat(g('lng'));
    if ((isNaN(lat) || isNaN(lng)) && cityCoords[g('city')]) [lat, lng] = cityCoords[g('city')];
    companies.push({
      id: companies.length + 1,
      company, city: g('city'), region: g('region'),
      description: g('description'), website: g('website'), industry: g('industry'),
      location: 'CA - ' + g('city'),
      alums, alumCount: alums.length,
      lat: isNaN(lat) ? null : lat, lng: isNaN(lng) ? null : lng,
    });
  }
  return { companies, names };
};

const loadLiveData = async () => {
  const sheetId = (window.__BUILD_INFO__ || {}).sheetId;
  if (!sheetId || typeof fetch !== 'function') return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { companies, names } = rowsToData(parseCsv(await res.text()));
    if (companies.length < 10) throw new Error('sheet returned too few rows — keeping embedded data');
    applyData(companies, names);
    return { source: 'live', count: companies.length };
  } catch (e) {
    console.warn('[AlumniHub] Live sheet unavailable, using built-in data:', e.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
};

// ─── App shell ───────────────────────────────────────────────
const PAGE_IDS = ['Dashboard','Map','Directory','Pathways','Alumni'];

const App = () => {
  const mobile = useIsMobile();
  const [page, setPage] = React.useState(() => {
    const saved = storage.get('hub_page');
    return PAGE_IDS.includes(saved) ? saved : 'Dashboard';
  });
  const [dataStatus, setDataStatus] = React.useState({ source: 'embedded' });

  React.useEffect(() => {
    let alive = true;
    loadLiveData().then(info => {
      if (alive && info) { window.__DATA_STATUS__ = info; setDataStatus(info); }
    });
    return () => { alive = false; };
  }, []);

  const navigate = (p) => { setPage(p); storage.set('hub_page', p); };
  const PageComponent = { Dashboard: DashboardPage, Map: MapPage, Directory: DirectoryPage, Pathways: PathwaysPage, Alumni: AlumniPage }[page] || DashboardPage;
  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background: H.bg }}>
      {!mobile && <HubNav activePage={page} onNav={navigate} dataStatus={dataStatus} />}
      <main style={{ flex:1, overflowY: page === 'Map' ? 'hidden' : 'auto', background: H.bg }} className={page === 'Map' ? 'map-active' : ''}>
        {/* key forces a clean remount when live data replaces embedded data */}
        <PageComponent key={dataStatus.source} onNav={navigate} />
      </main>
      {mobile && <HubNav activePage={page} onNav={navigate} dataStatus={dataStatus} />}
    </div>
  );
};
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
