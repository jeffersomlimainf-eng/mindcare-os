// Injects the sections after the hero
(function(){
  const html = `

<!-- ─── BENEFITS / PROBLEM ───────────────────────── -->
<section class="section bg-cream">
  <div class="container">
    <div class="section-head">
      <span class="kicker">Por que Meu Sistema.PSI</span>
      <h2 class="section-title">Menos <em>burocracia</em>, mais <em>presença</em> com quem importa.</h2>
      <p class="section-sub">Um ambiente pensado para devolver seu tempo — para que a atenção volte ao consultório, e não à papelada.</p>
    </div>

    <div class="benefits-grid">
      <article class="benefit">
        <div class="benefit-icon"><i class="fa-solid fa-microphone-lines"></i></div>
        <h3 class="benefit-title">Do áudio ao prontuário</h3>
        <p class="benefit-body">Grave a sessão com um toque. Em segundos, a evolução chega pronta — com transcrição, resumo e tags clínicas.</p>
      </article>

      <article class="benefit">
        <div class="benefit-icon"><i class="fa-regular fa-calendar-heart"></i></div>
        <h3 class="benefit-title">Agenda sem atrito</h3>
        <p class="benefit-body">Confirmações automáticas por WhatsApp, lembretes inteligentes e bloqueios de faltas que se reorganizam sozinhos.</p>
      </article>

      <article class="benefit">
        <div class="benefit-icon"><i class="fa-solid fa-sack-dollar"></i></div>
        <h3 class="benefit-title">Financeiro tranquilo</h3>
        <p class="benefit-body">Recibos, NFS-e e Receita Saúde emitidos automaticamente. Inadimplência e recebíveis sempre à vista.</p>
      </article>

      <article class="benefit">
        <div class="benefit-icon"><i class="fa-solid fa-shield-heart"></i></div>
        <h3 class="benefit-title">Sigilo sem afrouxar</h3>
        <p class="benefit-body">Criptografia ponta a ponta, LGPD e código de ética do CFP. Segurança que inspira confiança — na sua e na do seu paciente.</p>
      </article>

      <article class="benefit">
        <div class="benefit-icon"><i class="fa-solid fa-user-group"></i></div>
        <h3 class="benefit-title">Pacientes organizados</h3>
        <p class="benefit-body">Histórico completo, anexos, evolução e plano terapêutico — tudo em uma linha do tempo que conta a jornada inteira.</p>
      </article>

      <article class="benefit">
        <div class="benefit-icon"><i class="fa-solid fa-feather"></i></div>
        <h3 class="benefit-title">Intuitiva de verdade</h3>
        <p class="benefit-body">Se você entende Instagram, já entendeu o sistema. Sem manuais — só presença e fluidez.</p>
      </article>
    </div>
  </div>
</section>

<!-- ─── FEATURE SHOWCASE ────────────────────────── -->
<section id="funcionalidades" class="section bg-paper">
  <div class="container">
    <div class="section-head">
      <span class="kicker">Funcionalidades</span>
      <h2 class="section-title">Desenhado <em>com</em> psicólogos, não apenas <em>para</em>.</h2>
    </div>

    <!-- Row 1: Smart Notes -->
    <div class="feature-row">
      <div class="feature-copy">
        <span class="kicker">Smart Notes · IA</span>
        <h3>Da <em>sessão</em> ao prontuário — sem tocar no teclado.</h3>
        <p>Grave com um toque, encerre a sessão e pronto. Sua evolução chega estruturada, com os pontos clínicos relevantes e sugestões de linha terapêutica. Você revisa, ajusta e assina.</p>
        <div class="feature-tags">
          <span class="feature-tag"><i class="fa-solid fa-circle"></i> Transcrição automática</span>
          <span class="feature-tag"><i class="fa-solid fa-circle"></i> Resumo clínico</span>
          <span class="feature-tag"><i class="fa-solid fa-circle"></i> Tags de evolução</span>
        </div>
      </div>
      <div class="feature-visual">
        <div class="sn-wave">
          ${Array.from({length: 38}).map(() => '<span></span>').join('')}
        </div>
        <div class="sn-card">
          <div class="sn-card-hd">Evolução · Sessão 24/04</div>
          <div class="sn-card-bd">Paciente relata <b>melhora da ansiedade</b> após início do mindfulness diário. Mantém queixa leve de <b>insônia inicial</b>. Ajustar técnica de respiração...</div>
        </div>
        <div class="sn-card">
          <div class="sn-card-hd">Plano terapêutico</div>
          <div class="sn-card-bd">Continuar TCC focada em reestruturação cognitiva. Introduzir <b>diário de gratidão</b> na próxima semana.</div>
        </div>
      </div>
    </div>

    <!-- Row 2: Calendar -->
    <div class="feature-row reverse">
      <div class="feature-copy">
        <span class="kicker">Agenda viva</span>
        <h3>Uma agenda que <em>caminha</em> com você.</h3>
        <p>Confirmações, remarcações e lembretes via WhatsApp acontecem sozinhos. Ausências bloqueiam automaticamente o horário seguinte, e encaixes inteligentes te sugerem onde acomodar alguém em espera.</p>
        <div class="feature-tags">
          <span class="feature-tag"><i class="fa-brands fa-whatsapp"></i> Lembretes WhatsApp</span>
          <span class="feature-tag"><i class="fa-solid fa-repeat"></i> Recorrência</span>
          <span class="feature-tag"><i class="fa-solid fa-video"></i> Sala de vídeo</span>
        </div>
      </div>
      <div class="feature-visual">
        <div class="cal">
          <div class="cal-hd">
            <span>Abril 2026</span>
            <span style="color: var(--muted); font-size: 12px;">Hoje</span>
          </div>
          <div class="cal-grid">
            ${['D','S','T','Q','Q','S','S'].map(d=>`<div class="cal-day head">${d}</div>`).join('')}
            ${Array.from({length: 30}, (_, i) => {
              const day = i + 1;
              const today = day === 24;
              const events = [3, 5, 7, 10, 12, 15, 17, 19, 22, 24, 26, 28, 29];
              const cls = today ? 'today' : events.includes(day) ? 'has-event' : '';
              return `<div class="cal-day ${cls}">${day}</div>`;
            }).join('')}
          </div>
        </div>
        <div style="margin-top: 14px; display: flex; gap: 8px; font-size: 12px; color: var(--ink-soft);">
          <span><i class="fa-brands fa-whatsapp" style="color: #1fa851;"></i> 12 confirmações hoje</span>
          <span style="margin-left:auto;"><i class="fa-solid fa-video" style="color: var(--violet);"></i> 3 online</span>
        </div>
      </div>
    </div>

    <!-- Row 3: Financial -->
    <div class="feature-row">
      <div class="feature-copy">
        <span class="kicker">Financeiro</span>
        <h3>O dinheiro <em>entra</em>, os recibos <em>saem</em> — no automático.</h3>
        <p>NFS-e emitida ao final da sessão, Receita Saúde integrada, cobrança recorrente, controle de inadimplência com réguas por WhatsApp. Você fecha o mês com um relatório pronto para o contador.</p>
        <div class="feature-tags">
          <span class="feature-tag"><i class="fa-solid fa-file-invoice-dollar"></i> NFS-e automática</span>
          <span class="feature-tag"><i class="fa-solid fa-heart-pulse"></i> Receita Saúde</span>
          <span class="feature-tag"><i class="fa-solid fa-chart-line"></i> Relatórios</span>
        </div>
      </div>
      <div class="feature-visual">
        <div class="fin-stat">
          <span class="val">12.840</span>
          <span class="cur">R$ · abril</span>
          <span class="delta">+ 18%</span>
        </div>
        <div class="fin-bars">
          <span style="height: 40%"></span>
          <span style="height: 55%"></span>
          <span style="height: 48%"></span>
          <span style="height: 70%"></span>
          <span style="height: 62%"></span>
          <span style="height: 82%"></span>
          <span style="height: 95%"></span>
        </div>
        <div class="fin-row">
          <span>Marina B. · 24/04</span><b>R$ 220</b><span class="ok">Pago</span>
        </div>
        <div class="fin-row">
          <span>Rafael T. · 24/04</span><b>R$ 180</b><span class="ok">Pago</span>
        </div>
        <div class="fin-row">
          <span>Clara V. · 23/04</span><b>R$ 220</b><span style="color: var(--pink-deep); font-weight: 600; font-size: 12px;">Enviado</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ─── PRICING ─────────────────────────────────── -->
<section id="planos" class="section bg-lilac">
  <div class="container">
    <div class="section-head">
      <span class="kicker">Planos</span>
      <h2 class="section-title">Preço que cabe, valor que <em>transborda</em>.</h2>
      <p class="section-sub">15 dias para experimentar tudo, sem cartão. Cancele quando quiser, sem burocracia.</p>
    </div>

    <div class="pricing-grid">
      <article class="plan">
        <div class="plan-name">Essencial</div>
        <h3 class="plan-title">Para começar<br/>com leveza.</h3>
        <div class="plan-price">
          <span class="amt">R$ 59</span>
          <span class="per">/ mês</span>
        </div>
        <div class="plan-price-alt">no anual — ou R$ 79 no mensal</div>
        <ul class="plan-features">
          <li><i class="fa-solid fa-check"></i> Agenda ilimitada com lembretes WhatsApp</li>
          <li><i class="fa-solid fa-check"></i> Prontuário eletrônico LGPD</li>
          <li><i class="fa-solid fa-check"></i> Até 30 pacientes ativos</li>
          <li><i class="fa-solid fa-check"></i> Emissão de recibo simples</li>
          <li><i class="fa-solid fa-check"></i> Sala de vídeo integrada</li>
          <li><i class="fa-solid fa-check"></i> Suporte por chat</li>
        </ul>
        <a href="#" class="btn btn-ghost">Começar grátis</a>
      </article>

      <article class="plan featured">
        <span class="plan-badge">Mais amado</span>
        <div class="plan-name">Completo</div>
        <h3 class="plan-title">Quando a prática<br/>pede mais fluidez.</h3>
        <span class="plan-off">2 meses grátis no anual</span>
        <div class="plan-price">
          <span class="amt">R$ 119</span>
          <span class="per">/ mês</span>
        </div>
        <div class="plan-price-alt">no anual — ou R$ 149 no mensal</div>
        <ul class="plan-features">
          <li><i class="fa-solid fa-check"></i> Tudo do Essencial, sem limites</li>
          <li><i class="fa-solid fa-check"></i> Smart Notes por IA (até 200h/mês)</li>
          <li><i class="fa-solid fa-check"></i> NFS-e &amp; Receita Saúde automáticas</li>
          <li><i class="fa-solid fa-check"></i> Cobrança recorrente &amp; régua de inadimplência</li>
          <li><i class="fa-solid fa-check"></i> Prontuário avançado com anexos</li>
          <li><i class="fa-solid fa-check"></i> Relatórios e exportação contábil</li>
          <li><i class="fa-solid fa-check"></i> Suporte prioritário por WhatsApp</li>
        </ul>
        <a href="#" class="btn btn-primary">Experimentar 15 dias grátis</a>
      </article>
    </div>

    <p style="text-align:center; margin-top:32px; font-size: 13px; color: var(--ink-soft);">
      Trabalha em consultório compartilhado? <a href="#" style="color: var(--pink-deep); font-weight: 600;">Converse com a gente</a> sobre planos para clínicas.
    </p>
  </div>
</section>

<!-- ─── TESTIMONIALS ────────────────────────────── -->
<section id="depoimentos" class="section bg-paper">
  <div class="container">
    <div class="section-head">
      <span class="kicker">Quem já vive a experiência</span>
      <h2 class="section-title">Palavras que <em>acolhem</em> de volta.</h2>
    </div>

    <div class="testimonials-grid">
      <article class="testimonial">
        <div class="testimonial-stars">★★★★★</div>
        <p class="testimonial-quote">"Ganhei meu sábado de volta. O prontuário que eu levava horas pra fechar agora termina com a sessão. É outro respiro."</p>
        <div class="testimonial-who">
          <div class="testimonial-avatar">MP</div>
          <div>
            <div class="testimonial-name">Mariana Prado</div>
            <div class="testimonial-handle">Psicóloga clínica · SP</div>
          </div>
        </div>
      </article>

      <article class="testimonial">
        <div class="testimonial-stars">★★★★★</div>
        <p class="testimonial-quote">"Testei três sistemas antes. Esse foi o primeiro em que eu não precisei abrir um tutorial. Abri, usei, configurei em uma tarde."</p>
        <div class="testimonial-who">
          <div class="testimonial-avatar">AR</div>
          <div>
            <div class="testimonial-name">Ana Ribeiro</div>
            <div class="testimonial-handle">Neuropsicóloga · RJ</div>
          </div>
        </div>
      </article>

      <article class="testimonial">
        <div class="testimonial-stars">★★★★★</div>
        <p class="testimonial-quote">"A integração com a Receita Saúde foi o que me convenceu. Fim de ano deixou de ser pesadelo — agora é só exportar."</p>
        <div class="testimonial-who">
          <div class="testimonial-avatar">JC</div>
          <div>
            <div class="testimonial-name">Juliana Campos</div>
            <div class="testimonial-handle">Psicóloga infantil · BH</div>
          </div>
        </div>
      </article>
    </div>
  </div>
</section>

<!-- ─── FAQ ────────────────────────────────────── -->
<section id="faq" class="section bg-cream">
  <div class="container">
    <div class="section-head">
      <span class="kicker">Dúvidas frequentes</span>
      <h2 class="section-title">Respostas <em>honestas</em>, sem letrinha miúda.</h2>
    </div>

    <div class="faq">
      <details class="faq-item" open>
        <summary>Preciso informar cartão de crédito para começar?</summary>
        <div class="faq-answer">Não. Os 15 dias de teste são totalmente livres — você só decide assinar no final do período, se quiser continuar. Sem cobranças surpresa.</div>
      </details>
      <details class="faq-item">
        <summary>Como funciona a transcrição por IA das sessões?</summary>
        <div class="faq-answer">Você grava a sessão direto no app (com consentimento do paciente) e, ao encerrar, o sistema gera a transcrição e uma evolução estruturada com pontos clínicos relevantes. Tudo é processado em infraestrutura segura no Brasil e nunca é usado para treinar modelos.</div>
      </details>
      <details class="faq-item">
        <summary>É compatível com as exigências do CFP e da LGPD?</summary>
        <div class="faq-answer">Sim. Criptografia ponta a ponta, controle de acesso, logs de auditoria, retenção configurável e assinatura digital de prontuário. Temos DPO dedicado e atendemos integralmente à Resolução CFP 001/2022 e à LGPD.</div>
      </details>
      <details class="faq-item">
        <summary>Posso migrar meus pacientes e histórico de outro sistema?</summary>
        <div class="faq-answer">Sim, sem custo. Nosso time faz a migração para você — basta enviar sua planilha ou a exportação do sistema anterior. A maioria das migrações fica pronta em 48h.</div>
      </details>
      <details class="faq-item">
        <summary>Funciona no celular?</summary>
        <div class="faq-answer">Funciona em qualquer navegador, e temos app PWA instalável para iOS e Android — ideal para gravar sessões direto do celular, consultar agenda e responder pacientes por WhatsApp com um toque.</div>
      </details>
      <details class="faq-item">
        <summary>E se eu quiser cancelar?</summary>
        <div class="faq-answer">Cancela com um clique, sem ligação, sem retenção. Seus dados ficam disponíveis por 90 dias para exportação e depois são apagados de forma segura.</div>
      </details>
    </div>
  </div>
</section>

<!-- ─── CTA FINAL ──────────────────────────────── -->
<section class="cta">
  <div class="container cta-inner">
    <h2>Experimente o <em>respiro</em><br/>que a sua prática merece.</h2>
    <p>15 dias grátis, sem cartão. Sem enrolação. Do primeiro clique ao seu último paciente do dia — tudo fluindo.</p>
    <div class="hero-actions" style="justify-content: center;">
      <a href="#" class="btn btn-primary">Começar agora <i class="fa-solid fa-arrow-right"></i></a>
      <a href="#" class="btn btn-ghost"><i class="fa-brands fa-whatsapp"></i> Falar com consultor</a>
    </div>
  </div>
</section>

<!-- ─── FOOTER ─────────────────────────────────── -->
<footer class="footer">
  <div class="container">
    <div class="footer-top">
      <div>
        <div class="footer-brand">
          <svg width="24" height="28" viewBox="0 0 200 260" aria-hidden="true">
            <defs><linearGradient id="fBrand" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#ff66c2"/><stop offset="100%" stop-color="#c940a8"/>
            </linearGradient></defs>
            <g fill="none" stroke="url(#fBrand)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round">
              <path d="M 170,15 C 85,15 30,70 30,130 C 75,125 115,105 145,80 C 165,60 172,35 170,15 Z"/>
              <path d="M 30,245 C 115,245 170,190 170,130 C 125,135 85,155 55,180 C 35,200 28,225 30,245 Z"/>
            </g>
          </svg>
          <span>Meu Sistema<small>.PSI</small></span>
        </div>
        <p style="max-width: 300px; line-height: 1.6; margin: 0;">O sistema pensado por e para psicólogos — com a leveza que a sua rotina clínica pede.</p>
      </div>

      <div class="footer-col">
        <h4>Produto</h4>
        <a href="#funcionalidades">Funcionalidades</a>
        <a href="#planos">Planos</a>
        <a href="#depoimentos">Depoimentos</a>
        <a href="sintropia-login.html">Entrar</a>
      </div>

      <div class="footer-col">
        <h4>Recursos</h4>
        <a href="#">Central de ajuda</a>
        <a href="#">Status do sistema</a>
        <a href="#">Segurança &amp; LGPD</a>
        <a href="#">Novidades</a>
      </div>

      <div class="footer-col">
        <h4>Contato</h4>
        <a href="#">contato@meusistema.psi</a>
        <a href="#"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
        <a href="#"><i class="fa-brands fa-instagram"></i> Instagram</a>
        <a href="#"><i class="fa-brands fa-linkedin"></i> LinkedIn</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Meu Sistema.PSI · CNPJ 00.000.000/0001-00</span>
      <span>
        <a href="#" style="margin-right: 16px;">Termos de uso</a>
        <a href="#">Privacidade</a>
      </span>
    </div>
  </div>
</footer>

<a href="#" class="wa-float" aria-label="Falar no WhatsApp">
  <i class="fa-brands fa-whatsapp"></i>
</a>
`;

  // Find hero and insert after it
  const hero = document.querySelector('.hero');
  if (hero) hero.insertAdjacentHTML('afterend', html);
})();
