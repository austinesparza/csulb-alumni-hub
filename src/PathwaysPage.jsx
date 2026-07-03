const INDUSTRY_KEYWORDS = {
  'Biopharma':           ['Antibodies', 'Oncology', 'Drug Discovery', 'Immunotherapy', 'Small Molecules'],
  'Med Devices':         ['Cardiac', 'Surgical', 'Implants', 'Minimally Invasive', 'Orthopedics'],
  'Diagnostics':         ['Genetic Testing', 'PCR', 'In Vitro', 'Point-of-Care', 'Liquid Biopsy'],
  'CRO / CMO':           ['Clinical Trials', 'Contract Mfg', 'Regulatory', 'GMP', 'Bioprocessing'],
  'Cell & Gene Therapy': ['CAR-T', 'CRISPR', 'Viral Vectors', 'Stem Cells', 'Gene Editing'],
  'Research Tools':      ['Reagents', 'Molecular Biology', 'Epigenetics', 'Assays', 'Lab Automation'],
  'Digital Health':      ['AI / ML', 'Health Analytics', 'Telehealth', 'Clinical Software'],
  'Agri / Env':          ['Agricultural Biotech', 'Environmental', 'Fermentation', 'Sustainable Bio'],
  'Staffing':            ['Scientific Staffing', 'Biotech Recruiting', 'Life Sciences HR'],
};

