# 📱 Planejamento: App Android — MeuPSI (App Único com Perfis)

> **Status:** 🟡 PLANEJAMENTO FUTURO — Não iniciado  
> **Criado em:** Abril de 2026  
> **Objetivo:** Criar **um único app Android** chamado **MeuPSI** que detecta o perfil do usuário após o login e exibe duas experiências completamente distintas — uma para profissionais e outra para pacientes.

---

## 🎯 Visão Geral — Ecossistema Multiplataforma

O **Meu Sistema PSI** já funciona muito bem como aplicação web (React + Vite + Supabase). O objetivo é expandir para Android com **um único app** chamado **MeuPSI**, que detecta o perfil do usuário no login e exibe experiências completamente distintas:

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend Único)                  │
│        PostgreSQL + Auth + Realtime + Storage + RLS         │
└───────────────────────┬─────────────────────────────────────┘
                        │
          ┌─────────────┴───────────────────────────────────┐
          │                                                  │
┌─────────▼──────────┐       ┌────────────────────────────▼─────────────────┐
│   🌐 Web App       │       │           📱 MeuPSI  (App Único Android)     │
│  (já existe)       │       │             Expo + React Native               │
│  React + Vite      │       │                                               │
│  Vercel Deploy     │       │  Login → lê role do usuário no Supabase       │
└────────────────────┘       │        ↓                      ↓               │
                             │  👨‍⚕️ Perfil Profissional  🧑‍💼 Perfil Paciente │
                             │  (experiência clínica)  (experiência pessoal) │
                             └───────────────────────────────────────────────┘
```

### Princípios do ecossistema:
- ✅ A versão web **inalterada** e totalmente funcional
- ✅ **Um único banco de dados** — tudo sincronizado sempre
- ✅ **Um único app Android** — dois perfis, duas experiências completamente diferentes
- ✅ **Mesma tela de login** — o role do usuário determina qual UI é exibida
- ✅ **RLS do Supabase** garante que cada usuário vê só o que lhe pertence
- ✅ Código organizado por perfil — fácil separar em dois apps futuramente, se necessário

---

## 🏗️ Estrutura de Pastas Proposta

```
Meu Sistema PSI/                    ← Raiz do repositório atual
│
├── src/                            ← Código web (React/Vite) — NÃO TOCAR
├── public/
├── index.html
├── package.json                    ← Projeto web
├── vite.config.js
│
├── apps/                           ← 📱 NOVA PASTA — App Mobile
│   └── meupsi/                     ← App único (profissional + paciente)
│       ├── app/
│       │   ├── _layout.tsx         ← Roteador raiz: detecta role e redireciona
│       │   ├── (auth)/
│       │   │   ├── login.tsx              ← Tela de login única para todos
│       │   │   └── aceitar-convite.tsx    ← Valida token de convite via deep link
│       │   │
│       │   ├── (profissional)/     ← 👨‍⚕️ Experiência do Profissional
│       │   │   ├── _layout.tsx     ← Bottom bar do profissional
│       │   │   ├── dashboard.tsx
│       │   │   ├── agenda.tsx
│       │   │   ├── pacientes/
│       │   │   │   ├── index.tsx
│       │   │   │   └── [id].tsx    ← Ficha do paciente
│       │   │   └── financeiro.tsx
│       │   │
│       │   └── (paciente)/         ← 🧑‍💼 Experiência do Paciente
│       │       ├── _layout.tsx     ← Bottom bar do paciente (5 abas)
│       │       ├── inicio.tsx
│       │       ├── sessoes.tsx
│       │       ├── diario/
│       │       │   ├── index.tsx   ← Registro de humor
│       │       │   ├── historico.tsx
│       │       │   └── analises.tsx
│       │       ├── pagamentos.tsx
│       │       └── tarefas.tsx
│       │
│       ├── components/
│       │   ├── shared/             ← Componentes usados pelos dois perfis
│       │   ├── profissional/       ← Componentes exclusivos do profissional
│       │   └── paciente/           ← Componentes exclusivos do paciente
│       ├── hooks/
│       ├── package.json
│       ├── app.config.js           ← Bundle ID: com.meupsi.app
│       └── README.md
│
├── shared/                         ← 🔗 Código compartilhado (web + app)
│   ├── lib/
│   │   └── supabase.ts             ← Conexão Supabase única
│   ├── hooks/                      ← Hooks reutilizáveis
│   ├── utils/                      ← Funções utilitárias
│   └── constants/                  ← Constantes do sistema
│
└── PLANEJAMENTO_APP_ANDROID.md     ← Este arquivo
```

---

## 🔀 Arquitetura de Perfis — App Único

Após o login, o app lê o `role` do usuário no Supabase e redireciona automaticamente:

```
┌──────────────────────────────────────────────────────────┐
│                   Tela de Login (única)                   │
│           login.tsx — mesma para todos                    │
└───────────────────────┬──────────────────────────────────┘
                        │
              Supabase Auth → lê role
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
┌──────────────────┐       ┌──────────────────────┐
│  role =          │       │  role =               │
│  'profissional'  │       │  'paciente'           │
│  ou 'admin'      │       │                       │
│  ↓               │       │  ↓                    │
│  /(profissional) │       │  /(paciente)          │
│  /dashboard      │       │  /inicio              │
└──────────────────┘       └──────────────────────┘
```

---

## 👨‍⚕️ Perfil do Profissional — Funcionalidades

### MVP (Fase 1)

| Módulo | Prioridade | Descrição |
|---|---|---|
| 🔐 Login + detecção de perfil | 🔴 Alta | Mesma conta do web, biometria opcional |
| 📊 Dashboard resumido | 🔴 Alta | Sessões do dia, receitas, alertas |
| 📅 Agenda | 🔴 Alta | Ver, criar e editar agendamentos |
| 👥 Lista de Pacientes | 🔴 Alta | Pesquisar e acessar fichas |
| 📋 Prontuário (leitura) | 🔴 Alta | Acesso rápido antes da sessão |
| 🔔 Notificações Push | 🔴 Alta | Lembretes de sessão |

### Versão Completa (Fase 3)

| Módulo | Prioridade | Descrição |
|---|---|---|
| 📝 Evolução de Sessão | 🟡 Média | Criar e salvar evoluções pelo app |
| 💰 Financeiro | 🟡 Média | Lançamentos do dia, cobrança rápida |
| 📄 Documentos | 🟡 Média | Visualizar laudos e atestados |
| 🤖 Psiquê AI | 🟡 Média | Assistente clínica mobile |
| 📴 Modo offline | 🟢 Baixa | Cache de agenda e pacientes |

### Screens do Profissional
```
Login → detecta role → redireciona para:
  └─ Dashboard
       ├─ Agenda
       │    ├─ Ver agendamentos do dia/semana
       │    ├─ Novo agendamento
       │    └─ Detalhe do agendamento
       ├─ Pacientes
       │    ├─ Lista de pacientes
       │    ├─ Ficha do paciente
       │    │    ├─ Prontuário
       │    │    ├─ Histórico de Evoluções
       │    │    └─ Documentos
       │    └─ Nova evolução de sessão
       ├─ Financeiro
       │    ├─ Resumo do dia/mês
       │    └─ Novo lançamento
       └─ Configurações
            └─ Perfil profissional
