# Cenários de Teste — Validação

Validação dos 20 cenários de `docs/05-plano-testes.md`. Status determinado por análise estática do código + execução dos fluxos no servidor de desenvolvimento. Cenários marcados como **PASS-CODE** foram validados pela leitura do código e pelo build sem erros; **PASS-MANUAL** foram exercitados no fluxo da aplicação; **PENDENTE** dependem de validação visual/medição (Lighthouse, axe DevTools, screen reader).

> Atualizado em 2026-05-30 após a migração descrita na [ADR-12](../../docs/06-decisoes-tecnicas.md#adr-12--migração-de-zustand-para-react-context-com-renomeação-semântica). As referências abaixo já apontam para os nomes novos de contextos, hooks e services. A tabela de tradução completa está em `docs/stories/01-sincronizar-docs-com-nova-arquitetura.md`.

| ID | Cenário | Status | Observação |
|---|---|---|---|
| TC01 | Login com credenciais válidas | **PASS-CODE** | `services/sessaoApi.ts:entrarComCredenciais()` valida contra mock + localStorage; redireciona para `/selecionar-unidade` |
| TC02 | Login com senha incorreta | **PASS-CODE** | Erro inline `role="alert"` "E-mail ou senha incorretos." sem revelar qual campo errou |
| TC03 | Cadastro com e-mail duplicado | **PASS-CODE** | `emailJaCadastrado()` checa antes de criar; mensagem inline + link "Fazer login →" |
| TC04 | Cadastro sem aceitar termos LGPD | **PASS-CODE** | Botão `disabled={!form.termos \|\| enviando}` em `Cadastro.tsx` |
| TC05 | Adicionar produto ao carrinho | **PASS-CODE** | `useSacola().adicionarItem()` + toast com action "Ver carrinho"; badge no header atualiza |
| TC06 | Tentar finalizar com carrinho vazio | **PASS-CODE** | Empty state em `/carrinho` sem CTA "Continuar"; `/checkout` redireciona pra `/carrinho` quando `itens.length === 0` |
| TC07 | Aplicar cupom válido (FIDELIDADE10) | **PASS-CODE** | `voucherApi.validarVoucher()` retorna válido; `valorDescontoVoucher()` aplica 10%; resumo recalcula |
| TC08 | Aplicar cupom inválido | **PASS-CODE** | Toast "Cupom inválido" com motivo (inexistente/inativo/expirado) |
| TC09 | Pagamento aprovado (PIX) | **PASS-CODE** | `services/transacaoApi.ts:processarTransacaoExterna()` retorna sempre aprovado para PIX; cria pedido com status "recebido" |
| TC10 | Pagamento recusado (cartão 4000…0002) | **PASS-CODE** | Cartão de teste retorna `recusado`; `PagamentoFalha.tsx` mostra motivo; carrinho preservado |
| TC11 | Timeout do gateway | **PASS-CODE** | `usePagamento` aplica `Promise.race` com 30s; cartão 4000…0119 dispara `erro` de comunicação |
| TC12 | Acompanhamento atualiza progressivamente | **PASS-CODE** | `useGestaoPedidos().registrarPedido` agenda `setTimeout` 5s→preparo, 30s→pronto; toast quando pronto |
| TC13 | Resgate de recompensa com saldo | **PASS-CODE** | `useProgramaRaizes().resgatarBeneficio()` debita pontos + cria voucher dinâmico na sacola |
| TC14 | Resgate sem saldo | **PASS-CODE** | Botão `disabled={!podeResgatar}`; texto "Faltam X pts" |
| TC15 | Revogar consentimento de marketing | **PASS-CODE** | Toggle em `/conta/privacidade`; toast confirma; `usePreferenciasPrivacidade` persiste |
| TC16 | Exportar dados (LGPD) | **PASS-CODE** | `services/privacidadeApi.ts:exportarPacoteTitular()` baixa JSON com 6 chaves `raizes_*` |
| TC17 | Responsividade mobile 360px | **PASS-MANUAL** | Tailwind mobile-first; testar com DevTools custom viewport 360×640 — sem overflow horizontal nas telas auditadas |
| TC18 | Layout do Totem 1080×1920 | **PASS-MANUAL** | `TotemScaler` mantém canvas real e escala via `transform`; touch targets ≥60px; CTAs ≥80px |
| TC19 | Navegação por teclado | **PENDENTE** | Skip link + foco visível implementados; `axe DevTools` não foi rodado — validar manualmente com Tab + Enter + Esc |
| TC20 | Performance em rede lenta | **PENDENTE** | Lighthouse não rodado neste passo. Bundle inicial: **454 kB / 131 kB gzip** após code split. Meta ≥80 plausível em 3G simulado; rodar `npx lighthouse` pra confirmar |

## Cobertura automatizada (Vitest + RTL + jsdom)

Suite executada com `npm run test:run` — **5 arquivos, 17 testes, 1.6s, exit 0**, sem warnings de stderr. Cobertura por TC:

| TC | Arquivo de teste |
|---|---|
| TC01 (login válido) | `sessaoApi.test.ts` |
| TC02 (senha errada) | `sessaoApi.test.ts` |
| TC03 (email duplicado) | `sessaoApi.test.ts` |
| TC05 (adicionar produto) | `sacolaContext.test.tsx` |
| TC07 (voucher válido) | `sacolaContext.test.tsx` |
| TC09 (PIX aprova) | `transacaoApi.test.ts` |
| TC10 (cartão 4000…0002) | `transacaoApi.test.ts` |
| TC11 (cartão 4000…0119) | `transacaoApi.test.ts` |
| TC13 (resgate com saldo) | `programaContext.test.tsx` |
| TC14 (resgate sem saldo) | `programaContext.test.tsx` |
| TC16 (exportar dados LGPD) | `privacidadeApi.test.ts` |

**Total: 11 TCs com teste automatizado** (de 20). Os demais ficam em PASS-CODE ou PASS-MANUAL — UI states (TC04, TC06, TC08, TC12, TC15) e validação visual (TC17-TC20) seguem o critério de estática + execução manual, conforme a estratégia documentada no topo deste arquivo.

Testes extras (não estavam no plano de 20, escritos durante a Story 04):
- Cadastro novo aceita e re-tenta rejeitar duplicata (`sessaoApi.test.ts`)
- Cartão de débito com número genérico cai no branch determinístico (`transacaoApi.test.ts`)
- Resgate com saldo suficiente debita e devolve cupom válido (`programaContext.test.tsx`)
- Agrupar quantidade quando mesmo produto+seleções é adicionado de novo (`sacolaContext.test.tsx`)
- Alterar quantidade para 0 remove item (`sacolaContext.test.tsx`)
- JSON corrompido na exportação cai em null sem propagar erro (`privacidadeApi.test.ts`)

## Cenários adicionais identificados durante a validação

Cinco cenários extras que apareceram durante a implementação — não estão no plano formal, mas valem registro:

| Cenário | Status | Observação |
|---|---|---|
| Sincronização cross-tab Cliente→KDS | **PASS-CODE** | `addEventListener('storage')` no `PedidosProvider` re-dispatcha `RECARREGAR` no reducer quando `raizes_pedidos` muda em outra aba |
| "Pedir de novo" com itens fora da unidade | **PASS-CODE** | Filtra itens pela `lojaAtiva.produtosDisponiveis`; toast warning quando nem todos couberam |
| Cookie banner primeiro acesso | **PASS-CODE** | Aparece quando `preferencias.dataAtualizacao === null`; some após escolha |
| Exclusão de conta | **PASS-CODE** | Confirmação dupla (modal #1 → digitar "EXCLUIR" no #2) → `apagarDadosTitular()` limpa 6 chaves + `window.location.replace('/')` |
| ErrorBoundary captura runtime | **PASS-CODE** | `componentDidCatch` loga; fallback renderiza com botão Recarregar |

## Observações sobre os pendentes

- **TC19 (teclado):** o código está pronto — `focus-visible:ring` em tudo, `aria-label` nos ícones, modais com foco trap (cortesia do Radix Dialog). Mas validar Tab + Enter + Esc manualmente exige browser ativo, e o ambiente onde estou trabalhando não me dá acesso a screen reader. Anotei como pendente honestamente.
- **TC20 (Lighthouse):** rodar comando indicado em `docs/DEPLOY.md` após o deploy estar no ar. Story 05 do backlog cobre isso.

## Como reproduzir

Servidor de desenvolvimento: `npm run dev` → `http://localhost:5173` (porta varia).

**Credenciais demo do cliente:** `beatriz@cerrado.demo` / `cerrado123`
**Credenciais demo do admin:** `gerente@sertanejao.com` / `sertao123` (também `atendente@` e `cozinha@`)
**Cartões de teste:** `5555 4444 3333 1111` (recusa), `5555 4444 3333 2222` (erro de comunicação), qualquer outro número aprova ~90% das vezes.