const PathwaysPage = () => {
  const mobile = useIsMobile();
  const [selectedInd, setSelectedInd] = React.useState('Biopharma');
  const [sortCos, setSortCos] = React.useState('alums');
  const totalCos = COMPANIES.length;
  const industries = INDUSTRY_LIST;
  const profiles = industries.map(ind => {
    const cos = COMPANIES.filter(c => c.industry === ind);
    const totalAlums = cos.reduce((s, c) => s + c.alumCount, 0);
    const pct = Math.round(cos.length / totalCos * 100);
    return { ind, cos, count: cos.length, totalAlums, pct };
  }).sort((a,b) => b.count - a.count);
  const selected = profiles.find(p => p.ind === selectedInd) || profiles[0];
  const selectedColor = INDUSTRY_COLOR[selectedInd] || H.green;
  const selectedBg = INDUSTRY_BG[selectedInd] || H.greenLight;
  const detailCos = [...selected.cos].sort((a,b) =>
    sortCos === 'alums' ? b.alumCount - a.alumCount : a.company.localeCompare(b.company)
  );
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding: mobile ? '14px 16px 12px' : '20px 32px 16px', flexShrink:0, borderBottom:`1px solid ${H.border}` }}>
        <HEyebrow style={{ marginBottom:4 }}>Career Pathways</HEyebrow>
        <h2 style={{ fontFamily:H.ui, fontWeight:300, fontSize: mobile ? 20 : 26, color:H.text }}>
          {mobile ? 'Life Sciences Sectors' : 'Explore SoCal Life Sciences Sectors'}
          {!mobile && <span style={{ fontFamily:H.mono, fontSize:13, color:H.textMuted, marginLeft:12, fontWeight:400 }}>
            {totalCos} companies · {COMPANIES.reduce((s,c)=>s+c.alumCount,0)} alum connections
          </span>}
        </h2>
      </div>

      {/* Tile row — horizontal scroll on mobile */}
      <div style={{ flexShrink:0, borderBottom:`1px solid ${H.border}`, background:'#fff', overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
        <div style={{ display:'flex', gap: mobile ? 8 : 10, flexWrap: mobile ? 'nowrap' : 'wrap', padding: mobile ? '12px 16px' : '16px 32px', minWidth: mobile ? 'max-content' : 'auto' }}>
          {profiles.map(p => {
            const color = INDUSTRY_COLOR[p.ind] || H.textMuted;
            const bg = INDUSTRY_BG[p.ind] || H.surface2;
            const isActive = selectedInd === p.ind;
            const w = mobile ? 110 : Math.max(90, Math.round((p.count / profiles[0].count) * 280));
            return (
              <div key={p.ind} onClick={() => setSelectedInd(p.ind)}
                style={{ width:w, flexShrink:0, padding: mobile ? '10px 12px' : '14px 16px', borderRadius:10, background:isActive?bg:'#FAFAF8', border:`2px solid ${isActive?color:H.border}`, cursor:'pointer', transition:'all 150ms', boxShadow:isActive?`0 4px 14px ${color}28`:'none', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:`${Math.max(4,p.pct*0.6)}%`, background:color, opacity:isActive?0.15:0.06 }}/>
                <div style={{ position:'relative' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:color, flexShrink:0 }}/>
                    <div style={{ fontFamily:H.ui, fontWeight:700, fontSize: mobile ? 11 : 13, color:isActive?color:H.textMid, lineHeight:1.2 }}>{p.ind}</div>
                  </div>
                  <div style={{ fontFamily:H.mono, fontSize: mobile ? 22 : 28, fontWeight:600, color:isActive?color:H.textMid, lineHeight:1, marginBottom:2 }}>{p.count}</div>
                  <div style={{ fontFamily:H.ui, fontSize:10, color:H.textMuted }}>{mobile ? 'cos' : 'companies'}</div>
                  {p.totalAlums > 0 && !mobile && (
                    <div style={{ fontFamily:H.ui, fontSize:11, fontWeight:600, color:isActive?color:H.textMuted, marginTop:4 }}>{p.totalAlums} alum links</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      <div style={{ flex:1, overflowY:'auto', background:selectedBg, paddingBottom: mobile ? 60 : 0 }}>
        <div style={{ padding: mobile ? '14px 16px 10px' : '20px 32px 14px', borderBottom:`1px solid ${selectedColor}22`, background:'#fff' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems: mobile ? 'center' : 'flex-start', flexWrap:'wrap', gap:10 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: mobile ? 0 : 8 }}>
                <div style={{ width: mobile ? 10 : 14, height: mobile ? 10 : 14, borderRadius:3, background:selectedColor }}/>
                <h3 style={{ fontFamily:H.ui, fontWeight:700, fontSize: mobile ? 17 : 22, color:selectedColor }}>{selected.ind}</h3>
                <span style={{ fontFamily:H.mono, fontSize: mobile ? 11 : 14, color:H.textMuted }}>{selected.count} cos · {selected.totalAlums} alums</span>
              </div>
              {!mobile && (
                <div style={{ display:'flex', gap:7, flexWrap:'wrap', alignItems:'center', marginTop:8 }}>
                  <span style={{ fontFamily:H.ui, fontSize:11, color:H.textMuted }}>Focus areas:</span>
                  {(INDUSTRY_KEYWORDS[selected.ind]||[]).map(kw => (
                    <span key={kw} style={{ fontFamily:H.ui, fontWeight:600, fontSize:11, padding:'4px 12px', borderRadius:999, background:`${selectedColor}14`, color:selectedColor, border:`1px solid ${selectedColor}33` }}>{kw}</span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display:'flex', gap:5 }}>
              {[['alums','Most alums'],['company','A–Z']].map(([val,label])=>(
                <button key={val} onClick={()=>setSortCos(val)} style={{ fontFamily:H.ui, fontSize:11, fontWeight:600, padding:'6px 10px', borderRadius:6, background:sortCos===val?selectedColor:'#fff', color:sortCos===val?'#fff':H.textMuted, border:`1px solid ${sortCos===val?selectedColor:H.border}`, cursor:'pointer' }}>{label}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: mobile ? '12px 16px 24px' : '16px 32px 32px', display:'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fill,minmax(280px,1fr))', gap: mobile ? 8 : 10 }}>
          {detailCos.map(c => (
            <div key={c.id}
              style={{ padding:'14px 16px', background:'#fff', borderRadius:10, border:`1px solid ${H.border}`, transition:'all 150ms' }}
              onMouseEnter={e=>{ e.currentTarget.style.border=`1px solid ${selectedColor}66`; e.currentTarget.style.boxShadow=`0 4px 12px ${selectedColor}18`; }}
              onMouseLeave={e=>{ e.currentTarget.style.border=`1px solid ${H.border}`; e.currentTarget.style.boxShadow='none'; }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, marginBottom:4 }}>
                <a href={c.website||'#'} target="_blank" rel="noopener"
                  style={{ fontFamily:H.ui, fontWeight:700, fontSize:14, color:H.text, textDecoration:'none', lineHeight:1.3, flex:1 }}
                  onMouseEnter={e=>e.target.style.color=selectedColor} onMouseLeave={e=>e.target.style.color=H.text}>
                  {c.company}
                </a>
                {c.alumCount > 0 && <span style={{ fontFamily:H.mono, fontSize:13, color:selectedColor, fontWeight:700, flexShrink:0 }}>{c.alumCount}★</span>}
              </div>
              <div style={{ fontFamily:H.ui, fontSize:12, color:H.textMuted, marginBottom:c.alums.filter(u=>u.startsWith('http')).length > 0 ? 8 : 0, lineHeight:1.4 }}>
                📍 {c.city}{c.description ? ` · ${c.description}` : ''}
              </div>
              {c.alums.filter(u=>u.startsWith('http')).length > 0 ? (
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {c.alums.filter(u=>u.startsWith('http')).map((url,i)=>(
                    <a key={i} href={url} target="_blank" rel="noopener"
                      onClick={e=>{ e.preventDefault(); window.open(url,'_blank','noopener,noreferrer'); }} style={{ fontFamily:H.ui, fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:5, background:'#0A66C2', color:'white', textDecoration:'none', cursor:'pointer' }}>
                      LinkedIn {i+1}
                    </a>
                  ))}
                </div>
              ) : (
                <div style={{ fontFamily:H.ui, fontSize:11, color:H.textMuted, fontStyle:'italic' }}>No alum connections listed yet</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
Object.assign(window, { PathwaysPage });
