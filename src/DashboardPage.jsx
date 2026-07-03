const DashboardPage = ({ onNav }) => {
  const mobile = useIsMobile();
  const maxInd = INDUSTRY_COUNTS[0][1];
  const maxCity = CITY_GROUPS.slice().sort((a,b)=>b.companies.length-a.companies.length)[0].companies.length;
  const topCities = [...CITY_GROUPS].sort((a,b)=>b.companies.length-a.companies.length).slice(0,6);
  const pad = mobile ? '20px 16px' : '28px 32px';
  return (
    <div style={{ padding:pad, maxWidth:1100, paddingBottom: mobile ? '80px' : pad }}>
      <div style={{ marginBottom:20 }}>
        <HEyebrow style={{ marginBottom:6 }}>Overview</HEyebrow>
        <h1 style={{ fontFamily:H.ui, fontWeight:300, fontSize: mobile ? 24 : 30, color:H.text, lineHeight:1.1 }}>SoCal Alumni Network</h1>
        <p style={{ fontFamily:H.ui, fontSize:13, color:H.textMuted, marginTop:4 }}>CSULB alumni working across SoCal life sciences</p>
      </div>

      {/* Stats row — 2x2 on mobile, 4x1 on desktop */}
      <div style={{ display:'grid', gridTemplateColumns: mobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap:10, marginBottom:16 }}>
        <StatCard value={UNIQUE_COMPANY_COUNT} label={`SoCal companies · ${COMPANIES.length} sites`} accent={H.green} />
        <StatCard value={TOTAL_ALUMS} label="Alumni identified" accent={H.teal} />
        <StatCard value={CITY_GROUPS.length} label="Cities" accent="#C53A5A" />
        <StatCard value={INDUSTRY_COUNTS.length} label="Sectors" accent={H.gold} />
      </div>

      {/* Industry + Top companies — stacked on mobile */}
      <div style={{ display:'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap:12, marginBottom:12 }}>
        <HCard style={{ padding:'16px 18px' }}>
          <HEyebrow style={{ marginBottom:12 }}>Industry Distribution</HEyebrow>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {INDUSTRY_COUNTS.map(([ind, count]) => {
              const color = INDUSTRY_COLOR[ind] || H.textMuted;
              const pct = Math.round(count / COMPANIES.length * 100);
              return (
                <div key={ind}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <span style={{ fontFamily:H.ui, fontSize:12, color:H.textMid }}>{ind}</span>
                    <span style={{ fontFamily:H.mono, fontSize:11, color:H.textMuted }}>{count} · {pct}%</span>
                  </div>
                  <div style={{ height:5, background:H.surface3, borderRadius:3 }}>
                    <div style={{ height:'100%', width:`${count/maxInd*100}%`, background:color, borderRadius:3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </HCard>

        <HCard style={{ padding:'16px 18px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <HEyebrow>Most CSULB Alumni</HEyebrow>
            <button onClick={() => onNav('Alumni')} style={{ fontFamily:H.ui, fontSize:11, fontWeight:600, color:H.green, background:'none', border:'none', cursor:'pointer' }}>View all →</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
            {TOP_COMPANIES.map((c, i) => {
              const color = INDUSTRY_COLOR[c.industry] || H.textMuted;
              const bg = INDUSTRY_BG[c.industry] || H.surface2;
              return (
                <div key={c.company} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background: i===0 ? H.greenLight : H.surface2, borderRadius:7, border:`1px solid ${i===0 ? H.green+'44' : H.border}` }}>
                  <div style={{ fontFamily:H.mono, fontSize:11, color:i===0?H.greenDark:H.textMuted, width:18, textAlign:'right', fontWeight:600 }}>#{i+1}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:H.ui, fontSize:12, fontWeight:600, color:H.text, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{c.company}</div>
                    <div style={{ fontFamily:H.ui, fontSize:10, color:H.textMuted }}>{c.city}</div>
                  </div>
                  <span style={{ fontFamily:H.mono, fontSize:11, padding:'2px 7px', borderRadius:999, background:bg, color, flexShrink:0 }}>{c.alumCount}★</span>
                </div>
              );
            })}
          </div>
        </HCard>
      </div>

      {/* Region + Cities — stacked on mobile */}
      <div style={{ display:'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 2fr', gap:12 }}>
        <HCard style={{ padding:'16px 18px' }}>
          <HEyebrow style={{ marginBottom:12 }}>By Region</HEyebrow>
          {REGION_COUNTS.map(([region, count]) => (
            <div key={region} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:`1px solid ${H.border}` }}>
              <span style={{ fontFamily:H.ui, fontSize:12, color:H.textMid }}>{region}</span>
              <span style={{ fontFamily:H.mono, fontSize:13, color:H.green, fontWeight:600 }}>{count}</span>
            </div>
          ))}
        </HCard>
        <HCard style={{ padding:'16px 18px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <HEyebrow>Top Cities</HEyebrow>
            <button onClick={() => onNav('Map')} style={{ fontFamily:H.ui, fontSize:11, fontWeight:600, color:H.green, background:'none', border:'none', cursor:'pointer' }}>View map →</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
            {topCities.map(g => (
              <div key={g.city}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                  <span style={{ fontFamily:H.ui, fontSize:12, fontWeight:500, color:H.text }}>{g.city}</span>
                  <span style={{ fontFamily:H.mono, fontSize:11, color:H.textMuted }}>{g.companies.length} co · {g.companies.reduce((s,c)=>s+c.alumCount,0)} alums</span>
                </div>
                <div style={{ height:6, background:H.surface3, borderRadius:4 }}>
                  <div style={{ height:'100%', width:`${g.companies.length/maxCity*100}%`, background:H.green, borderRadius:4 }} />
                </div>
              </div>
            ))}
          </div>
        </HCard>
      </div>
    </div>
  );
};
Object.assign(window, { DashboardPage });
