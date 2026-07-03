const DirectoryPage = () => {
  const mobile = useIsMobile();
  const [search, setSearch] = React.useState('');
  const [filterInd, setFilterInd] = React.useState('All');
  const [filterRegion, setFilterRegion] = React.useState('All');
  const [filterAlums, setFilterAlums] = React.useState('0');
  const [sortBy, setSortBy] = React.useState('company');
  const industries = ['All', ...INDUSTRY_LIST];
  const regions = ['All', ...Object.keys(Object.fromEntries(REGION_COUNTS))];
  const filtered = COMPANIES
    .filter(c => {
      const q = search.toLowerCase();
      const mQ = !q || c.company.toLowerCase().includes(q) || (c.description||'').toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
      const mI = filterInd === 'All' || c.industry === filterInd;
      const mR = filterRegion === 'All' || c.region === filterRegion;
      const mA = c.alumCount >= parseInt(filterAlums);
      return mQ && mI && mR && mA;
    })
    .sort((a,b) => sortBy === 'company' ? a.company.localeCompare(b.company) : b.alumCount - a.alumCount);

  const pad = mobile ? '16px' : '24px 32px';

  return (
    <div style={{ padding:pad, maxWidth:1100, display:'flex', flexDirection:'column', height:'100%', paddingBottom: mobile ? '80px' : pad }}>
      <div style={{ marginBottom:14 }}>
        <HEyebrow style={{ marginBottom:5 }}>Company Directory</HEyebrow>
        <h2 style={{ fontFamily:H.ui, fontWeight:300, fontSize: mobile ? 22 : 28, color:H.text }}>
          SoCal Life Sciences
          <span style={{ fontFamily:H.mono, fontSize:13, color:H.textMuted, marginLeft:8 }}>({filtered.length} of {COMPANIES.length})</span>
        </h2>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex: mobile ? '1 1 100%' : '0 0 240px' }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', fontSize:13, color:H.textMuted }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Company, description, city…" aria-label="Search companies"
            style={{ width:'100%', padding:'9px 12px 9px 32px', border:`1px solid ${H.borderMid}`, borderRadius:6, fontFamily:H.ui, fontSize:13, color:H.text, outline:'none', background:'#fff' }}/>
        </div>
        <select value={filterInd} onChange={e=>setFilterInd(e.target.value)} style={{ flex: mobile ? '1 1 auto' : 'none', padding:'8px 10px', border:`1px solid ${H.borderMid}`, borderRadius:6, fontFamily:H.ui, fontSize:13, color:H.textMid, background:'#fff', outline:'none' }}>
          {industries.map(i=><option key={i}>{i}</option>)}
        </select>
        <select value={filterAlums} onChange={e=>setFilterAlums(e.target.value)} style={{ flex: mobile ? '1 1 auto' : 'none', padding:'8px 10px', border:`1px solid ${H.borderMid}`, borderRadius:6, fontFamily:H.ui, fontSize:13, color:H.textMid, background:'#fff', outline:'none' }}>
          <option value="0">Any alums</option>
          <option value="1">1+ alums</option>
          <option value="2">2+ alums</option>
          <option value="3">3+ alums</option>
        </select>
        <div style={{ display:'flex', gap:5, marginLeft: mobile ? 0 : 'auto' }}>
          {[['company','A–Z'],['alums','Most alums']].map(([val,label])=>(
            <button key={val} onClick={()=>setSortBy(val)} style={{ fontFamily:H.ui, fontSize:11, fontWeight:600, padding:'6px 12px', borderRadius:5, background:sortBy===val?H.greenLight:'transparent', color:sortBy===val?H.greenDark:H.textMuted, border:`1px solid ${sortBy===val?H.green+'66':H.border}`, cursor:'pointer' }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Desktop table headers */}
      {!mobile && (
        <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1.8fr 1fr 0.8fr 1.2fr', gap:12, padding:'5px 14px', marginBottom:4, alignItems:'center' }}>
          {['Company','Description','Location','Industry','Alums'].map(h=>(
            <div key={h} style={{ fontFamily:H.ui, fontWeight:600, fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', color:H.textMuted }}>{h}</div>
          ))}
        </div>
      )}

      {/* Results */}
      <div style={{ overflowY:'auto', flex:1 }}>
        {filtered.length===0
          ? <div style={{ fontFamily:H.ui, fontSize:13, color:H.textMuted, padding:'40px 14px', textAlign:'center' }}>No companies match.</div>
          : mobile
            ? /* Mobile card layout */
              filtered.map((c,i) => {
                const color = INDUSTRY_COLOR[c.industry]||H.textMuted;
                const bg = INDUSTRY_BG[c.industry]||H.surface2;
                return (
                  <div key={c.id} style={{ padding:'12px 14px', borderRadius:8, marginBottom:8, background:'#fff', border:`1px solid ${H.border}`, boxShadow:'0 1px 4px rgba(26,32,8,0.05)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                      <a href={c.website||'#'} target="_blank" rel="noopener" style={{ fontFamily:H.ui, fontWeight:700, fontSize:14, color:H.text, textDecoration:'none', flex:1 }}>{c.company}</a>
                      <span style={{ fontFamily:H.ui, fontWeight:600, fontSize:10, padding:'2px 8px', borderRadius:999, background:bg, color, marginLeft:8, flexShrink:0 }}>{c.industry.split(' ')[0]}</span>
                    </div>
                    <div style={{ fontFamily:H.ui, fontSize:12, color:H.textMuted, marginBottom:c.alums.filter(u=>u.startsWith('http')).length > 0 ? 8 : 0 }}>
                      📍 {c.city} {c.description ? `· ${c.description}` : ''}
                    </div>
                    {c.alums.filter(u=>u.startsWith('http')).length > 0 && (
                      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                        {c.alums.filter(u=>u.startsWith('http')).map((url,j)=>(
                          <a key={j} href={url} target="_blank" rel="noopener" onClick={e=>{ e.preventDefault(); window.open(url,'_blank','noopener,noreferrer'); }} style={{ fontFamily:H.ui, fontSize:11, fontWeight:600, padding:'4px 10px', borderRadius:4, background:'#0A66C2', color:'white', textDecoration:'none', cursor:'pointer' }}>{liName(url)}</a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            : /* Desktop table layout */
              filtered.map((c,i)=>{
                const color = INDUSTRY_COLOR[c.industry]||H.textMuted;
                const bg = INDUSTRY_BG[c.industry]||H.surface2;
                return (
                  <div key={c.id} style={{ display:'grid', gridTemplateColumns:'1.6fr 1.8fr 1fr 0.8fr 1.2fr', gap:12, padding:'10px 14px', borderRadius:7, marginBottom:3, background:i%2===0?H.surface2:'transparent', border:`1px solid ${i%2===0?H.border:'transparent'}`, transition:'background 150ms', cursor:'default', alignItems:'center' }}
                    onMouseEnter={e=>e.currentTarget.style.background=H.greenLight}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?H.surface2:'transparent'}>
                    <div>
                      <a href={c.website||'#'} target="_blank" rel="noopener" style={{ fontFamily:H.ui, fontWeight:600, fontSize:13, color:H.text, textDecoration:'none' }}
                        onMouseEnter={e=>e.target.style.color=H.green} onMouseLeave={e=>e.target.style.color=H.text}>{c.company}</a>
                      <div style={{ fontFamily:H.ui, fontSize:10, color:H.textMuted, marginTop:1 }}>{c.city}{MULTISITE.has(c.company) ? ' · multi-site' : ''}</div>
                    </div>
                    <div style={{ fontFamily:H.ui, fontSize:12, color:H.textMid, alignSelf:'center', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{c.description||'—'}</div>
                    <div style={{ fontFamily:H.ui, fontSize:12, color:H.textMuted, alignSelf:'center' }}>{c.region}</div>
                    <div style={{ alignSelf:'center' }}><span style={{ fontFamily:H.ui, fontWeight:600, fontSize:10, padding:'2px 8px', borderRadius:999, background:bg, color }}>{c.industry.split(' ')[0]}</span></div>
                    <div style={{ alignSelf:'center', display:'flex', gap:4, flexWrap:'wrap' }}>
                      {c.alums.filter(u=>u.startsWith('http')).length > 0
                        ? c.alums.filter(u=>u.startsWith('http')).map((url,j)=>(
                            <a key={j} href={url}
                              onClick={e=>{ e.preventDefault(); window.open(url,'_blank','noopener,noreferrer'); }}
                              style={{ fontFamily:H.ui, fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:4, background:'#0A66C2', color:'white', textDecoration:'none', whiteSpace:'nowrap', cursor:'pointer' }}>
                              {liName(url)||`#${j+1}`}
                            </a>
                          ))
                        : <span style={{ fontFamily:H.ui, fontSize:10, color:H.textMuted }}>—</span>
                      }
                    </div>
                  </div>
                );
              })
        }
      </div>
    </div>
  );
};
Object.assign(window, { DirectoryPage });