```

---

## 🧠 UX Architecture — Modelo Mental do Profissional

> **Princípio fundamental:** O profissional nunca pensa em termos de *ação* — ele pensa em termos de *paciente*. O app deve seguir o mesmo raciocínio: **o contexto do paciente sempre vem antes de qualquer ação.**

### 🔐 Regra de Ouro

> **O profissional nunca precisa selecionar o paciente num campo "Para:".**
> O paciente já está definido pelo caminho de navegação que ele percorreu.

Isso elimina o risco crítico de **enviar dados, mensagens ou lembretes para o paciente errado**.

---

### 📍 Três pontos de entrada que criam contexto

```
PROFISSIONAL abre o app
│
├── 📅 AGENDA (entrada principal — dia a dia)
│   └─ Toca numa sessão "Ana Lima | 10:00"
│       └─ CONTEXTO: Ana Lima ativado
│           ├─ Ver humor registrado essa semana     ← inteligência clínica
│           ├─ Acessar prontuário rápido
│           ├─ Registrar evolução pós-sessão
│           └─ [botão] Enviar lembrete → notificação push para ANA
│
├── 👥 PACIENTES (busca ativa por um paciente)
│   └─ Busca ou seleciona "Carlos Souza"
│       └─ CONTEXTO: Carlos Souza ativado
│           ├─ Ficha completa, prontuário, documentos
│           ├─ Diário de humor (o que Carlos registrou)  ← clínico
│           ├─ Comunicações — histórico de mensagens
│           └─ Ações: Enviar tarefa | Enviar lembrete
│
└── 🔔 NOTIFICAÇÕES (entrada passiva — o sistema avisa)
    └─ Toca num item
        └─ CONTEXTO do paciente é carregado automaticamente
            ├─ Vai para a ficha do paciente em questão
            └─ Vai direto para o contexto relevante (chat, humor, sessão)
```

---

### 🔔 Tipos de Notificação Recebida pelo Profissional

| Tipo | Exemplo | Prioridade | Ação esperada |
|---|---|---|---|
| 🔴 **Ação necessária** | "Carlos cancelou a sessão de sexta" | Alta | Reagendar |
| 🟡 **Informação clínica** | "Ana registrou 'Muito Triste' na seg" | Média | Preparar sessão |
| 💬 **Mensagem do paciente** | "Maria enviou uma mensagem" | Alta | Responder |
| 🟢 **Confirmação** | "João confirmou a sessão de quinta" | Baixa | Nenhuma |

> Cada notificação **identifica claramente o paciente** e leva direto ao contexto dele ao ser tocada.

---

### 💬 Comunicações Clínicas (não é "chat")

> Psicólogos não têm conversas informais com pacientes. Isso tem implicações éticas e legais.
> O correto é **"Comunicações Clínicas"** — mensagens registradas, rastreanáveis e contextualizadas na ficha do paciente.

```
Para o PROFISSIONAL — acesso pelas comunicações:
  Pacientes → Ana Lima → Comunicações
  └─ Histórico de mensagens com a Ana
  └─ Campo para resposta
  └─ Todas as mensagens ficam gravadas na ficha da Ana

