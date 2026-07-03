// Alumni Hub — Navigation (desktop sidebar + mobile bottom bar)
// Exports to window.HubNav

const NavIcon = ({ name, size=15 }) => {
  const paths = {
    grid:      <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    map:       <><path d="M12 21s-7-5.1-7-11a7 7 0 1 1 14 0c0 5.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></>,
    list:      <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></>,
    layers:    <><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 12l10 5 10-5"/><path d="M2 17l10 5 10-5"/></>,
    users:     <><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17.5 14.5c2.4.4 4 2.3 4 5"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

const NAV_ITEMS = [
  { id:'Dashboard', label:'Dashboard', icon:'grid' },
  { id:'Map',       label:'Map',       icon:'map' },
  { id:'Directory', label:'Directory', icon:'list' },
  { id:'Pathways',  label:'Pathways',  icon:'layers' },
  { id:'Alumni',    label:'Alumni',    icon:'users' },
];

const BUILD = window.__BUILD_INFO__ || {};

const HubNav = ({ activePage, onNav, dataStatus }) => {
  const mobile = useIsMobile();
  const status = dataStatus || window.__DATA_STATUS__ || { source: 'embedded' };

  if (mobile) {
    return (
      <nav aria-label="Main navigation" style={{ position:'fixed', bottom:0, left:0, right:0, background:'#fff', borderTop:`1px solid ${H.border}`, display:'flex', zIndex:1000, boxShadow:'0 -2px 8px rgba(26,32,8,0.08)', paddingBottom:'env(safe-area-inset-bottom)' }}>
        {NAV_ITEMS.map(item => {
          const active = activePage === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} aria-label={item.label} aria-current={active ? 'page' : undefined} style={{
              flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              padding:'8px 4px 10px', border:'none', background:'transparent', cursor:'pointer',
              color: active ? H.greenDark : H.textMuted, transition:'all 150ms',
            }}>
              <span style={{ lineHeight:1, marginBottom:3 }}><NavIcon name={item.icon} size={18}/></span>
              <span style={{ fontFamily:H.ui, fontWeight: active ? 700 : 500, fontSize:10 }}>{item.label}</span>
              {active && <div style={{ width:20, height:2, background:H.green, borderRadius:1, marginTop:3 }}/>}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <aside style={{ width:200, background:'#fff', borderRight:`1px solid ${H.border}`, display:'flex', flexDirection:'column', height:'100vh', position:'sticky', top:0, flexShrink:0, boxShadow:'1px 0 4px rgba(26,32,8,0.04)' }}>
      {/* Logo */}
      <div style={{ padding:'20px 18px 16px', borderBottom:`1px solid ${H.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {BUILD.logo
            ? <img src={BUILD.logo} width="32" height="32" style={{ borderRadius:'50%', objectFit:'cover', display:'block' }} alt="CSULB Biotech Club logo" />
            : <div aria-hidden="true" style={{ width:32, height:32, borderRadius:'50%', background:H.greenLight, border:`1px solid ${H.green}55`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:H.ui, fontWeight:700, fontSize:12, color:H.greenDark }}>AH</div>}
          <div>
            <div style={{ fontFamily:H.ui, fontWeight:600, fontSize:12, color:H.text, lineHeight:1.2 }}>Alumni Hub</div>
            <div style={{ fontFamily:H.ui, fontWeight:400, fontSize:10, color:H.textMuted, lineHeight:1.2 }}>CSULB Biotech Club</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav aria-label="Main navigation" style={{ flex:1, padding:'12px 8px' }}>
        <div style={{ fontFamily:H.ui, fontWeight:600, fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:H.textMuted, padding:'4px 10px 8px' }}>Explore</div>
        {NAV_ITEMS.map(item => {
          const active = activePage === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} aria-current={active ? 'page' : undefined} style={{
              display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 10px',
              borderRadius:6, background: active ? H.greenLight : 'transparent',
              border: active ? `1px solid ${H.green}44` : '1px solid transparent',
              color: active ? H.greenDark : H.textMid, fontFamily:H.ui, fontWeight: active ? 600 : 500, fontSize:13,
              cursor:'pointer', marginBottom:2, transition:'all 150ms', textAlign:'left'
            }}>
              <span style={{ opacity:0.85, display:'flex' }}><NavIcon name={item.icon}/></span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding:'14px 18px', borderTop:`1px solid ${H.border}` }}>
        <div style={{ fontFamily:H.ui, fontSize:10, color:H.textMuted, lineHeight:1.5 }}>
          {status.source === 'live'
            ? <div style={{ color:H.green, fontWeight:600, marginBottom:2 }}>● Live from Google Sheet</div>
            : <div style={{ color:H.textMuted, fontWeight:600, marginBottom:2 }}>○ Offline copy · {BUILD.dataDate || '—'}</div>}
          {COMPANIES.length} sites · {TOTAL_ALUMS} alumni
        </div>
      </div>
    </aside>
  );
};

Object.assign(window, { HubNav });
