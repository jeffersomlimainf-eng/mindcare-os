// Fake product UI — an agenda view with today's appointments.
// Not functional; a realistic still of the app.

const mockStyles = {
  shell: {
    background: 'var(--card)',
    border: '1px solid var(--rule)',
    borderRadius: 14,
    boxShadow: '0 30px 80px -40px rgba(30,40,30,0.25), 0 6px 20px -10px rgba(30,40,30,0.08)',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    fontSize: 13,
    lineHeight: 1.45,
    color: 'var(--ink)',
  },
  sidebar: {
    background: 'var(--bg-warm)',
    borderRight: '1px solid var(--rule)',
    padding: '18px 14px',
    display: 'flex', flexDirection: 'column', gap: 22,
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: 9,
    fontFamily: 'var(--serif)', fontSize: 18, letterSpacing: '-0.01em',
    color: 'var(--ink)',
  },
  navGroup: { display: 'flex', flexDirection: 'column', gap: 2 },
  navLabel: {
    fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'var(--ink-dim)', marginBottom: 6, paddingLeft: 8,
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '7px 10px', borderRadius: 6, color: 'var(--ink-soft)',
    fontSize: 12.5,
  },
  navItemActive: {
    background: 'var(--card)', color: 'var(--ink)',
    boxShadow: '0 1px 0 var(--rule)',
  },
  main: { display: 'flex', flexDirection: 'column', minHeight: 0 },
  topbar: {
    height: 52, borderBottom: '1px solid var(--rule)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 22px',
  },
  content: { padding: '26px 28px', display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 28, alignItems: 'start' },
  dateHeader: {
    display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20,
  },
  h1: { fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' },
  sublabel: { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-dim)' },

  timeline: { position: 'relative', display: 'flex', flexDirection: 'column' },
  slot: {
    display: 'grid', gridTemplateColumns: '44px 1fr',
    minHeight: 46, borderTop: '1px dashed var(--rule)',
    alignItems: 'start', paddingTop: 6,
  },
  timeCol: { fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-dim)' },
  apt: {
    borderRadius: 6, padding: '9px 11px',
    display: 'flex', flexDirection: 'column', gap: 2,
    border: '1px solid var(--rule)',
  },

  kpi: {
    background: 'var(--bg-warm)',
    border: '1px solid var(--rule)',
    borderRadius: 10,
    padding: '14px 16px',
  },
};

function NavItem({ label, active, icon, badge }) {
  return (
    <div style={{ ...mockStyles.navItem, ...(active ? mockStyles.navItemActive : {}) }}>
      <span style={{ color: active ? 'var(--accent)' : 'var(--ink-dim)', display:'inline-flex' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-dim)' }}>{badge}</span>}
    </div>
  );
}

function MiniCalendar() {
  // Render a tiny calendar with today highlighted
  const days = ['S','T','Q','Q','S','S','D'];
  const grid = Array.from({length: 35}, (_, i) => i - 2); // Apr 2026 approx
  return (
    <div style={{
      border: '1px solid var(--rule)', borderRadius: 8, padding: '10px 12px',
      background: 'var(--card)',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 8,
      }}>
        <span style={{ fontSize: 11.5, fontWeight: 500 }}>Abril 2026</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-dim)' }}>‹ ›</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, fontSize: 10 }}>
        {days.map((d,i) => (
          <div key={i} style={{ textAlign:'center', color: 'var(--ink-dim)', fontFamily:'var(--mono)', fontSize: 9 }}>{d}</div>
        ))}
        {grid.map(n => {
          const day = n;
          const valid = day > 0 && day <= 30;
          const today = day === 17;
          const hasApt = [14,15,17,18,21,22,24,28].includes(day);
          return (
            <div key={n} style={{
              aspectRatio: '1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10.5,
              borderRadius: 4,
              color: today ? 'white' : (valid ? 'var(--ink)' : 'transparent'),
              background: today ? 'var(--accent)' : 'transparent',
              position: 'relative',
              fontWeight: today ? 500 : 400,
            }}>
              {valid ? day : ''}
              {hasApt && !today && (
                <span style={{
                  position:'absolute', bottom: 2, width: 3, height: 3, borderRadius: '50%',
                  background: 'var(--accent)',
                }}/>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Appointment({ time, name, type, tag, tone }) {
  const bg = tone === 'accent' ? 'var(--accent-soft)'
           : tone === 'butter' ? 'var(--butter)'
           : 'var(--card)';
  return (
    <div style={{ ...mockStyles.apt, background: bg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontWeight: 500, fontSize: 12.5 }}>{name}</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-dim)' }}>{time}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>{type}</span>
        {tag && <span style={{
          fontFamily: 'var(--mono)', fontSize: 9.5, padding: '1px 6px', borderRadius: 3,
          border: '1px solid var(--rule)', color: 'var(--ink-dim)',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>{tag}</span>}
      </div>
    </div>
  );
}

function ProductMock() {
  return (
    <div style={mockStyles.shell}>

      {/* Sidebar */}
      <aside style={mockStyles.sidebar}>
        <div style={mockStyles.brand}>
          <IconLogo size={18} />
          <span>Sistema PSI</span>
        </div>

        <div style={mockStyles.navGroup}>
          <span style={mockStyles.navLabel}>Clínica</span>
          <NavItem icon={<IconCalendar size={14}/>} label="Agenda" active badge="7" />
          <NavItem icon={<IconUsers size={14}/>} label="Pacientes" />
          <NavItem icon={<IconNote size={14}/>} label="Prontuários" />
          <NavItem icon={<IconVideo size={14}/>} label="Teleconsulta" />
        </div>

        <div style={mockStyles.navGroup}>
          <span style={mockStyles.navLabel}>Gestão</span>
          <NavItem icon={<IconCoin size={14}/>} label="Financeiro" />
          <NavItem icon={<IconDoc size={14}/>} label="Documentos" />
          <NavItem icon={<IconChart size={14}/>} label="Relatórios" />
        </div>

        <div style={{
          marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 9,
          padding: 8, borderTop: '1px solid var(--rule)', paddingTop: 14,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--accent-soft)', color: 'var(--accent)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600,
          }}>MR</div>
          <div style={{ fontSize: 11.5, lineHeight: 1.25 }}>
            <div style={{ fontWeight: 500 }}>Dra. Marina R.</div>
            <div style={{ fontFamily:'var(--mono)', fontSize: 9.5, color:'var(--ink-dim)' }}>CRP 06/123456</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <section style={mockStyles.main}>
        <div style={mockStyles.topbar}>
          <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
            <span style={{ fontFamily:'var(--mono)', fontSize: 10, color:'var(--ink-dim)' }}>AGENDA</span>
            <span style={{ fontSize: 12, color:'var(--ink-dim)' }}>›</span>
            <span style={{ fontSize: 12.5 }}>Esta semana</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{
              fontSize: 11.5, padding: '5px 10px', borderRadius: 999,
              border: '1px solid var(--rule)', color: 'var(--ink-soft)',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width:6, height:6, borderRadius: '50%', background: 'var(--accent)' }}/>
              Sincronizado
            </span>
            <span style={{
              fontSize: 11.5, padding: '5px 10px', borderRadius: 999,
              background: 'var(--ink)', color: 'var(--bg)',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <IconPlus size={11}/> Novo
            </span>
          </div>
        </div>

        <div style={mockStyles.content}>
          {/* Left column: today's schedule */}
          <div>
            <div style={mockStyles.dateHeader}>
              <h1 style={mockStyles.h1}>Sexta, 17 abr</h1>
              <span style={mockStyles.sublabel}>· 6 sessões · 1 vaga</span>
            </div>

            <div style={mockStyles.timeline}>
              <div style={mockStyles.slot}>
                <span style={mockStyles.timeCol}>08:00</span>
                <Appointment time="08:00 – 08:50" name="Luiza F." type="Sessão individual" tag="presencial" tone="default" />
              </div>
              <div style={mockStyles.slot}>
                <span style={mockStyles.timeCol}>09:00</span>
                <Appointment time="09:00 – 09:50" name="Rafael M." type="Terapia cognitivo-comportamental" tag="online" tone="accent" />
              </div>
              <div style={mockStyles.slot}>
                <span style={mockStyles.timeCol}>10:00</span>
                <Appointment time="10:00 – 10:50" name="Ana C." type="Avaliação inicial" tag="presencial" tone="default" />
              </div>
              <div style={mockStyles.slot}>
                <span style={mockStyles.timeCol}>11:00</span>
                <div style={{
                  fontSize: 11.5, color: 'var(--ink-dim)', fontStyle: 'italic',
                  padding: '8px 0',
                }}>vaga livre — abrir para encaixe</div>
              </div>
              <div style={mockStyles.slot}>
                <span style={mockStyles.timeCol}>14:00</span>
                <Appointment time="14:00 – 14:50" name="Família Duarte" type="Terapia de casal" tag="presencial" tone="butter" />
              </div>
              <div style={mockStyles.slot}>
                <span style={mockStyles.timeCol}>15:00</span>
                <Appointment time="15:00 – 15:50" name="Pedro H." type="Sessão de retorno" tag="online" tone="default" />
              </div>
              <div style={mockStyles.slot}>
                <span style={mockStyles.timeCol}>16:00</span>
                <Appointment time="16:00 – 16:50" name="Beatriz O." type="Sessão individual" tag="online" tone="accent" />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MiniCalendar />

            <div style={mockStyles.kpi}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-dim)', letterSpacing: '0.08em', textTransform:'uppercase' }}>
                Receita — Abril
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 28, letterSpacing: '-0.02em', marginTop: 2 }}>
                R$ 18.420
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize: 11, color:'var(--ink-dim)', marginTop: 8 }}>
                <span>▲ 12% vs. mar</span>
                <span>Meta 20k</span>
              </div>
              <div style={{ height: 4, background: 'var(--rule)', borderRadius: 999, marginTop: 6, overflow:'hidden' }}>
                <div style={{ width: '72%', height: '100%', background: 'var(--accent)' }}/>
              </div>
            </div>

            <div style={{
              border: '1px solid var(--rule)', borderRadius: 10, padding: '12px 14px',
              display: 'flex', flexDirection:'column', gap: 8,
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-dim)', letterSpacing: '0.08em', textTransform:'uppercase' }}>
                  Pendências
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-dim)' }}>3</span>
              </div>
              <div style={{ fontSize: 12, display:'flex', flexDirection:'column', gap: 6 }}>
                <div style={{ display:'flex', gap: 8, alignItems:'center' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--terracotta)' }}/>
                  <span>Evolução — Rafael M. (ontem)</span>
                </div>
                <div style={{ display:'flex', gap: 8, alignItems:'center' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--terracotta)', opacity: 0.5 }}/>
                  <span>Recibo #0482 — enviar</span>
                </div>
                <div style={{ display:'flex', gap: 8, alignItems:'center' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-dim)', opacity: 0.4 }}/>
                  <span>Confirmar retorno — Ana C.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

window.ProductMock = ProductMock;