Para o PROFISSIONAL — atalho pela notificação:
  🔔 "Ana enviou uma mensagem" → toca → abre chat NO CONTEXTO DA ANA
  (não abre uma tela genérica de mensagens)
```

---

### 📂 Implicações no Banco de Dados (Supabase)

Essas decisões de UX impactam diretamente a estrutura das tabelas:

```sql
-- Toda mensagem sempre tem paciente_id E profissional_id
CREATE TABLE mensagens_clinicas (
  id uuid PRIMARY KEY,
  paciente_id uuid REFERENCES pacientes(id),
  profissional_id uuid REFERENCES profissionais(id),
  remetente_role text CHECK (remetente_role IN ('profissional', 'paciente')),
  conteudo text,
  lida boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Toda notificação sempre tem paciente_id + tipo + prioridade
CREATE TABLE notificacoes (
  id uuid PRIMARY KEY,
  destinatario_id uuid,           -- profissional ou paciente
  paciente_id uuid REFERENCES pacientes(id),  -- sempre identificado!
  tipo text,                     -- 'cancelamento' | 'humor' | 'mensagem' | 'confirmacao'
  prioridade text,               -- 'alta' | 'media' | 'baixa'
  payload jsonb,                 -- dados extras da notificação
  lida boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

> ⚠️ **Regra RLS:** Profissional só vê notificações dos seus próprios pacientes. Paciente só vê notificações direcionadas a ele.

---


## 🧑‍💼 Perfil do Paciente — Funcionalidades

> **Acesso:** E-mail automático ao cadastrar + QR Code como alternativa. Paciente pode se auto-cadastrar e solicitar vínculo com a clínica.

### 🔗 Deep Linking — Fluxo de Convite

> O convite por e-mail **deve abrir o app diretamente** na tela correta. Sem deep linking, o paciente cai no navegador e o fluxo quebra.

```
Profissional cadastra paciente no web
  → Supabase Edge Function dispara e-mail com link:
    meupsi://convite?token=abc123&clinica=xyz
      ↓
    App instalado?
      Sim → abre direto em (auth)/aceitar-convite.tsx
      Não → redireciona para Play Store
        → após instalar, o link é retomado (Expo Linking)
```

**Configuração necessária:**
- `app.config.js`: scheme `meupsi` + intent filters Android
- `intentFilters` para HTTPS também (universal links como fallback)
- Tela `(auth)/aceitar-convite.tsx` valida token e cria conta do paciente

**Token de convite — segurança e expiração:**

```sql
CREATE TABLE convites_paciente (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  paciente_email text NOT NULL,
  profissional_id uuid REFERENCES profissionais(id),
  clinica_id uuid REFERENCES clinicas(id),
  expira_em timestamptz NOT NULL DEFAULT now() + interval '7 days',
  usado_em timestamptz,             -- NULL = ainda não usado
  created_at timestamptz DEFAULT now()
);
```

| Cenário | Comportamento |
|---|---|
| Token válido, app instalado | Abre `aceitar-convite.tsx`, cria conta e vincula |
| Token expirado | Tela de erro com opção de solicitar novo convite ao profissional |
| Token já usado | Tela informando que o convite já foi utilizado + ir para login |
| App não instalado | Redireciona para Play Store; após instalar, Expo Linking retoma o link |

### 🤝 Fluxo de Aprovação de Vínculo (auto-cadastro)

> Decisão 6 define que o paciente pode se cadastrar sozinho e "solicitar vínculo". O fluxo de aprovação precisa estar detalhado — sem ele, a feature fica incompleta.

```
PACIENTE abre o app → cria conta própria
  → Busca a clínica pelo nome ou código
  → Envia solicitação de vínculo
    → Supabase cria registro em `solicitacoes_vinculo` (status: 'pendente')
    → Notificação push + e-mail para o PROFISSIONAL/ADMIN

PROFISSIONAL recebe notificação: "Maria Silva quer se vincular à sua clínica"
  → Abre o app (ou web)
  → Aprova ou rejeita
    → Aprovado: `solicitacoes_vinculo.status = 'aprovado'` + cria relação profissional↔paciente
    → Rejeitado: notificação para o paciente

PACIENTE recebe: "Seu vínculo foi aprovado. Bem-vindo(a)!"
```

```sql
CREATE TABLE solicitacoes_vinculo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_user_id uuid REFERENCES auth.users(id),
  clinica_id uuid REFERENCES clinicas(id),
  profissional_id uuid REFERENCES profissionais(id),
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  mensagem text,
  criado_em timestamptz DEFAULT now(),
  resolvido_em timestamptz
);
```

### Funcionalidades — MVP / Versão 1 (Fase 2)


| Módulo | Aba | Prioridade | Descrição |
|---|---|---|---|
| 🔐 Login + Biometria | — | 🔴 Alta | Login com biometria **obrigatória** (dados sensíveis de saúde) |
| 🏠 Home personalizada | Início | 🔴 Alta | Saudação com nome, humor rápido e próxima sessão |
| 📅 Sessões | Sessões | 🔴 Alta | Próximas sessões + histórico, cancelamento com 24h |
| 😊 Diário de Emoções | Diário | 🔴 Alta | Registro de humor com 5 emojis + data/hora |
| 📊 Minhas Análises | Diário | 🔴 Alta | Gráfico semanal de emoções por dia |
| 📋 Histórico de Humor | Diário | 🔴 Alta | Lista de registros com busca e edição |
| 💳 Pagamentos | Pagamentos | 🔴 Alta | Ver cobranças e status de pagamento |
| ✅ Tarefas | Tarefas | 🟡 Média | Tarefas e questionários enviados pelo profissional |
| 🔔 Notificações | — | 🔴 Alta | Lembrete de sessão 24h antes |

### Funcionalidades — Versão 2 (Fase 4)

| Módulo | Prioridade | Descrição |
|---|---|---|
| 💬 Chat seguro | 🟡 Média | Canal de mensagens bidirecional profissional ↔ paciente |
| 📋 Meus Documentos | 🟡 Média | Laudos, atestados, TCLEs enviados pelo profissional |
| 📊 Linha do tempo | 🟡 Média | Progresso do tratamento (somente leitura) |
| 🔔 Lembretes de rotina | 🟢 Baixa | "Hora de fazer seu exercício de respiração" |
| 🧠 Psicoeducação | 🟢 Baixa | Artigos e conteúdos enviados pelo profissional |

### Navegação — Bottom Bar (5 abas)

```
😊 Diário  ←  aba central e destacada (igual ao app de referência)

┌──────────┬──────────┬──────────┬──────────┬──────────┐
│  Início  │  Sessões │  Diário  │Pagamentos│  Tarefas │
│    🏠    │    📅    │    😊    │    💳    │    ✅    │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

### Screens planejadas
```
Login do Paciente (+ biometria obrigatória)
  └─ Início
       ├─ Saudação personalizada "Olá, [Nome]"
       ├─ Seletor de humor rápido (5 emojis)
       └─ Próxima sessão (card com data, tipo, horário, pagamento)
  └─ Sessões
       ├─ Próximas sessões
       │    └─ Card: data, dia, tipo, horário, status pagamento
       └─ Histórico de sessões
  └─ Diário (aba central)
       ├─ Registro de humor
       │    ├─ Seletor de data e hora
       │    └─ 5 emojis: Muito Feliz → Muito Triste
       ├─ Histórico de registros
       │    ├─ Lista com data, humor, status
       │    └─ Busca + edição
       └─ Minhas Análises
            └─ Gráfico semanal (emojis no eixo Y × dias no eixo X)
  └─ Pagamentos
       └─ Cobranças e status de pagamento
  └─ Tarefas
       └─ Tarefas e escalas enviadas pelo profissional
```

---

## 🔐 Arquitetura de Segurança — Perfis e RLS

O Supabase usa **Row Level Security (RLS)** para separar o que cada usuário pode ver. Será necessário criar políticas específicas para os pacientes.

```sql
-- Exemplo de política: Paciente só vê seus próprios agendamentos
CREATE POLICY "paciente_ver_proprios_agendamentos"
ON agendamentos FOR SELECT
USING (paciente_id = auth.uid());

-- Profissional vê todos os agendamentos da clínica
CREATE POLICY "profissional_ver_agendamentos_clinica"
ON agendamentos FOR SELECT
USING (clinica_id = get_clinica_do_usuario());
```

### Papéis (Roles) no sistema:
| Role | Pode fazer | Experiência no app mobile |
|---|---|---|
| `admin` / `profissional` | Tudo (CRUD completo) | UI do Profissional completa |
| `colaborador` | Agendamento + pacientes (limitado) | ⚠️ Ver decisão abaixo |
| `paciente` | Somente leitura de seus dados + confirmação | UI do Paciente |

### Decisão — Role `colaborador` no mobile

> O `colaborador` existe no sistema web mas não foi originalmente planejado para o mobile. A decisão precisa ser tomada antes da implementação do `_layout.tsx` raiz.

| # | Pergunta | Decisão |
|---|---|---|
| 11 | **`colaborador` acessa o app mobile?** | ✅ **Sim** — vê a UI do Profissional com funcionalidades limitadas (apenas Agenda e Pacientes; sem Financeiro e sem Psiquê AI) |

```
_layout.tsx → lê role do Supabase
  ├── 'profissional' ou 'admin' → /(profissional) completo
  ├── 'colaborador'             → /(profissional) com abas Financeiro e IA ocultas
  ├── 'paciente'                → /(paciente)
  └── role desconhecido         → tela de erro + logout
```

> **Atenção:** Verificar as políticas RLS existentes no Supabase antes de implementar o app do paciente. Pode ser necessário criar novas políticas sem quebrar o atual.

---

## 🔒 LGPD — Requisitos para App de Saúde

> Dados de saúde são **categoria especial** conforme Art. 11 da LGPD. O app precisa ir além do RLS e atender requisitos legais — alguns deles **bloqueantes para publicação na Play Store**.

### Requisitos obrigatórios

| Requisito | Descrição | Fase |
|---|---|---|
| **TCLE digital** | Paciente assina Termo de Consentimento Livre e Esclarecido dentro do app antes de qualquer dado ser coletado. Registro deve ficar gravado no banco com timestamp e versão do termo. | Fase 2 |
| **Exclusão de dados** | Paciente deve poder solicitar exclusão completa da sua conta e de todos os seus dados. Profissional e admin devem poder executar a exclusão. | Fase 2 |
| **Política de Privacidade pública** | URL pública obrigatória para publicação na Play Store. Deve cobrir coleta de dados de saúde. | Antes da Fase 3 |
| **Consentimento granular** | Usuário deve poder aceitar/recusar categorias específicas de dados (ex: compartilhar diário de humor com o profissional). | Fase 2 |

### Tabela sugerida para controle de consentimento

```sql
CREATE TABLE consentimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  tipo text NOT NULL,          -- 'tcle' | 'politica_privacidade' | 'compartilhar_humor'
  versao text NOT NULL,        -- versão do documento aceito
  aceito boolean NOT NULL,
  aceito_em timestamptz DEFAULT now(),
  ip_address text,             -- para auditoria
  user_agent text
);
```

---

## 🔐 Segurança Mobile — Auto-lock e Biometria

### Auto-lock por inatividade

> App de saúde com biometria na entrada mas sem travamento por inatividade não fecha o ciclo de segurança. Se o paciente (ou profissional) deixar o app em segundo plano, deve pedir autenticação ao retornar.

```typescript
// Usando AppState do React Native
import { AppState } from 'react-native';

const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos

// Ao entrar em background: salvar timestamp
// Ao voltar ao foreground: comparar timestamp e pedir biometria se expirado
```

- **Profissional:** timeout de 10 minutos (uso frequente durante o dia)
- **Paciente:** timeout de 5 minutos (dados mais sensíveis, uso esporádico)

### Session expiry após auto-lock

> O Supabase client renova o JWT automaticamente enquanto o app está ativo. Mas se o app ficou travado em background por horas, o token pode ter expirado quando o usuário desbloqueia com biometria. É preciso definir o comportamento.

**Decisão adotada — Opção A (silenciosa):**

```
Usuário desbloqueia com biometria
  → App tenta renovar token em background via supabase.auth.refreshSession()
      ├── Token renovado com sucesso → app abre normalmente (sem atrito)
      └── Renovação falhou (offline ou refresh token expirado)
            → Exibir tela de "Sua sessão expirou" + botão de login
            (não forçar logout silencioso — usuário entende o que aconteceu)
```

> **Regra:** biometria desbloqueia a **tela**. O **Supabase** valida se a sessão ainda é válida. São duas camadas independentes.

### Fallback de biometria obrigatória (perfil Paciente)

> Biometria é obrigatória para o paciente, mas nem todo dispositivo tem biometria registrada. Sem definir fallback, o app quebra nesses casos.

| Cenário | Comportamento definido |
|---|---|
| Dispositivo sem biometria registrada | Solicitar criação de PIN de 6 dígitos (via `expo-local-authentication` + `expo-secure-store`) |
| Biometria falha 3x | Oferecer PIN como alternativa temporária |
| Dispositivo sem suporte a biometria | PIN obrigatório (sem opção de biometria) |
| PIN esquecido | Re-autenticar via e-mail (Supabase OTP) e redefinir PIN |

---

## 🔗 Estratégia de Sincronização — Supabase Único

```
🌐 Web App          ──┐
                       │
👨‍⚕️ App Profissional ──┼──→  Supabase  ←── Banco único, dados em tempo real
                       │
🧑‍💼 App Paciente    ──┘
```

### O que já funciona automaticamente:
- ✅ **Auth** — Contas separadas por role (profissional vs paciente)
- ✅ **Realtime** — Se profissional edita agenda, paciente vê na hora
- ✅ **Storage** — Documentos acessíveis por ambos (com permissão)
- ✅ **Push Notifications** — Via Expo + Supabase Edge Functions

### Fluxo de notificação ao paciente:
```
Profissional confirma sessão no Web
  → Supabase Edge Function dispara
    → Expo Push Service envia notificação
      → App do Paciente recebe: "Sua consulta é amanhã às 14h ✅"
```

---

## 🛠️ Stack Tecnológica — Ambos os Apps

### ✅ Recomendação: **Expo + React Native** para ambos

| Camada | Tecnologia |
|---|---|
| Framework | React Native (via Expo SDK 52+) |
| Navegação | Expo Router (file-based, igual Next.js) |
| Backend | Supabase (mesmo do web) |
| Auth | Supabase Auth + `expo-secure-store` |
| Estilização | NativeWind (Tailwind para RN) |
| Estado/Cache | TanStack Query (React Query) |
| Notificações | Expo Notifications + FCM |
| Deep Linking | Expo Linking + scheme `meupsi://` |
| Crash / Monitoramento | Sentry (`@sentry/react-native`) |
| Build/Deploy | EAS Build (Expo Application Services) |
| Atualizações OTA | Expo Updates |
| Android mínimo | API 24 (Android 7.0) — exigido pelo Expo SDK 52 |

### Por que o mesmo stack para os dois apps?
1. **Compartilhamento máximo de código** — hooks, utils, lib Supabase
2. **Um só processo de build** — EAS Build gerencia os dois
3. **Uma só conta Expo** — dois projetos dentro
4. **Consistência** — se atualizar a lib Supabase, atualiza os dois de uma vez

---

## 📦 Dependências (Iguais para os dois apps)

```json
{
  "expo": "~52.x",
  "react-native": "0.76.x",
  "@supabase/supabase-js": "^2.x",
  "expo-router": "^4.x",
  "expo-notifications": "~0.29.x",
  "expo-secure-store": "~14.x",
  "expo-local-authentication": "~14.x",
  "@react-native-async-storage/async-storage": "^2.x",
  "@tanstack/react-query": "^5.x",
  "nativewind": "^4.x",
  "tailwindcss": "^3.x",
  "react-native-reanimated": "~3.16.x",
  "react-native-gesture-handler": "~2.20.x",
  "expo-image": "~2.x",
  "expo-updates": "~0.26.x",
  "expo-linking": "~7.x",
  "@sentry/react-native": "^6.x"
}
```

---

## 🗂️ Código Compartilhável — Web + App MeuPSI

| Arquivo/Pasta | Web | App (Perfil Prof.) | App (Perfil Pac.) | Onde fica |
|---|---|---|---|---|
| Conexão Supabase | ✅ | ✅ | ✅ | `shared/lib/` |
| Hooks de dados | ✅ | ✅ | ✅ | `shared/hooks/` |
| Utilitários JS | ✅ | ✅ | ✅ | `shared/utils/` |
| Constantes | ✅ | ✅ | ✅ | `shared/constants/` |
| Lógica de Auth + role | — | ✅ | ✅ | `apps/meupsi/hooks/` |
| Componentes UI base | — | ⚠️ Shared | ⚠️ Shared | `apps/meupsi/components/shared/` |
| Componentes específicos | — | ❌ Profissional | ❌ Paciente | Cada pasta |
| CSS / Tailwind | ✅ | ❌ NativeWind | ❌ NativeWind | Cada projeto |

---

## 🚀 Fases de Execução

### 📌 Fase 0 — Preparação Geral (1 dia)
- [ ] Criar estrutura de pastas `apps/meupsi/` e `shared/`
- [ ] Mover `src/lib/supabase.js` para `shared/lib/`
- [ ] Configurar **npm workspaces** na raiz para que web e mobile possam importar de `shared/`
  - `package.json` raiz com `"workspaces": ["apps/meupsi", "shared"]`
  - Path alias `@shared/*` em `tsconfig.json`, `vite.config.js` (web) e `babel.config.js` (Expo)
- [ ] Criar conta Expo e projeto EAS (`com.meupsi.app`)
- [ ] Configurar `.gitignore` para `apps/*/node_modules`
- [ ] **Banco de Dados:** Preparar novas tabelas:
  - `diario_humor` — registros de humor do paciente
  - `notificacoes` — notificações contextualizadas com `paciente_id`
  - `tarefas_clinicas` — tarefas enviadas pelo profissional
  - `mensagens_clinicas` — comunicações clínicas rastreáveis
  - `consentimentos` — TCLE e aceites de termos (LGPD)
  - `solicitacoes_vinculo` — pedidos de vínculo de pacientes auto-cadastrados
  - `convites_paciente` — tokens de convite por e-mail com TTL
- [ ] **Auth:** Adicionar coluna `auth_user_id` na tabela `patients` para vínculo de login
- [ ] Revisar/criar políticas RLS para o role `paciente`

### 📌 Fase 1 — Infraestrutura + Perfil do Profissional MVP (1-2 semanas)
- [ ] Inicializar Expo em `apps/meupsi/`
- [ ] Configurar NativeWind + TanStack Query
- [ ] Configurar Sentry (`@sentry/react-native`) para monitoramento de crashes
- [ ] Tela de Login única
- [ ] Lógica de detecção de role + redirecionamento automático
- [ ] Biometria opcional no login do profissional
- [ ] Auto-lock por inatividade (10 min para profissional)
- [ ] **Perfil Profissional:** Dashboard, Agenda, Pacientes, Prontuário (leitura)
- [ ] Notificações push (profissional) — incluindo notificação de solicitação de vínculo
- [ ] Fluxo de permissão de notificações (Android 13+ exige permissão explícita — solicitar após login, explicar o impacto se negado)
- [ ] Splash screen e ícone do MeuPSI
- [ ] Build de teste via EAS

### 📌 Fase 2 — Perfil do Paciente MVP (1-2 semanas)
- [ ] **Bottom Bar do Paciente** (5 abas: Início, Sessões, Diário, Pagamentos, Tarefas)
- [ ] Configurar Deep Linking (`meupsi://` + intent filters Android)
- [ ] Tela `(auth)/aceitar-convite.tsx` — valida token e cria conta via deep link
- [ ] Sistema de convite (e-mail automático + QR Code)
- [ ] Auto-cadastro do paciente com solicitação de vínculo à clínica
- [ ] Fluxo de aprovação/rejeição de vínculo (tabela `solicitacoes_vinculo` + notificação para profissional)
- [ ] **TCLE digital** — paciente assina termo antes de usar o app (grava versão + timestamp)
- [ ] Biometria **obrigatória** no perfil do paciente + fallback PIN de 6 dígitos
- [ ] Auto-lock por inatividade (5 min para paciente)
- [ ] **Home (Início):** saudação + humor rápido + próxima sessão
- [ ] **Sessões:** próximas + histórico + cancelamento com 24h
- [ ] **Diário:** registro de humor (5 emojis + data/hora)
- [ ] **Diário → Histórico:** lista com busca e edição
- [ ] **Diário → Minhas Análises:** gráfico semanal de emoções
- [ ] **Pagamentos:** cobranças e status
- [ ] **Tarefas:** escalas e tarefas enviadas pelo profissional
- [ ] Notificações push (paciente) — solicitar permissão após TCLE (Android 13+), com fallback gracioso se negado
- [ ] Fluxo de exclusão de conta e dados (LGPD)
- [ ] Build de teste via EAS

### 📌 Fase 3 — App Completo + Publicação (1-2 semanas)
- [ ] **Profissional:** Evolução de sessão, Financeiro, Documentos, Psiquê AI
- [ ] **Paciente:** Chat bidirecional, Meus Documentos, Linha do tempo, Lembretes
- [ ] Cache offline (React Query + persistência local)
- [ ] **Preparação Play Store:**
  - [ ] Criar/verificar Google Play Developer Account (USD 25, único)
  - [ ] Configurar app signing via EAS (`eas build --platform android`)
  - [ ] Preencher questionário de Content Rating (apps de saúde têm perguntas específicas)
  - [ ] Publicar Política de Privacidade em URL pública (obrigatório para apps de saúde)
  - [ ] Preparar screenshots (mínimo 2), ícone hi-res (512×512) e banner feature (1024×500)
  - [ ] Escrever descrição curta e longa do app em pt-BR
  - [ ] Configurar EAS Submit para envio automatizado à Play Store
- [ ] **Internal Testing** — publicar primeiro para a faixa interna (equipe) e validar
- [ ] **Closed Testing (beta)** — grupo fechado de pacientes e profissionais reais testando
- [ ] **Produção** — promover para produção somente após validação nas faixas anteriores

---

## 💡 Ideias Extras para Pensar no Futuro

### Para o App do Paciente:
- **🎯 Metas terapêuticas** — Profissional define, paciente acompanha e registra progresso
- **📓 Diário de humor aprimorado** — Além dos emojis, adicionar nota textual ao registro
- **🗓️ Calendário de humor** — Visualização mensal (heat map por emoção)

> ✅ **Diário de Emoções, Gráfico Semanal, Chat e Pagamentos** foram movidos para as Fases 3 e 4 (não são mais "extras" — são features principais).

### Para o App do Profissional:
- **⏱️ Timer de sessão** — Cronômetro discreto durante a consulta
- **🎙️ Ditado por voz** — Criar evoluções por voz (transcrição automática)
- **🗺️ Mapa de humor do paciente** — Ver humor registrado pelo paciente antes da sessão
- **📲 QR Code** — Gerar QR para o paciente baixar e vincular o app rapidamente

### Para o Ecossistema como um todo:
- **iOS** — Com Expo, o mesmo código gera app para iPhone com mínimo esforço extra
- **PWA** — O app web já poderia ser instalável como PWA (step intermediário)

---

## ⚠️ Pontos de Atenção

> **IMPORTANTE:** O app único (`meupsi`) tem seu próprio `package.json`. Para instalar dependências, entrar na pasta do app primeiro:
> ```bash
> cd apps/meupsi && npm install
> ```

> **IMPORTANTE:** As variáveis de ambiente precisam ser gerenciadas com cuidado — algumas são públicas por design, outras **nunca devem entrar no app mobile**:
>
> | Variável | Onde vai | Motivo |
> |---|---|---|
> | `SUPABASE_URL` | `app.config.js` (público) | Não é segredo |
> | `SUPABASE_ANON_KEY` | `app.config.js` (público) | Projetado para ser exposto — RLS protege os dados |
> | `SUPABASE_SERVICE_ROLE_KEY` | **Nunca no app mobile** | Bypassa o RLS completamente — somente em Edge Functions |
> | `SENTRY_DSN` | EAS Secrets | Não precisa ser público |
>
> ⚠️ A `service_role` key no app mobile daria a qualquer usuário acesso irrestrito ao banco inteiro.

> **ATENÇÃO:** O perfil do paciente exige **novas políticas RLS** no Supabase para garantir que pacientes só vejam seus próprios dados. Isso deve ser feito com muito cuidado para não quebrar o acesso atual dos profissionais.

> **ATENÇÃO:** A geração de PDFs (laudos, atestados) não funciona diretamente no React Native. Para o perfil do paciente, os documentos serão **visualizados** (não gerados). Para o profissional, pode-se redirecionar para o web ou usar `react-native-pdf`.

> **ATENÇÃO LGPD:** A Política de Privacidade deve estar publicada em URL pública **antes** de submeter o app à Play Store. Apps de saúde que coletam dados sensíveis sem declarar adequadamente são rejeitados ou removidos pela Google.

> **ATENÇÃO:** O auto-lock por inatividade usa `AppState` do React Native. Testar especialmente no Android — o comportamento de background pode variar entre fabricantes (Samsung, Xiaomi) que modificam o gerenciamento de processos.

> ✅ **App único na Google Play** — Um só `applicationId`: `com.meupsi.app`. O usuário baixa um app só e vê a experiência correta conforme seu perfil.

---

## ✅ Decisões Tomadas (Abril/2026)

> Estas decisões foram definidas antes do início da execução e orientam toda a implementação.

### Sobre a arquitetura do app:

| # | Pergunta | Decisão |
|---|---|---|
| 🆕 | **Um ou dois apps?** | ✅ **Um único app** — com detecção de perfil por role |
| 1 | **Qual perfil implementar primeiro?** | ✅ **Perfil do Profissional** — menor complexidade de RLS |
| 2 | **iOS no futuro?** | ❌ **Apenas Android** por enquanto |
| 3 | **Nome do app na Play Store?** | ✅ **"MeuPSI"** — bundle ID: `com.meupsi.app` |
| 4 | **Ícone e splash screen?** | ✅ **Único** — identidade visual do MeuPSI |

### Sobre o perfil do paciente:

| # | Pergunta | Decisão |
|---|---|---|
| 5 | **Como o paciente é convidado?** | ✅ **E-mail automático + QR Code** como alternativa |
| 6 | **O paciente pode criar conta sozinho?** | ✅ **Sim** — se cadastra e solicita vínculo com a clínica |
| 7 | **O paciente pode cancelar sessão pelo app?** | ✅ **Sim** — com prazo mínimo de 24h |
| 8 | **Chat entre profissional e paciente?** | ✅ **Sim** — canal de mensagens seguro bidirecional |

### Sobre roles e acesso:

| # | Pergunta | Decisão |
|---|---|---|
| 11 | **`colaborador` acessa o app mobile?** | ✅ **Sim** — vê UI do profissional com Agenda e Pacientes; Financeiro e IA ocultos |
| 12 | **Session expirada após auto-lock?** | ✅ **Renovação silenciosa** — biometria desbloqueia a tela, Supabase renova o token em background; só exige re-login se renovação falhar |

### Sobre segurança e privacidade (LGPD):

| # | Pergunta | Decisão |
|---|---|---|
| 9 | **Quais dados o paciente pode ver?** | ✅ **Dados básicos**: nome, datas de consulta, documentos enviados pelo profissional |
| 10 | **Biometria no perfil do paciente?** | ✅ **Sim, obrigatório** — dados sensíveis de saúde exigem proteção extra |

> ✅ **Arquitetura definida:** App único **MeuPSI** (`com.meupsi.app`) com dois perfis — profissional e paciente.

---

## 🔎 Referências de Estudo

- [Expo Documentation](https://docs.expo.dev/)
- [Supabase + React Native](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Expo Router (navegação)](https://expo.github.io/router/docs/)
- [NativeWind (Tailwind para RN)](https://www.nativewind.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo Notifications + FCM](https://docs.expo.dev/push-notifications/overview/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Monorepo com Expo](https://docs.expo.dev/guides/monorepos/)

---

*Última atualização: Abril de 2026*  
*Projeto: Meu Sistema PSI — Sistema de Gestão Clínica*
