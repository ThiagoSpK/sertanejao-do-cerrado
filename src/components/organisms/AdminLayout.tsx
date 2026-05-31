import {
  Activity,
  ChefHat,
  LayoutDashboard,
  LogOut,
  Shield,
  Store,
} from 'lucide-react'
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { SkipLink } from '@/components/atoms/SkipLink'
import {
  ROTULOS_PAPEL,
  useEquipeOperacional,
  type PapelEquipe,
} from '@/hooks'
import { cn } from '@/lib/utils'

interface ItemNav {
  to: string
  rotulo: string
  icon: typeof LayoutDashboard
  papeis: PapelEquipe[]
}

const MENU: ItemNav[] = [
  {
    to: '/admin/dashboard',
    rotulo: 'Indicadores',
    icon: LayoutDashboard,
    papeis: ['gerente'],
  },
  {
    to: '/admin/pdv',
    rotulo: 'Vendas balcão',
    icon: Store,
    papeis: ['atendente', 'gerente'],
  },
  {
    to: '/admin/kds',
    rotulo: 'Cozinha ao vivo',
    icon: ChefHat,
    papeis: ['cozinha', 'gerente'],
  },
  {
    to: '/admin/auditoria',
    rotulo: 'Trilha de auditoria',
    icon: Shield,
    papeis: ['gerente'],
  },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { membro, sairPainel } = useEquipeOperacional()

  if (!membro) return <Navigate to="/admin/login" replace />

  const itens = MENU.filter((i) => i.papeis.includes(membro.papel))

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SkipLink />
      <aside className="flex w-64 shrink-0 flex-col bg-brand-noite text-white">
        <div className="border-b border-white/10 px-5 py-6">
          <p className="font-display text-lg font-bold">Central Sertanejão</p>
          <p className="text-[11px] text-white/50">Operação multicanal</p>
        </div>

        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-coral">
            {ROTULOS_PAPEL[membro.papel]}
          </p>
          <p className="mt-1 text-sm font-medium">{membro.nome}</p>
        </div>

        <nav className="flex-1 p-3" aria-label="Painel administrativo">
          <ul className="space-y-1">
            {itens.map(({ to, rotulo, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition',
                      isActive
                        ? 'bg-brand-indigo text-white'
                        : 'text-white/75 hover:bg-white/10 hover:text-white',
                    )
                  }
                >
                  <Icon className="size-4" aria-hidden />
                  {rotulo}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs text-emerald-400">
            <Activity className="size-3.5" aria-hidden />
            Sistema online
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
            onClick={() => {
              sairPainel()
              navigate('/admin/login', { replace: true })
            }}
          >
            <LogOut className="mr-2 size-3.5" />
            Encerrar sessão
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center border-b border-border bg-card px-6">
          <p className="text-sm text-muted-foreground">
            Unidade <strong className="text-foreground">Boa Viagem</strong> · turno atual
          </p>
        </header>
        <main id="main-content" className="flex-1 overflow-x-hidden p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

interface RequireRoleProps {
  roles: PapelEquipe[]
  children: React.ReactNode
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const { membro } = useEquipeOperacional()

  if (!membro) return <Navigate to="/admin/login" replace />

  if (!roles.includes(membro.papel)) {
    const dest =
      membro.papel === 'atendente'
        ? '/admin/pdv'
        : membro.papel === 'cozinha'
          ? '/admin/kds'
          : '/admin/dashboard'
    return <Navigate to={dest} replace />
  }

  return <>{children}</>
}
