export const HELP_CONTENT = {
    dashboard: {
        title: "Sua Torre de Comando: Visão Estratégica",
        description: "Mais que um resumo, o Dashboard é onde você gerencia o crescimento da sua carreira. Tenha clareza total em segundos.",
        advantage: "Decisões seguras baseadas em dados reais, não em suposições.",
        steps: [
            { icon: "monitoring", title: "Crescimento Visível", text: "Acompanhe faturamento e novos pacientes. Se o gráfico está subindo, seu marketing está funcionando." },
            { icon: "precision_manufacturing", title: "Foco no Resultado", text: "O card 'Próxima Sessão' prepara você para o atendimento. Abra o prontuário antes mesmo do paciente chegar." },
            { icon: "psychology", title: "Sua Assistente IA", text: "A Psiquê monitora pendências e riscos, garantindo que nenhum detalhe clínico ou financeiro escape." }
        ],
        tourSteps: [
            { targetId: "tour-welcome", title: "Boas-vindas à Elite!", text: "Aqui você começa o seu dia. A Psiquê gerencia a complexidade para você focar no atendimento." },
            { targetId: "tour-stats", title: "O Pulso do Negócio", text: "Faturamento, agendamentos e base de pacientes. Indicadores claros para uma gestão profissional." },
            { targetId: "tour-proxima", title: "Sua Próxima Missão", text: "Destaque total para quem você vai atender agora. Um clique e você está dentro do prontuário." },
            { targetId: "tour-acoes", title: "Agilidade Máxima", text: "Precisa emitir um recibo ou laudo agora? Estes atalhos economizam 10 minutos por atendimento." },
            { targetId: "tour-notas", title: "Sua Memória Infinita", text: "Insights rápidos que surgem entre sessões? Anote aqui e livre sua mente para o próximo paciente." }
        ],
        extraTip: "Separe 5 minutos ao final do dia para revisar seu lucro no dashboard. Ver o progresso motiva o crescimento!"
    },
    agenda: {
        title: "Agenda Mestra: Domínio Total do Tempo",
        description: "Acabe com a bagunça do WhatsApp e com as janelas vazias na sua semana. Profissionalismo com um clique.",
        advantage: "Reduza faltas e otimize cada hora do seu dia para faturar mais com menos esforço.",
        steps: [
            { icon: "notifications_active", title: "Fim das Faltas Surpresa", text: "Lembretes automáticos criam compromisso. Paciente que confirma, comparece. Menos buracos na grade." },
            { icon: "ads_click", title: "Cobrança Automática", text: "Ao encerrar a sessão na agenda, o sistema já sabe o que cobrar. Você nunca mais esquecerá uma sessão por pagar." },
            { icon: "calendar_view_day", title: "Reagendamento Zen", text: "Mudou o horário? Basta arrastar o card. O sistema reorganiza tudo e mantém sua paz mental." }
        ],
        tourSteps: [
            { targetId: "tour-calendar", title: "Seu Tempo em Foco", text: "Este é o coração da sua clínica. Clique em qualquer horário vazio para agendar uma nova sessão." },
            { targetId: "tour-agenda-stats", title: "Visão da Semana", text: "Acompanhe aqui sua taxa de ocupação. Agenda cheia é sinal de prosperidade!" },
            { targetId: "tour-agenda-filter", title: "Filtros Rápidos", text: "Alterne entre visão de dia ou semana para organizar melhor seus atendimentos." }
        ],
        extraTip: "Use o status 'Falta Justificada' ou 'Falta Sem Aviso' para gerar cobranças automáticas e educar o paciente sobre o seu tempo."
    },
    pacientes: {
        title: "Dossiê de Pacientes: Sua Autoridade Pessoal",
        description: "Transforme cada ficha cadastral em um ativo de valor. Exale profissionalismo desde o primeiro contato.",
        advantage: "Economize 15 minutos por cadastro usando a tecnologia a seu favor.",
        steps: [
            { icon: "share", title: "Autocadastro Inteligente", text: "Envie um link e o paciente preenche tudo sozinho. Modernidade que gera autoridade imediata." },
            { icon: "history", title: "Linha do Tempo 360º", text: "Histórico completo: evoluções, exames e pagamentos em um só lugar. Nada se perde, tudo se consulta." },
            { icon: "contact_emergency", title: "Segurança de Dados", text: "Conformidade total com a LGPD e o código de ética. Seus prontuários protegidos por criptografia." }
        ],
        tourSteps: [
            { targetId: "tour-paciente-add", title: "Expansão da Clínica", text: "Cadastre ou envie o link. O link é o 'pulo do gato' para ganhar tempo na primeira sessão." },
            { targetId: "tour-paciente-search", title: "Busca de Alta Velocidade", text: "Ache qualquer pessoa ou prontuário em menos de 2 segundos. Eficiência é sinônimo de foco." },
            { targetId: "tour-paciente-list", title: "Sua Comunidade", text: "Clique para abrir o histórico clínico completo. O sistema organiza a vida do paciente para você." }
        ],
        extraTip: "Antes da primeira sessão, envie o link de autocadastro. Isso já estabelece um contrato de profissionalismo com o paciente."
    },
    prontuarios: {
        title: "Documentação de Elite com IA",
        description: "Escreva evoluções perfeitas em metade do tempo. Segurança ética e agilidade técnica unidas.",
        advantage: "A Psiquê estrutura suas notas, garantindo que você nunca mais se sinta sobrecarregado(a) com papelada.",
        steps: [
            { icon: "auto_awesome", title: "Evolução Assistida (IA)", text: "Transforme notas rápidas em textos clínicos estruturados com o apoio da IA. Ganhe horas de vida." },
            { icon: "article", title: "Modelos Oficiais", text: "Laudos, atestados e declarações prontos. O sistema preenche os dados do paciente sozinho. Basta imprimir." },
            { icon: "lock", title: "Sigilo Ético Absoluto", text: "Suas anotações estão mais seguras que em qualquer papel. Backup automático e acesso restrito." }
        ],
        tourSteps: [
            { targetId: "tour-prontuario-ia", title: "Apoio da Psiquê", text: "Deixe a IA organizar o caos. Ela sugere termos técnicos e resume sessões longas com precisão." },
            { targetId: "tour-prontuario-docs", title: "Fábrica de Laudos", text: "Documentos burocráticos feitos em segundos. O tempo que sobra, você usa com quem importa: o paciente." },
            { targetId: "tour-prontuario-history", title: "Continuidade Clínica", text: "Revisite o passado para entender o presente. O histórico organizado é sua melhor ferramenta de diagnóstico." }
        ],
        extraTip: "Use os campos de 'Medicações' e 'Alergias' no prontuário; a Psiquê cruzará esses dados para te dar alertas clínicos importantes."
    },
    financeiro: {
        title: "Fluxo de Lucro: Mais Dinheiro no Bolso",
        description: "Psicólogo também é empresário. Acabe com a bagunça nas contas e receba o valor que você merece.",
        advantage: "Reduza a inadimplência a zero com cobranças profissionais e saiba exatamente quanto você lucra.",
        steps: [
            { icon: "send_money", title: "Pix Automático", text: "Envie cobranças com QR Code exclusivo. O paciente paga na hora e o sistema dá baixa sozinho." },
            { icon: "trending_up", title: "Clareza de Lucro", text: "Saiba quanto sobra DEPOIS de pagar a clínica, supervisão e impostos. Lucro real na palma da mão." },
            { icon: "update", title: "Monitor de Inadimplência", text: "Quem não pagou? O sistema avisa em vermelho antes que a dívida acumule, permitindo uma ação ética." }
        ],
        tourSteps: [
            { targetId: "tour-financeiro-lucro", title: "Sua Realidade Financeira", text: "Não confunda faturamento com lucro. Veja aqui quanto você realmente está ganhando no mês." },
            { targetId: "tour-financeiro-pix", title: "Atalho de Recebimento", text: "Gere links de pagamento profissionais. Facilite para o paciente e receba o seu valor sem atrasos." },
            { targetId: "tour-financeiro-fluxo", title: "Gestão de Ativos", text: "Controle cada centavo. Sabendo onde você gasta, fica muito mais fácil investir no seu consultório." }
        ],
        extraTip: "Categorize seus gastos pessoais e da clínica separadamente. Isso é o que diferencia o psicólogo amador do profissional de sucesso."
    }
};
