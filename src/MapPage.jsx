const MapPage = () => {
  const mobile = useIsMobile();
  const mapContainerRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const markersRef = React.useRef({});
  const [filterInd, setFilterInd] = React.useState('All');

  const cityGroups = React.useMemo(() => Object.values(
    COMPANIES.filter(c => c.lat).reduce((acc, c) => {
      if (!acc[c.city]) acc[c.city] = { city:c.city, lat:c.lat, lng:c.lng, region:c.region, companies:[] };
      acc[c.city].companies.push(c);
      return acc;
    }, {})
  ), []);

  const addMarker = (map, g) => {
    const L = window.L;
    const indCounts = g.companies.reduce((a,c) => { a[c.industry]=(a[c.industry]||0)+1; return a; }, {});
    const domInd = Object.entries(indCounts).sort((a,b)=>b[1]-a[1])[0]?.[0];
    const color = INDUSTRY_COLOR[domInd] || H.green;
    const totalAlums = g.companies.reduce((s,c)=>s+c.alumCount, 0);
    const r = Math.max(14, Math.min(38, 10 + g.companies.length * 1.8));
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:${r*2}px;height:${r*2}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.18);display:flex;align-items:center;justify-content:center;font-family:'Quicksand',sans-serif;font-weight:700;font-size:${r>18?13:11}px;color:white;cursor:pointer;">${g.companies.length}</div>`,
      iconSize: [r*2, r*2], iconAnchor: [r, r], popupAnchor: [0, -r-4],
    });
    const marker = L.marker([g.lat, g.lng], { icon }).addTo(map).bindPopup(() => {
      const el = document.createElement('div');
      el.style.cssText = 'padding:14px 16px;min-width:220px;max-width:280px;';
      el.innerHTML = `
        <div style="font-family:'Quicksand',sans-serif;font-weight:700;font-size:15px;color:#1A2008;margin-bottom:4px">${g.city}</div>
        <div style="font-family:'Quicksand',sans-serif;font-size:12px;color:#888880;margin-bottom:10px">${g.region} · ${g.companies.length} companies · ${totalAlums} alum links</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">
          ${Object.entries(indCounts).sort((a,b)=>b[1]-a[1]).map(([ind,n])=>`<span style="font-family:'Quicksand',sans-serif;font-weight:600;font-size:10px;padding:2px 7px;border-radius:999px;background:${INDUSTRY_BG[ind]||'#EDEDE8'};color:${INDUSTRY_COLOR[ind]||'#888880'}">${ind.split(' ')[0]} ${n}</span>`).join('')}
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;max-height:160px;overflow-y:auto">
          ${g.companies.sort((a,b)=>b.alumCount-a.alumCount).map(c=>`
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 8px;background:#F7F7F4;border-radius:6px">
              <div>
                <div style="font-family:'Quicksand',sans-serif;font-weight:600;font-size:12px;color:#1A2008">${c.company}</div>
                <div style="font-family:'Quicksand',sans-serif;font-size:10px;color:#888880">${c.description||''}</div>
              </div>
              <div style="display:flex;gap:3px;flex-shrink:0">
                ${c.alums.map((url,i)=>`<a href="${url}" style="font-family:'Quicksand',sans-serif;font-size:11px;font-weight:600;padding:3px 10px;border-radius:4px;background:#0A66C2;color:white;text-decoration:none;cursor:pointer" onclick="event.preventDefault();window.open('${url}','_blank','noopener,noreferrer')">${liName(url)}</a>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `;
      return el;
    }, { maxWidth: 300 });
    markersRef.current[g.city] = marker;
  };

  React.useEffect(() => {
    if (mapInstanceRef.current || !mapContainerRef.current) return;
    const L = window.L;
    if (!L) return;
    const map = L.map(mapContainerRef.current, { center:[33.65,-117.95], zoom:9, zoomControl:true, scrollWheelZoom:true });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:'© OpenStreetMap © CARTO', subdomains:'abcd', maxZoom:19
    }).addTo(map);
    mapInstanceRef.current = map;
    cityGroups.forEach(g => addMarker(map, g));
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};
    cityGroups.forEach(g => {
      const cos = filterInd === 'All' ? g.companies : g.companies.filter(c => c.industry === filterInd);
      if (cos.length === 0) return;
      addMarker(map, { ...g, companies: cos });
    });
  }, [filterInd, cityGroups]);

  const industries = ['All', ...INDUSTRY_LIST];
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div style={{ padding: mobile ? '14px 16px 10px' : '20px 28px 14px', flexShrink:0, background:H.bg, borderBottom:`1px solid ${H.border}` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div>
            <HEyebrow style={{ marginBottom:4 }}>Geographic Distribution</HEyebrow>
            <h2 style={{ fontFamily:H.ui, fontWeight:300, fontSize:24, color:H.text }}>
              SoCal Company Map
              <span style={{ fontFamily:H.mono, fontSize:13, color:H.textMuted, marginLeft:12, fontWeight:400 }}>
                {filterInd === 'All' ? COMPANIES.length : COMPANIES.filter(c=>c.industry===filterInd).length} companies · {CITY_GROUPS.length} cities
              </span>
            </h2>
          </div>
          {filterInd !== 'All' && (
            <button onClick={()=>setFilterInd('All')} style={{ fontFamily:H.ui, fontSize:12, color:H.textMuted, background:'none', border:`1px solid ${H.border}`, borderRadius:5, padding:'6px 12px', cursor:'pointer' }}>
              Clear filter ✕
            </button>
          )}
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {industries.map(ind => {
            const active = filterInd === ind;
            const color = ind === 'All' ? H.green : (INDUSTRY_COLOR[ind] || H.textMuted);
            const bg = ind === 'All' ? H.greenLight : (INDUSTRY_BG[ind] || H.surface2);
            const count = ind === 'All' ? COMPANIES.length : COMPANIES.filter(c=>c.industry===ind).length;
            return (
              <button key={ind} onClick={() => setFilterInd(ind)} style={{
                fontFamily:H.ui, fontWeight:600, fontSize:11, padding:'5px 12px', borderRadius:999,
                background: active ? bg : '#fff', color: active ? color : H.textMuted,
                border:`1.5px solid ${active ? color : H.border}`, cursor:'pointer', transition:'all 120ms',
                display:'flex', alignItems:'center', gap:5,
              }}>
                {active && <span style={{ width:7, height:7, borderRadius:'50%', background:color, display:'inline-block' }}/>}
                {ind} <span style={{ fontFamily:H.mono, fontSize:10, opacity:0.6 }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div ref={mapContainerRef} style={{ flex:1, minHeight:0, marginBottom: mobile ? 60 : 0 }} />
    </div>
  );
};
Object.assign(window, { MapPage });
