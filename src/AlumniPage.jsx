// Alumni Hub — Alumni Directory (people-level view)
// Exports to window.AlumniPage

const AlumniPage = () => {
  const mobile = useIsMobile();
  const [search, setSearch] = React.useState('');
  const [filterInd, setFilterInd] = React.useState('All');
  const [filterRegion, setFilterRegion] = React.useState('All');

  const industries = ['All', ...INDUSTRY_LIST];
  const regions = ['All', ...REGION_COUNTS.map(([r]) => r)];

  const filtered = ALUMNI.filter(a => {
    const q = search.toLowerCase();
    const mQ = !q || a.name.toLowerCase().includes(q) || a.company.toLowerCase().includes(q) || a.city.toLowerCase().includes(q);
    const mI = filterInd === 'All' || a.industry === filterInd;
    const mR = filterRegion === 'All' || a.region === filterRegion;
    return mQ && mI && mR;
  });

  const pad = mobile ? '20px 16px' : '24px 32px';
  const selStyle = { padding:'8px 10px', border:`1px solid ${H.borderMid}`, borderRadius:6, fontFamily:H.ui, fontSize:13, color:H.textMid, background:'#fff', outline:'none' };

  return (
    <div style={{ padding:pad, maxWidth:1100, paddingBottom: mobile ? 90 : 32 }}>
      <div style={{ marginBottom:18 }}>
        <HEyebrow style={{ marginBottom:6 }}>Alumni Directory</HEyebrow>
        <h2 style={{ fontFamily:H.ui, fontWeight:300, fontSize: mobile ? 22 : 28, color:H.text }}>
          CSULB Alumni in Industry
          <span style={{ fontFamily:H.mono, fontSize:15, color:H.textMuted, marginLeft:10 }}>({filtered.length} of {ALUMNI.length})</span>
        </h2>
        <p style={{ fontFamily:H.ui, fontSize:12, color:H.textMuted, marginTop:4 }}>
          Names are parsed from LinkedIn profiles — open a profile to confirm before reaching out.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex: mobile ? '1 1 100%' : '0 0 240px' }}>
          <span aria-hidden="true" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', fontSize:13, color:H.textMuted }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, company, city…" aria-label="Search alumni"
            style={{ width:'100%', padding:'8px 12px 8px 32px', border:`1px solid ${H.borderMid}`, borderRadius:6, fontFamily:H.ui, fontSize:13, color:H.text, outline:'none', background:'#fff' }}/>
        </div>
        <select value={filterInd} onChange={e=>setFilterInd(e.target.value)} aria-label="Filter by industry" style={selStyle}>
          {industries.map(i=><option key={i}>{i}</option>)}
        </select>
        <select value={filterRegion} onChange={e=>setFilterRegion(e.target.value)} aria-label="Filter by region" style={selStyle}>
          {regions.map(r=><option key={r}>{r}</option>)}
        </select>
      </div>

      {/* Alumni cards */}
      <div style={{ display:'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap:10 }}>
        {filtered.map((a, i) => {
          const color = INDUSTRY_COLOR[a.industry] || H.textMuted;
          const bg = INDUSTRY_BG[a.industry] || H.surface2;
          const initials = a.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
          return (
            <HCard key={a.url + i} style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:12 }}>
              <div aria-hidden="true" style={{ width:36, height:36, borderRadius:'50%', background:bg, color, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:H.ui, fontWeight:700, fontSize:13, flexShrink:0 }}>{initials}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:H.ui, fontSize:13, fontWeight:600, color:H.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.name}</div>
                <div style={{ fontFamily:H.ui, fontSize:11, color:H.textMuted, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.company} · {a.city}</div>
              </div>
              <a href={a.url} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn profile of ${a.name}`}
                style={{ fontFamily:H.ui, fontSize:11, fontWeight:600, color:'#0A66C2', background:'#E8F1FA', border:'1px solid #0A66C233', padding:'5px 10px', borderRadius:6, textDecoration:'none', flexShrink:0 }}>
                LinkedIn ↗
              </a>
            </HCard>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'48px 0', fontFamily:H.ui, fontSize:13, color:H.textMuted }}>
          No alumni match these filters.
        </div>
      )}
    </div>
  );
};

Object.assign(window, { AlumniPage });
