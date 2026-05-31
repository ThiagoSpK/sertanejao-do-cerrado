import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import ClienteLayout from '@/components/organisms/ClienteLayout'
import TotemLayout from '@/components/organisms/TotemLayout'
import AdminLayout, { RequireRole } from '@/components/organisms/AdminLayout'
import { PageLoader } from '@/components/atoms/PageLoader'

import Splash from '@/pages/cliente/Splash'
import Onboarding from '@/pages/cliente/Onboarding'
import SelecaoUnidade from '@/pages/cliente/SelecaoUnidade'
import Home from '@/pages/cliente/Home'
import Cardapio from '@/pages/cliente/Cardapio'
import ProdutoDetalhe from '@/pages/cliente/ProdutoDetalhe'
import Carrinho from '@/pages/cliente/Carrinho'
import Checkout from '@/pages/cliente/Checkout'
import Pagamento from '@/pages/cliente/Pagamento'
import PagamentoSucesso from '@/pages/cliente/PagamentoSucesso'
import HistoricoPedidos from '@/pages/cliente/HistoricoPedidos'
import Acompanhamento from '@/pages/cliente/Acompanhamento'
import Fidelidade from '@/pages/cliente/Fidelidade'
import Conta from '@/pages/cliente/Conta'
import Privacidade from '@/pages/cliente/Privacidade'
import Login from '@/pages/cliente/Login'
import Cadastro from '@/pages/cliente/Cadastro'
import EditarPerfil from '@/pages/cliente/EditarPerfil'
import PoliticaPrivacidade from '@/pages/cliente/PoliticaPrivacidade'
import TermosUso from '@/pages/cliente/TermosUso'

// Totem e Admin são canais com tráfego concentrado em hardware/operadores —
// carregamento sob demanda reduz o bundle inicial servido a todo cliente.
const Ocioso = lazy(() => import('@/pages/totem/Ocioso'))
const Identificacao = lazy(() => import('@/pages/totem/Identificacao'))
const CardapioTotem = lazy(() => import('@/pages/totem/Cardapio'))
const CarrinhoTotem = lazy(() => import('@/pages/totem/Carrinho'))
const PagamentoTotem = lazy(() => import('@/pages/totem/Pagamento'))
const SucessoTotem = lazy(() => import('@/pages/totem/Sucesso'))

const LoginAdmin = lazy(() => import('@/pages/admin/Login'))
const PDV = lazy(() => import('@/pages/admin/PDV'))
const KDS = lazy(() => import('@/pages/admin/KDS'))
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'))
const Auditoria = lazy(() => import('@/pages/admin/Auditoria'))

import NotFound from '@/pages/NotFound'

import { useSessao } from '@/hooks'

function RootRedirect() {
  const { perfil } = useSessao()
  return <Navigate to={perfil ? '/home' : '/splash'} replace />
}

function carregar(node: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{node}</Suspense>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* Cliente — fluxo standalone (sem header/nav/footer) */}
      <Route path="/splash" element={<Splash />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/selecionar-unidade" element={<SelecaoUnidade />} />
      <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
      <Route path="/termos-uso" element={<TermosUso />} />

      {/* Cliente — App + Web Desktop com layout principal */}
      <Route element={<ClienteLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/cardapio" element={<Cardapio />} />
        <Route path="/cardapio/produto/:id" element={<ProdutoDetalhe />} />
        <Route path="/cardapio/:categoria" element={<Cardapio />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/pagamento" element={<Pagamento />} />
        <Route path="/pagamento/sucesso" element={<PagamentoSucesso />} />
        <Route path="/pedidos" element={<HistoricoPedidos />} />
        <Route path="/pedidos/:id" element={<Acompanhamento />} />
        <Route path="/fidelidade" element={<Fidelidade />} />
        <Route path="/conta" element={<Conta />} />
        <Route path="/conta/editar" element={<EditarPerfil />} />
        <Route path="/conta/privacidade" element={<Privacidade />} />
      </Route>

      {/* Totem — autoatendimento, layout próprio (1080×1920) */}
      <Route path="/totem" element={<TotemLayout />}>
        <Route index element={carregar(<Ocioso />)} />
        <Route path="identificacao" element={carregar(<Identificacao />)} />
        <Route path="cardapio" element={carregar(<CardapioTotem />)} />
        <Route path="carrinho" element={carregar(<CarrinhoTotem />)} />
        <Route path="pagamento" element={carregar(<PagamentoTotem />)} />
        <Route path="sucesso" element={carregar(<SucessoTotem />)} />
      </Route>

      {/* Admin — operação interna */}
      <Route path="/admin/login" element={carregar(<LoginAdmin />)} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="pdv"
          element={
            <RequireRole roles={['atendente', 'gerente']}>
              {carregar(<PDV />)}
            </RequireRole>
          }
        />
        <Route
          path="kds"
          element={
            <RequireRole roles={['cozinha', 'gerente']}>
              {carregar(<KDS />)}
            </RequireRole>
          }
        />
        <Route
          path="dashboard"
          element={
            <RequireRole roles={['gerente']}>
              {carregar(<Dashboard />)}
            </RequireRole>
          }
        />
        <Route
          path="auditoria"
          element={
            <RequireRole roles={['gerente']}>
              {carregar(<Auditoria />)}
            </RequireRole>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
