// ──────────────────────────────────────────────────────────────
// Section components
// ──────────────────────────────────────────────────────────────

const sectionStyles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '28px 0', position: 'sticky', top: 0, zIndex: 50,
    background: 'color-mix(in oklab, var(--bg) 88%, transparent)',
    backdropFilter: 'saturate(140%) blur(12px)',
    borderBottom: '1px solid transparent',
  },
  navInner: { maxWidth: 1360, margin: '0 auto', padding: '0 var(--pad-x)', width: '100%', display:'flex', justifyContent:'space-between', alignItems:'center' },
  navBrand: { display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--serif)', fontSize: 20, letterSpacing:'-0.01em' },
  navLinks: { display: 'flex', gap: 30, fontSize: 13.5 },
  navLink: { textDecoration: 'none', color: 'var(--ink-soft)' },
};

// ── NAV ────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav style={sectionStyles.nav}>
      <div style={sectionStyles.navInner}>
        <a href="#" style={{ ...sectionStyles.navBrand, color: 'var(--ink)', textDecoration: 'none' }}>
          <IconLogo size={22} />
          <span>Meu Sistema <span style={{ fontStyle: 'italic' }}>PSI</span></span>
        </a>
        <div style={sectionStyles.navLinks}>
          <a href="#produto" style={sectionStyles.navLink}>Produto</a>
          <a href="#seguranca" style={sectionStyles.navLink}>Segurança</a>
          <a href="#precos" style={sectionStyles.navLink}>Preços</a>
          <a href="#depoimentos" style={sectionStyles.navLink}>Depoimentos</a>
          <a href="#faq" style={sectionStyles.navLink}>FAQ</a>
        </div>
        <div style={{ display:'flex', gap: 12, alignItems:'center' }}>
          <a href="#" style={{ fontSize: 13.5, color: 'var(--ink-soft)', textDecoration: 'none' }}>Entrar</a>
          <a href="#precos" className="btn" style={{ padding: '9px 16px', fontSize: 13 }}>
            Testar grátis <IconArrow />
          </a>
        </div>
      </div>
    </nav>
  );
}

