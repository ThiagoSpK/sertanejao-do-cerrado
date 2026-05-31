# Sertanejão do Cerrado — Plataforma Multicanal

Projeto Front-end multicanal (App, Totem, Web) para a rede fictícia **Sertanejão do Cerrado**, desenvolvido como entrega da disciplina de Projeto Multidisciplinar (UNINTER, 2026).

> Adicione aqui o link público do deploy assim que estiver no ar:
> **🌐 Deploy:** _a definir após `vercel --prod`_

## Visão geral

PWA cobrindo três contextos com a mesma base de código: cliente (mobile e desktop), totem na loja, e operação interna (atendente, cozinha, gerente). O pedido nasce em qualquer canal e atravessa os outros — quem pede pelo app retira no balcão, quem digita CPF no totem acumula pontos no app.

O que está implementado:

- Cardápio que muda por unidade — algumas têm cozinha completa (galinhada com pequi, baião goiano), outras só servem café da manhã (pão de queijo, broa de fubá, café coado)
- Fluxo de pedido fim-a-fim: sacola → checkout → pagamento simulado → acompanhamento com timeline ao vivo
- Programa Clube Pequi: 1 ponto por R$ 1 creditado quando o pedido sai como retirado, três níveis (Pequi, Cagaita, Baru — frutos do cerrado) e resgate de recompensas que vira voucher na sacola
- LGPD em quatro pontos da interface (cookie banner, cadastro com checkboxes separados, modal de geolocalização, tela de privacidade com exportação JSON e exclusão de conta com confirmação dupla)
- Pagamento desacoplado simulando gateway externo — quatro métodos (PIX, crédito, débito, VR) e cartões de teste pra forçar recusa e erro
- Lado operacional: PDV pro atendente, KDS Kanban da cozinha com sincronização entre abas via storage event, Dashboard do gerente com KPIs e gráficos, e Auditoria de operações sensíveis

## Stack técnica

| Camada | Escolha |
|---|---|
| Framework | React 18 + Vite 5 + TypeScript estrito |
| Estilização | Tailwind CSS 3 + shadcn/ui (Radix UI) |
| Estado | React Context + `useReducer` (`src/contexts/*`), persistência manual em localStorage |
| Roteamento | React Router v6 + lazy/Suspense |
| Mock data | JSON estático + localStorage prefixado `raizes_*` (chaves antigas mantidas pra evitar refator amplo) |
| Gráficos | Recharts (lazy no Dashboard) |
| Notificações | Sonner |
| PWA | vite-plugin-pwa (manifest + service worker) |

## Identidade visual

Paleta inspirada no Cerrado goiano:

| Token | Hex | Uso |
|---|---|---|
| Ocre | `#B07A2E` | Cor primária (CTAs, badges de marca) |
| Fogo | `#D9A036` | Acentos quentes, promos |
| Verde-folha | `#3D6B4F` | Acento verde (sucesso, categorias regionais) |
| Areia | `#F5E6D3` | Superfície principal |
| Noite | `#1A1A2E` | Tipografia e fundos escuros |

**Fontes:** Fraunces (display, títulos editoriais) + DM Sans (UI).

## Como rodar local

```bash
# Pré-requisitos: Node 18+ e npm

# 1) instalar dependências
npm install

# 2) rodar em modo desenvolvimento
npm run dev
# abre em http://localhost:5173 (a porta varia se 5173 estiver ocupada)

# 3) build de produção (typecheck + Vite)
npm run build

# 4) preview local do build
npm run preview
```

## Contas de demonstração

Todas as contas de demo são mockadas — nenhuma autenticação real chega ao servidor.

### Cliente (rota `/login`)
| E-mail | Senha |
|---|---|
| `beatriz@cerrado.demo` | `cerrado123` |
| `lucas@cerrado.demo` | `cerrado123` |

Você também pode criar uma conta nova em `/cadastro` — ela fica persistida no `localStorage` e funciona pra logins seguintes.

### Operação interna (rota `/admin/login`)
| E-mail | Senha | Vai para |
|---|---|---|
| `atendente@sertanejao.com` | `sertao123` | PDV |
| `cozinha@sertanejao.com` | `sertao123` | KDS |
| `gerente@sertanejao.com` | `sertao123` | Dashboard + Auditoria |

## Cartões de teste do gateway simulado

| Número | Resultado |
|---|---|
| `5555 4444 3333 1111` | Recusado (saldo insuficiente) |
| `5555 4444 3333 2222` | Erro de comunicação |
| Qualquer outro | ~90% aprovado, ~10% recusado |

PIX sempre aprova — útil pra demonstrar o caminho feliz.

## Estrutura do repositório

```
sertanejao-do-cerrado-pmd/
├── README.md
├── docs/                       Documentação técnica
│   ├── 01-briefing.md
│   ├── 02-requisitos.md
│   ├── 03-fluxos.md
│   ├── 04-design-system.md
│   ├── 05-plano-testes.md
│   ├── 06-decisoes-tecnicas.md
│   └── DEPLOY.md               Passo a passo do deploy
├── design/                     Telas e tokens dos designs
├── public/                     Ícones PWA, manifest assets
├── src/
│   ├── pages/                  Por contexto (cliente, totem, admin)
│   ├── components/             ui/ (shadcn) + atoms/molecules/organisms
│   ├── features/               Tipos e hooks compostos por domínio
│   ├── contexts/               Providers de estado (sacola, sessão, loja, programa, privacidade, pedidos, equipe)
│   ├── services/               API mockada (catalogoApi, lojasApi, voucherApi, sessaoApi, programaApi, privacidadeApi, transacaoApi)
│   ├── mocks/                  JSON estático (cardapio, unidades, recompensas, cupons, usuarios)
│   ├── hooks/                  Fachada que re-exporta os contextos com nomes de domínio (useSacola, useSessao, …)
│   ├── lib/                    Utils
│   └── __tests__/CENARIOS.md   Validação dos 20 cenários do plano de testes
└── dist/                       Output do build (gerado)
```

## Canais

| Canal | Rota base | Observações |
|---|---|---|
| **Cliente** (mobile/web) | `/home` em diante | PWA instalável, mobile-first |
| **Totem** | `/totem` | Layout fixo 1080×1920 escalado pra viewport, touch ≥60px, inatividade 30s |
| **Admin** | `/admin/login` | Sidebar + 4 telas (PDV, KDS, Dashboard, Auditoria) com guard por role |

## Documentação relevante

- [Briefing técnico](docs/01-briefing.md) — visão geral, atores, canais
- [Requisitos funcionais e não-funcionais](docs/02-requisitos.md)
- [Fluxos end-to-end](docs/03-fluxos.md)
- [Design System](docs/04-design-system.md) — tokens visuais
- [Plano de Testes](docs/05-plano-testes.md) — 20 cenários
- [Decisões Técnicas (ADRs)](docs/06-decisoes-tecnicas.md)
- [Validação dos cenários](src/__tests__/CENARIOS.md) — status PASS/PENDENTE
- [Guia de deploy](docs/DEPLOY.md)

## Créditos

Projeto acadêmico desenvolvido por **Thiago Sopshuk** (RU 4661196) para a disciplina de
Projeto Multidisciplinar (UNINTER, 2026.1, Trilha Front-end).

Cliente fictício "Sertanejão do Cerrado" inspirado no estudo de caso oficial da
disciplina, com adaptação cultural pra culinária goiana e mineira.

## Licença

Uso restrito ao contexto acadêmico da disciplina. Reprodução, redistribuição
ou uso comercial não autorizados.