// ── RING (curved rotating text) ───────────────────────────────
function Ring({ className, radius, text, repeat = 3, sepIcon, size = 14, durationSec = 80, startDeg = 0, reverse }) {
  // Build sequence: (text + "  " + icon + "  ") repeated.
  const unit = text.split('').concat(['\u00A0','\u00A0','__ICON__','\u00A0','\u00A0']);
  const chars = [];
  for (let i = 0; i < repeat; i++) chars.push(...unit);
  const total = chars.length;
  // Spread evenly around 360°
  const step = 360 / total;
  return (
    <div className={`ring ${className} ${reverse ? 'reverse' : ''}`}
         style={{ '--dur': `${durationSec}s` }}>
      <div className="ring-text" style={{ '--r': `${radius}px` }}>
        {chars.map((ch, i) => {
          const angle = startDeg + i * step;
          const isIcon = ch === '__ICON__';
          return (
            <span key={i}
                  className={`ring-char ${isIcon ? 'icon' : ''}`}
                  style={{
                    '--a': `${angle}deg`,
                    '--r': `${radius}px`,
                    fontSize: isIcon ? size + 2 : size,
                  }}>
              {isIcon ? sepIcon : ch}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── HERO ───────────────────────────────────────────────────────
function Hero() {
  const dustRef = React.useRef(null);
  React.useEffect(() => {
    // Generate dust particles
    const el = dustRef.current; if (!el) return;
    for (let i = 0; i < 20; i++) {
      const s = document.createElement('span');
      s.style.left = Math.random() * 100 + '%';
      s.style.bottom = -Math.random() * 30 + 'px';
      s.style.animationDuration = (10 + Math.random() * 14) + 's';
      s.style.animationDelay = -Math.random() * 15 + 's';
      s.style.opacity = String(0.3 + Math.random() * 0.6);
      el.appendChild(s);
    }
  }, []);

  // Icons for rings — simple unicode glyphs (no FA dependency)
  const micIcon = '◉';
  const personIcon = '◈';
  const lockIcon = '✦';
  const leafIcon = '✧';

  // Ring sizes relative to orb (in px at 720px radius baseline, orb ~1200px)
  // We use a fixed 720px coordinate space — the orb scales externally via vmin.
  // The ring-text is positioned at center; its children rotate around origin at radius var(--r).
  return (
    <section className="hero-wrap">
      <div className="dust" ref={dustRef}/>

      {/* ORB */}
      <div className="orb">
        <Ring className="r1"
              radius={560} text="DA SESSÃO AO PRONTUÁRIO SEM TOCAR NO TECLADO"
              repeat={3} sepIcon={micIcon} durationSec={90} startDeg={-18} size={15} />
        <Ring className="r2 reverse"
              radius={470} text="SUPORTE QUE CAMINHA COM VOCÊ"
              repeat={4} sepIcon={personIcon} durationSec={70} startDeg={8} reverse size={14}/>
        <Ring className="r3"
              radius={385} text="SEGURANÇA QUE INSPIRA CONFIANÇA"
              repeat={3} sepIcon={lockIcon} durationSec={100} startDeg={-4} size={13}/>
        <Ring className="r4 reverse"
              radius={300} text="INTUITIVA DE VERDADE · CLÍNICO PRIMEIRO"
              repeat={2} sepIcon={leafIcon} durationSec={60} startDeg={12} reverse size={12}/>

        <div className="orb-bubble">
          <span className="orb-bubble-sheen"/>
          <div className="orb-logo">
            ψ
            <span className="small">SISTEMA PSI</span>
          </div>
        </div>
      </div>

      {/* Nav on top */}
      <div style={{ position:'relative', zIndex: 10 }}>
        <HeroNav />
      </div>

      {/* Text content, left-aligned */}
      <div className="page" style={{
        position: 'relative', zIndex: 5,
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 60, alignItems: 'center',
        minHeight: 'calc(92vh - 100px)',
        paddingBottom: 60, paddingTop: 40,
      }}>
        <div style={{ display:'flex', flexDirection:'column', gap: 30, maxWidth: 560 }}>
          <div className="fade-up" style={{ display:'flex', alignItems:'center', gap: 12 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--accent-glow)',
              boxShadow: '0 0 14px var(--accent-glow)',
              animation: 'bubble-breathe 2.4s ease-in-out infinite',
            }}/>
            <span className="mono" style={{ color: 'oklch(95% 0.01 60 / 0.75)' }}>
              Sistema clínico · pt-BR · beta aberto
            </span>
          </div>

          <h1 className="serif fade-up d1" style={{
            margin: 0,
            fontSize: 'clamp(54px, 6.2vw, 96px)',
            lineHeight: 0.98,
            letterSpacing: '-0.028em',
            color: 'var(--hero-ink)',
            textWrap: 'balance',
          }}>
            O consultório<br/>
            <span className="italic" style={{ color: 'oklch(75% 0.05 50)' }}>que pensa</span><br/>
            com você.
          </h1>

          <p className="fade-up d2" style={{
            fontSize: 18, lineHeight: 1.55,
            color: 'oklch(88% 0.015 60)',
            margin: 0, maxWidth: 480,
          }}>
            Agenda, prontuário, evolução, financeiro e teleconsulta — um só fluxo,
            feito para psicólogas e psicólogos brasileiros. Em conformidade com a
            <span style={{ color: 'var(--hero-ink)' }}> Resolução CFP 11/2018</span> e a
            <span style={{ color: 'var(--hero-ink)' }}> LGPD</span>.
          </p>

          <div className="fade-up d3" style={{ display:'flex', gap: 12, alignItems:'center', flexWrap:'wrap' }}>
            <a href="#" className="btn" style={{
              background: 'var(--accent-glow)', borderColor: 'var(--accent-glow)', color: 'white',
              boxShadow: '0 10px 40px -10px var(--accent-glow)',
            }}>Começar 14 dias grátis <IconArrow/></a>
            <a href="#produto" className="btn ghost" style={{
              color: 'var(--hero-ink)', borderColor: 'oklch(100% 0 0 / 0.2)',
            }}>Ver o produto</a>
          </div>

          <div className="fade-up d4" style={{
            display:'flex', gap: 28, paddingTop: 14,
            borderTop: '1px solid oklch(100% 0 0 / 0.1)', marginTop: 10,
          }}>
            {[
              ['2.400+','psicólogos'],
              ['180k','sessões/mês'],
              ['99,98%','uptime'],
              ['AES-256','criptografia'],
            ].map(([b,s]) => (
              <div key={b}>
                <div className="serif" style={{ fontSize: 26, letterSpacing:'-0.02em', color: 'var(--hero-ink)' }}>{b}</div>
                <div style={{ fontSize: 11, color: 'oklch(75% 0.015 60)', marginTop: 2 }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
        <div/>
      </div>

      {/* Bottom scroll cue */}
      <div style={{
        position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, display: 'flex', flexDirection:'column', alignItems:'center', gap: 8,
        color: 'oklch(85% 0.01 60 / 0.6)', fontFamily: 'var(--mono)', fontSize: 10,
        letterSpacing: '0.2em', textTransform: 'uppercase',
      }}>
        <span>role para explorar</span>
        <span style={{
          width: 1, height: 36, background: 'oklch(100% 0 0 / 0.3)',
          animation: 'bubble-breathe 2.6s ease-in-out infinite',
        }}/>
      </div>
    </section>
  );
}

// Hero-variant Nav (light links on dark)
function HeroNav() {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', padding: '28px 0',
    }}>
      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '0 var(--pad-x)', width: '100%',
                    display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <a href="#" style={{
          display:'flex', alignItems:'center', gap: 10,
          fontFamily:'var(--serif)', fontSize: 22, letterSpacing:'-0.01em',
          color: 'var(--hero-ink)', textDecoration:'none',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          <span style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 28%, oklch(100% 0 0 / 0.5), transparent 25%), linear-gradient(150deg, var(--accent-glow), color-mix(in oklab, var(--accent-glow) 70%, black))',
            boxShadow: 'inset 0 1px 4px oklch(100% 0 0 / 0.3), 0 0 12px color-mix(in oklab, var(--accent-glow) 60%, transparent)',
          }}/>
          <span>Meu Sistema <span className="italic">PSI</span></span>
        </a>
        <div style={{ display:'flex', gap: 30, fontSize: 13.5 }}>
          {['Produto','Segurança','Preços','Depoimentos','FAQ'].map((l,i) => (
            <a key={l} href={`#${['produto','seguranca','precos','depoimentos','faq'][i]}`}
               style={{ textDecoration:'none', color:'oklch(85% 0.015 60 / 0.85)' }}>{l}</a>
          ))}
        </div>
        <div style={{ display:'flex', gap: 12, alignItems:'center' }}>
          <a href="#" style={{ fontSize: 13.5, color: 'oklch(85% 0.015 60 / 0.85)', textDecoration:'none' }}>Entrar</a>
          <a href="#precos" className="btn" style={{
            padding: '9px 16px', fontSize: 13,
            background: 'var(--hero-ink)', borderColor: 'var(--hero-ink)', color: 'var(--hero-bg)',
          }}>Testar grátis <IconArrow/></a>
        </div>
      </div>
    </nav>
  );
}

// ── MANIFESTO ──────────────────────────────────────────────────
function Manifesto() {
  return (
    <section style={{ padding: 'var(--pad-section) 0', background: 'var(--bg-warm)' }}>
      <div className="page">
        <div style={{ display:'grid', gridTemplateColumns: '1fr 2fr', gap: 60 }}>
          <div>
            <div className="sec-label" style={{ marginBottom: 20 }}>
              <span className="num">002 —</span>
              <span className="name">Por que existimos</span>
              <span className="rule-fill"/>
            </div>
          </div>
          <div>
            <p className="serif" style={{
              fontSize: 'clamp(28px, 3.2vw, 42px)',
              lineHeight: 1.2,
              letterSpacing: '-0.015em',
              margin: 0,
              textWrap: 'pretty',
            }}>
              Psicologia é ouvir, notar, elaborar. Não é<br/>
              emitir recibo, conciliar agenda, caçar anotação<br/>
              em caderno perdido. <span className="italic" style={{ color:'var(--ink-dim)' }}>A gente cuida do resto — você cuida do paciente.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FEATURES ───────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <IconCalendar />,
    title: 'Agenda clínica',
    num: '01',
    body: 'Visualização por dia, semana ou mês. Bloqueio de horário, encaixes, recorrência. Sincroniza com Google Calendar e envia lembretes automáticos por WhatsApp.',
    tags: ['recorrência', 'lembrete automático', 'fuso do paciente']
  },
  {
    icon: <IconNote />,
    title: 'Prontuário e evolução',
    num: '02',
    body: 'Registro de sessão estruturado ou livre. Modelos SOAP, anamnese, genograma. Histórico cronológico pesquisável, com bloqueio CFP por 20 anos.',
    tags: ['SOAP', 'anamnese', 'CFP 11/2018']
  },
  {
    icon: <IconCoin />,
    title: 'Financeiro',
    num: '03',
    body: 'Recibos com assinatura digital, PIX integrado, controle de inadimplência e relatórios prontos para o imposto de renda. Exporta DARF e Carnê-Leão.',
    tags: ['PIX', 'recibo digital', 'IRPF']
  },
  {
    icon: <IconVideo />,
    title: 'Teleconsulta',
    num: '04',
    body: 'Sala de vídeo criptografada ponta-a-ponta, sem plugin, sem download. Link único por sessão. Conforme Resolução CFP 11/2018.',
    tags: ['E2E', 'sem download', 'sala única']
  },
  {
    icon: <IconDoc />,
    title: 'Documentos',
    num: '05',
    body: 'Atestados, declarações, laudos e contratos de serviço gerados a partir de modelos editáveis. Assinatura eletrônica com validade jurídica (ICP-Brasil).',
    tags: ['ICP-Brasil', 'modelos', 'assinatura e-CPF']
  },
  {
    icon: <IconChart />,
    title: 'Relatórios',
    num: '06',
    body: 'Indicadores de ocupação, taxa de faltas, receita por convênio, tempo médio de tratamento. Para você entender o consultório sem virar analista de dados.',
    tags: ['ocupação', 'faltas', 'receita']
  },
];

function Features() {
  return (
    <section id="produto" style={{ padding: 'var(--pad-section) 0' }}>
      <div className="page">
        <div className="sec-label">
          <span className="num">003 —</span>
          <span className="name">O que há dentro</span>
          <span className="rule-fill"/>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, marginBottom: 60 }}>
          <h2 className="serif" style={{
            margin: 0, fontSize: 'clamp(40px, 5vw, 64px)', lineHeight: 1.02,
            letterSpacing: '-0.02em', textWrap: 'balance',
          }}>
            Seis módulos.<br/>
            Um único fluxo<br/>
            <span className="italic" style={{ color: 'var(--ink-soft)' }}>do consultório.</span>
          </h2>
          <p style={{
            fontSize: 17, color: 'var(--ink-soft)', margin: 0, alignSelf: 'end',
            maxWidth: 440, lineHeight: 1.55,
          }}>
            Feito em parceria com psicólogas em prática clínica. Cada módulo funciona
            sozinho, mas é desenhado para conversar com os outros — porque atender
            um paciente nunca é uma coisa só.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          borderTop: '1px solid var(--rule)',
          borderLeft: '1px solid var(--rule)',
        }}>
          {FEATURES.map(f => (
            <article key={f.num} style={{
              padding: '32px 28px 36px',
              borderRight: '1px solid var(--rule)',
              borderBottom: '1px solid var(--rule)',
              display: 'flex', flexDirection: 'column', gap: 14,
              minHeight: 280,
              transition: 'background .2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-warm)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', color:'var(--accent)' }}>
                {f.icon}
                <span className="mono">{f.num} / 06</span>
              </div>
              <h3 className="serif" style={{
                margin: '10px 0 2px', fontSize: 26, fontWeight: 400, letterSpacing: '-0.015em',
              }}>{f.title}</h3>
              <p style={{ margin: 0, fontSize: 14.5, color:'var(--ink-soft)', lineHeight: 1.55 }}>
                {f.body}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto', paddingTop: 14 }}>
                {f.tags.map(t => (
                  <span key={t} style={{
                    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.04em',
                    padding: '3px 7px', border: '1px solid var(--rule)', borderRadius: 3,
                    color: 'var(--ink-dim)',
                  }}>{t}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── DEEP DIVE / WORKFLOW ───────────────────────────────────────
function Workflow() {
  const [step, setStep] = React.useState(0);
  const steps = [
    {
      n: '01',
      t: 'Paciente marca',
      d: 'Ele escolhe um horário no seu link público, confirma e recebe lembrete 24h antes.',
      body: (
        <div style={{ padding: 24 }}>
          <div className="mono" style={{ marginBottom: 10 }}>drmarina.meusistemapsi.com.br</div>
          <div style={{ border: '1px solid var(--rule)', borderRadius: 8, padding: 16, background: 'var(--card)' }}>
            <div style={{ fontFamily:'var(--serif)', fontSize: 20 }}>Agende sua sessão</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 14 }}>
              {['qua 14','qui 15','sex 16','seg 19','ter 20','qua 21','qui 22','sex 23'].map((d,i) => (
                <button key={d} style={{
                  padding: '10px 4px', border: '1px solid var(--rule)',
                  background: i === 4 ? 'var(--accent)' : 'var(--card)',
                  color: i === 4 ? 'white' : 'var(--ink)',
                  borderRadius: 6, fontSize: 12, cursor: 'pointer',
                }}>{d}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {['09:00','10:00','11:00','14:00','15:00','16:00'].map((h,i) => (
                <span key={h} style={{
                  padding: '6px 10px', border: '1px solid var(--rule)',
                  background: i === 2 ? 'var(--ink)' : 'transparent',
                  color: i === 2 ? 'var(--bg)' : 'var(--ink)',
                  borderRadius: 999, fontSize: 12, fontFamily:'var(--mono)',
                }}>{h}</span>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      n: '02',
      t: 'Você atende',
      d: 'Sessão começa no horário. Vídeo ou presencial. Abre o prontuário enquanto conversa.',
      body: (
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
          <div style={{
            background: 'oklch(30% 0.02 60)', borderRadius: 8, aspectRatio: '4/3',
            position: 'relative', overflow: 'hidden', color: 'white',
          }}>
            <div style={{
              position:'absolute', inset: 0,
              background: 'radial-gradient(circle at 50% 45%, oklch(40% 0.02 60), oklch(22% 0.01 60))',
            }}/>
            <div style={{
              position:'absolute', top: 12, left: 12, fontFamily:'var(--mono)', fontSize: 10,
              letterSpacing: '0.08em', textTransform:'uppercase', opacity: 0.8,
              display: 'flex', alignItems:'center', gap: 6,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background:'#e74c3c' }}/>
              gravação off · E2E
            </div>
            <div style={{
              position:'absolute', bottom: 12, left: 12, right: 12,
              display: 'flex', justifyContent: 'space-between', alignItems: 'end',
            }}>
              <div>
                <div style={{ fontSize: 14 }}>Rafael M.</div>
                <div style={{ fontFamily:'var(--mono)', fontSize: 10, opacity: 0.7 }}>42:18</div>
              </div>
              <div style={{
                width: 80, height: 60, borderRadius: 6, background: 'oklch(40% 0.02 60)', border: '1px solid rgba(255,255,255,0.1)',
              }}/>
            </div>
          </div>
          <div style={{ fontSize: 12.5 }}>
            <div className="mono" style={{ color: 'var(--ink-dim)', marginBottom: 8 }}>Evolução · sessão 14</div>
            <textarea readOnly style={{
              width: '100%', height: 120, resize: 'none', border: '1px solid var(--rule)',
              borderRadius: 6, padding: 10, fontFamily: 'var(--sans)', fontSize: 12.5,
              background: 'var(--card)', color: 'var(--ink)', lineHeight: 1.5,
            }} value="S: relata redução de episódios ansiosos no trabalho. Dormiu melhor na semana. O: afeto congruente, pensamento organizado. A: evolução positiva com TCC..."/>
            <div style={{ display:'flex', gap: 6, marginTop: 8, flexWrap:'wrap' }}>
              {['SOAP','Ansiedade','TCC'].map(t => (
                <span key={t} className="mono" style={{ padding:'2px 6px', border:'1px solid var(--rule)', borderRadius: 3 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      n: '03',
      t: 'Cobra e declara',
      d: 'Recibo emitido com 1 clique, pagamento via PIX, entrada automática no livro-caixa.',
      body: (
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ border:'1px solid var(--rule)', borderRadius: 8, padding: 18, background:'var(--card)' }}>
              <div className="mono" style={{ color:'var(--ink-dim)', marginBottom: 8 }}>Recibo Nº 0482</div>
              <div style={{ fontFamily:'var(--serif)', fontSize: 22, lineHeight: 1.2, marginBottom: 6 }}>R$ 220,00</div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 14 }}>
                Recebi de Rafael Mendes Souza, CPF 123.***.789-00, a quantia referente a honorários de psicoterapia — sessão de 17/04/2026.
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--mono)', fontSize: 10, color:'var(--ink-dim)' }}>
                <span>emitido · assinado digitalmente</span>
                <span style={{ color: 'var(--accent)' }}>✓</span>
              </div>
            </div>
            <div style={{ border:'1px solid var(--rule)', borderRadius: 8, padding: 18, background:'var(--card)' }}>
              <div className="mono" style={{ color:'var(--ink-dim)', marginBottom: 12 }}>Livro-caixa · abril</div>
              {[
                ['17/04','Rafael M.','+ 220,00'],
                ['16/04','Ana C.','+ 180,00'],
                ['15/04','Aluguel sala','- 800,00'],
                ['14/04','Luiza F.','+ 220,00'],
              ].map(([d,n,v]) => (
                <div key={d} style={{
                  display:'grid', gridTemplateColumns:'44px 1fr auto', gap: 8,
                  fontSize: 12, padding: '6px 0', borderBottom: '1px dashed var(--rule)',
                }}>
                  <span className="mono" style={{ color:'var(--ink-dim)' }}>{d}</span>
                  <span>{n}</span>
                  <span className="mono" style={{ color: v.startsWith('+') ? 'var(--accent)' : 'var(--terracotta)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
  ];
  return (
    <section style={{ padding: 'var(--pad-section) 0', background: 'var(--bg-warm)' }}>
      <div className="page">
        <div className="sec-label">
          <span className="num">004 —</span>
          <span className="name">Um dia no Sistema PSI</span>
          <span className="rule-fill"/>
        </div>

        <h2 className="serif" style={{
          margin: '0 0 60px', fontSize: 'clamp(38px, 4.5vw, 56px)',
          letterSpacing: '-0.02em', maxWidth: 900, lineHeight: 1.05,
        }}>
          Da marcação ao imposto de renda,<br/>
          <span className="italic" style={{ color:'var(--ink-soft)' }}>em três movimentos.</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderLeft: '1px solid var(--rule)' }}>
            {steps.map((s, i) => (
              <button key={s.n} onClick={() => setStep(i)} style={{
                border: 0, background: 'transparent', textAlign: 'left',
                padding: '18px 22px', cursor: 'pointer',
                borderLeft: `2px solid ${i === step ? 'var(--accent)' : 'transparent'}`,
                marginLeft: -1,
                color: i === step ? 'var(--ink)' : 'var(--ink-soft)',
                transition: 'color .2s',
              }}>
                <div className="mono" style={{ marginBottom: 6, color: i === step ? 'var(--accent)' : 'var(--ink-dim)' }}>
                  PASSO {s.n}
                </div>
                <div className="serif" style={{ fontSize: 24, letterSpacing: '-0.01em' }}>{s.t}</div>
                <div style={{ fontSize: 13.5, marginTop: 4, color: 'var(--ink-dim)', lineHeight: 1.5 }}>{s.d}</div>
              </button>
            ))}
          </div>

          <div style={{
            border: '1px solid var(--rule)', borderRadius: 12, background: 'var(--bg)',
            minHeight: 420, overflow: 'hidden',
          }}>
            {steps[step].body}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── SECURITY ───────────────────────────────────────────────────
function Security() {
  const items = [
    ['Criptografia AES-256', 'em repouso e TLS 1.3 em trânsito — seus dados clínicos viajam e descansam protegidos.'],
    ['Servidores no Brasil', 'infraestrutura em região São Paulo. Seus dados não atravessam fronteiras.'],
    ['Controlador LGPD', 'com Encarregado de Dados nomeado. Você continua dono e controlador — nós operamos.'],
    ['Guarda de 20 anos', 'atendendo à Resolução CFP 01/2009. Exportação integral a qualquer momento.'],
    ['Backups diários', 'criptografados, retidos por 35 dias, testados semanalmente.'],
    ['Auditoria de acesso', 'todo acesso ao prontuário é registrado — quem, quando, de onde.'],
  ];
  return (
    <section id="seguranca" style={{ padding: 'var(--pad-section) 0' }}>
      <div className="page">
        <div className="sec-label">
          <span className="num">005 —</span>
          <span className="name">Sigilo e conformidade</span>
          <span className="rule-fill"/>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 80, alignItems: 'start' }}>
          <div style={{ position: 'sticky', top: 120 }}>
            <div style={{
              width: 84, height: 84, borderRadius: 999,
              background: 'var(--accent-soft)', color: 'var(--accent)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 24,
            }}>
              <IconShield size={40}/>
            </div>
            <h2 className="serif" style={{
              margin: '0 0 22px', fontSize: 'clamp(34px, 4vw, 52px)',
              letterSpacing: '-0.02em', lineHeight: 1.05,
            }}>
              Sigilo clínico não<br/>
              é checkbox. <span className="italic" style={{ color:'var(--ink-soft)' }}>É arquitetura.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.55, maxWidth: 440, margin: 0 }}>
              Construímos em cima da LGPD, da Resolução CFP 11/2018 e do Código de Ética
              do Psicólogo. Não porque é exigência — porque é premissa.
            </p>
            <div style={{
              display:'flex', flexWrap:'wrap', gap: 8, marginTop: 22,
            }}>
              {['LGPD','CFP 11/2018','CFP 01/2009','ISO 27001 (em processo)'].map(t => (
                <span key={t} style={{
                  fontFamily:'var(--mono)', fontSize: 11, padding:'5px 10px',
                  border: '1px solid var(--rule)', borderRadius: 999,
                }}>{t}</span>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {items.map(([t, d], i) => (
              <div key={t} style={{
                padding: '22px 22px 22px 0',
                borderBottom: i < 4 ? '1px solid var(--rule)' : 'none',
                borderRight: i % 2 === 0 ? '1px solid var(--rule)' : 'none',
                paddingLeft: i % 2 === 1 ? 22 : 0,
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)' }}>
                  <IconCheck/>
                  <span style={{ fontWeight: 500, color: 'var(--ink)', fontSize: 15 }}>{t}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.55 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── PRICING ────────────────────────────────────────────────────
function Pricing() {
  const [annual, setAnnual] = React.useState(true);
  const plans = [
    {
      name: 'Essencial',
      sub: 'para quem está começando',
      price: annual ? 39 : 49,
      features: ['1 profissional','Agenda + prontuário','Recibos digitais','Lembretes WhatsApp','Suporte por e-mail'],
      cta: 'Testar grátis',
    },
    {
      name: 'Prática',
      sub: 'para consultório consolidado',
      price: annual ? 79 : 99,
      features: ['1 profissional','Tudo do Essencial','Teleconsulta ilimitada','Financeiro completo + IRPF','Documentos com ICP-Brasil','Suporte prioritário'],
      cta: 'Começar 14 dias',
      highlighted: true,
    },
    {
      name: 'Clínica',
      sub: 'para equipes e grupos',
      price: annual ? 149 : 179,
      priceSuffix: '/ profissional',
      features: ['2 ou mais profissionais','Tudo da Prática','Gestão de secretaria','Comissionamento','Relatórios da clínica','API e integrações'],
      cta: 'Falar com vendas',
    },
  ];
  return (
    <section id="precos" style={{ padding: 'var(--pad-section) 0', background: 'var(--bg-warm)' }}>
      <div className="page">
        <div className="sec-label">
          <span className="num">006 —</span>
          <span className="name">Planos</span>
          <span className="rule-fill"/>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'end', marginBottom: 50, flexWrap:'wrap', gap: 20 }}>
          <h2 className="serif" style={{
            margin: 0, fontSize: 'clamp(38px, 4.5vw, 56px)',
            letterSpacing: '-0.02em', maxWidth: 640, lineHeight: 1.05,
          }}>
            Preço honesto.<br/>
            <span className="italic" style={{ color:'var(--ink-soft)' }}>Sem letras miúdas.</span>
          </h2>

          <div style={{
            display: 'inline-flex', padding: 4, borderRadius: 999,
            border: '1px solid var(--rule)', background: 'var(--card)',
            fontSize: 13,
          }}>
            <button onClick={() => setAnnual(false)} style={{
              padding: '8px 18px', border: 0, borderRadius: 999,
              background: !annual ? 'var(--ink)' : 'transparent',
              color: !annual ? 'var(--bg)' : 'var(--ink-soft)',
              cursor: 'pointer',
            }}>Mensal</button>
            <button onClick={() => setAnnual(true)} style={{
              padding: '8px 18px', border: 0, borderRadius: 999,
              background: annual ? 'var(--ink)' : 'transparent',
              color: annual ? 'var(--bg)' : 'var(--ink-soft)',
              cursor: 'pointer',
            }}>Anual <span style={{
              fontFamily:'var(--mono)', fontSize: 10, marginLeft: 6,
              padding:'1px 5px', borderRadius: 3,
              background: annual ? 'var(--accent)' : 'var(--accent-soft)',
              color: annual ? 'white' : 'var(--accent)',
            }}>−20%</span></button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {plans.map(p => (
            <article key={p.name} style={{
              background: p.highlighted ? 'var(--ink)' : 'var(--card)',
              color: p.highlighted ? 'var(--bg)' : 'var(--ink)',
              border: '1px solid var(--rule)',
              borderRadius: 14, padding: '28px 26px 32px',
              display: 'flex', flexDirection: 'column', gap: 20,
              position: 'relative',
            }}>
              {p.highlighted && (
                <span style={{
                  position: 'absolute', top: -10, right: 22,
                  padding: '3px 10px', background: 'var(--accent)', color: 'white',
                  fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em',
                  textTransform: 'uppercase', borderRadius: 999,
                }}>recomendado</span>
              )}
              <div>
                <div className="serif" style={{ fontSize: 28, letterSpacing:'-0.01em' }}>{p.name}</div>
                <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>{p.sub}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, padding: '14px 0', borderTop: '1px solid ' + (p.highlighted ? 'rgba(255,255,255,0.15)' : 'var(--rule)'), borderBottom: '1px solid ' + (p.highlighted ? 'rgba(255,255,255,0.15)' : 'var(--rule)') }}>
                <span style={{ fontFamily:'var(--mono)', fontSize: 14, opacity: 0.7 }}>R$</span>
                <span className="serif" style={{ fontSize: 52, letterSpacing: '-0.02em', lineHeight: 1 }}>{p.price}</span>
                <span style={{ fontSize: 13, opacity: 0.7, marginLeft: 4 }}>/ mês{p.priceSuffix ? p.priceSuffix.replace('/ ','') : ''}</span>
              </div>

              <ul style={{ listStyle:'none', padding: 0, margin: 0, display: 'flex', flexDirection:'column', gap: 9, fontSize: 14 }}>
                {p.features.map(f => (
                  <li key={f} style={{ display:'flex', gap: 10, alignItems:'flex-start' }}>
                    <span style={{ color: p.highlighted ? 'var(--accent-soft)' : 'var(--accent)', marginTop: 3 }}>
                      <IconCheck size={12}/>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <a href="#" className="btn" style={{
                marginTop: 'auto', justifyContent: 'center',
                background: p.highlighted ? 'var(--bg)' : 'var(--ink)',
                color: p.highlighted ? 'var(--ink)' : 'var(--bg)',
                borderColor: p.highlighted ? 'var(--bg)' : 'var(--ink)',
              }}>
                {p.cta} <IconArrow/>
              </a>
            </article>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-dim)', marginTop: 32 }}>
          14 dias grátis em todos os planos · cancele a qualquer momento · NF-e mensal
        </p>
      </div>
    </section>
  );
}

// ── TESTIMONIALS ──────────────────────────────────────────────
function Testimonials() {
  const quotes = [
    {
      q: 'Eu tinha três lugares pra anotar as coisas: caderno, planilha, e-mail. Agora tem um. Devolveu umas 4 horas por semana da minha vida.',
      name: 'Camila Vasconcellos',
      role: 'Psicóloga clínica · CRP 06/148392',
      city: 'São Paulo — SP',
    },
    {
      q: 'O que me convenceu foi a teleconsulta funcionar sem pedir pro paciente baixar nada. Ninguém gosta de começar a sessão resolvendo problema de plugin.',
      name: 'Roberto Nakamura',
      role: 'Psicanalista · CRP 08/23981',
      city: 'Curitiba — PR',
    },
    {
      q: 'Os relatórios pro imposto de renda sozinhos já justificam a assinatura anual. Sai de uma tarde de contador para dez minutos.',
      name: 'Fernanda Prado',
      role: 'Consultório em grupo · CRP 04/56711',
      city: 'Belo Horizonte — MG',
    },
  ];
  return (
    <section id="depoimentos" style={{ padding: 'var(--pad-section) 0' }}>
      <div className="page">
        <div className="sec-label">
          <span className="num">007 —</span>
          <span className="name">Quem já usa</span>
          <span className="rule-fill"/>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          {quotes.map((t,i) => (
            <figure key={i} style={{
              margin: 0, display: 'flex', flexDirection: 'column', gap: 24,
              padding: '30px 28px', border: '1px solid var(--rule)', borderRadius: 14,
              background: i === 1 ? 'var(--bg-warm)' : 'var(--card)',
              minHeight: 320,
            }}>
              <div style={{ color: 'var(--accent)' }}><IconQuote /></div>
              <blockquote className="serif" style={{
                margin: 0, fontSize: 19, lineHeight: 1.45,
                letterSpacing:'-0.005em', flex: 1, textWrap: 'pretty',
              }}>
                {t.q}
              </blockquote>
              <figcaption style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--rule)', paddingTop: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--accent-soft)', color: 'var(--accent)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 500,
                }}>
                  {t.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{t.name}</div>
                  <div className="mono" style={{ marginTop: 2 }}>{t.role}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-dim)', marginTop: 1 }}>{t.city}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = React.useState(0);
  const faqs = [
    ['Meus dados ficam mesmo seguros?',
     'Sim. Tudo é criptografado em AES-256 em repouso e TLS 1.3 em trânsito, com servidores em território brasileiro (região São Paulo). Nomeamos Encarregado de Dados (LGPD) e seguimos as Resoluções CFP 11/2018 e 01/2009. Você pode exportar todo o seu acervo a qualquer momento, em PDF ou JSON.'],
    ['Funciona para psicanalistas, não só psicólogos clínicos?',
     'Sim. Temos modelos de registro para abordagens psicanalíticas, comportamentais, humanistas, sistêmicas e integrativas. Você também pode criar modelos próprios.'],
    ['E se eu quiser sair? Consigo levar meus prontuários?',
     'Claro. Exportação integral e gratuita em PDF legível e JSON estruturado, a qualquer momento, durante ou depois da assinatura. Seus pacientes são seus.'],
    ['Posso usar com secretária / equipe?',
     'No plano Clínica, você adiciona usuários com perfis diferentes (profissional, secretária, administrador). Cada um enxerga apenas o que precisa — sigilo clínico preservado.'],
    ['Emite Nota Fiscal do serviço?',
     'O recibo com validade fiscal é emitido dentro do sistema. Para NFS-e de prestação de serviço, integramos com as principais prefeituras do país; é configurar uma vez e esquecer.'],
    ['Preciso ter CRP para me cadastrar?',
     'Sim — validamos seu CRP no cadastro junto ao Conselho. É a nossa forma de proteger a profissão.'],
  ];
  return (
    <section id="faq" style={{ padding: 'var(--pad-section) 0', background: 'var(--bg-warm)' }}>
      <div className="page">
        <div className="sec-label">
          <span className="num">008 —</span>
          <span className="name">Perguntas comuns</span>
          <span className="rule-fill"/>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 80 }}>
          <h2 className="serif" style={{
            margin: 0, fontSize: 'clamp(36px, 4vw, 52px)',
            letterSpacing: '-0.02em', lineHeight: 1.05,
          }}>
            Dúvidas<br/>
            <span className="italic" style={{ color:'var(--ink-soft)' }}>frequentes</span>
          </h2>

          <div>
            {faqs.map(([q,a], i) => (
              <div key={i} style={{ borderTop: '1px solid var(--rule)', borderBottom: i === faqs.length - 1 ? '1px solid var(--rule)' : 'none' }}>
                <button onClick={() => setOpen(open === i ? -1 : i)} style={{
                  width: '100%', border: 0, background: 'transparent',
                  padding: '22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', color: 'var(--ink)', textAlign: 'left',
                }}>
                  <span style={{ display:'flex', gap: 18, alignItems:'baseline' }}>
                    <span className="mono" style={{ color:'var(--ink-dim)' }}>{String(i+1).padStart(2,'0')}</span>
                    <span className="serif" style={{ fontSize: 22, letterSpacing:'-0.01em' }}>{q}</span>
                  </span>
                  <span style={{
                    fontSize: 22, fontFamily: 'var(--serif)', transition: 'transform .2s',
                    transform: open === i ? 'rotate(45deg)' : 'rotate(0)', color:'var(--ink-dim)',
                  }}>+</span>
                </button>
                <div style={{
                  maxHeight: open === i ? 200 : 0, overflow:'hidden',
                  transition: 'max-height .3s ease',
                }}>
                  <p style={{
                    margin: 0, padding: '0 0 22px 46px', fontSize: 15,
                    color: 'var(--ink-soft)', lineHeight: 1.55, maxWidth: 640,
                  }}>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FOOTER CTA ─────────────────────────────────────────────────
function FooterCTA() {
  return (
    <section style={{ padding: 'var(--pad-section) 0 80px' }}>
      <div className="page">
        <div style={{
          border: '1px solid var(--rule)', borderRadius: 20,
          padding: '80px 60px',
          background: 'var(--ink)', color: 'var(--bg)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div className="dotgrid" style={{
            position: 'absolute', inset: 0, opacity: 0.15,
            backgroundImage: 'radial-gradient(oklch(70% 0.02 60) 1px, transparent 1px)',
          }}/>
          <div style={{ position:'relative', display:'grid', gridTemplateColumns:'1.5fr 1fr', gap: 60, alignItems:'end' }}>
            <div>
              <div className="mono" style={{ color: 'oklch(75% 0.02 60)', marginBottom: 20 }}>009 — Começar</div>
              <h2 className="serif" style={{
                margin: 0, fontSize: 'clamp(48px, 6vw, 86px)',
                letterSpacing: '-0.025em', lineHeight: 0.98,
              }}>
                Volte a escutar.<br/>
                <span className="italic" style={{ color: 'oklch(80% 0.04 60)' }}>A gente cuida da parte chata.</span>
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <p style={{ margin: 0, fontSize: 16, color: 'oklch(85% 0.015 60)', lineHeight: 1.55 }}>
                14 dias grátis, sem cartão. Seu consultório importado em menos de uma hora — nossa equipe ajuda.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap:'wrap' }}>
                <a href="#" className="btn" style={{
                  background: 'var(--accent)', borderColor: 'var(--accent)', color: 'white',
                }}>Criar minha conta <IconArrow /></a>
                <a href="#" className="btn ghost" style={{
                  borderColor: 'oklch(50% 0.02 60)', color: 'oklch(90% 0.01 60)',
                }}>Agendar demonstração</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ padding: '60px 0 40px', borderTop: '1px solid var(--rule)' }}>
      <div className="page">
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap: 40, marginBottom: 60 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap: 10, fontFamily:'var(--serif)', fontSize: 22, letterSpacing:'-0.01em' }}>
              <IconLogo size={22} />
              <span>Meu Sistema <span className="italic">PSI</span></span>
            </div>
            <p style={{ marginTop: 12, fontSize: 13.5, color:'var(--ink-soft)', maxWidth: 340, lineHeight: 1.55 }}>
              Sistema de gestão para psicólogas e psicólogos em prática clínica no Brasil. Feito por uma equipe pequena, em São Paulo.
            </p>
            <p className="mono" style={{ marginTop: 20, color: 'var(--ink-dim)' }}>
              meusistemapsi.com.br
            </p>
          </div>
          {[
            ['Produto', ['Agenda','Prontuário','Financeiro','Teleconsulta','Documentos']],
            ['Empresa', ['Sobre','Manifesto','Blog','Contato','Trabalhe conosco']],
            ['Legal', ['Termos de uso','Privacidade','LGPD','Status','Changelog']],
          ].map(([h, items]) => (
            <div key={h}>
              <div className="mono" style={{ marginBottom: 14 }}>{h}</div>
              <ul style={{ listStyle:'none', margin: 0, padding: 0, display:'flex', flexDirection:'column', gap: 8, fontSize: 13.5 }}>
                {items.map(i => (
                  <li key={i}><a href="#" style={{ color: 'var(--ink-soft)', textDecoration:'none' }}>{i}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{
          paddingTop: 24, borderTop: '1px solid var(--rule)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 12, color: 'var(--ink-dim)', flexWrap: 'wrap', gap: 12,
        }}>
          <div>© 2026 Meu Sistema PSI · CNPJ 00.000.000/0001-00</div>
          <div className="mono">
            <span style={{ color: 'var(--accent)' }}>●</span> Todos os sistemas operacionais
          </div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Nav, Hero, Manifesto, Features, Workflow, Security, Pricing, Testimonials, FAQ, FooterCTA, Footer });
