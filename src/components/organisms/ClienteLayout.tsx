import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  Compass,
  Gift,
  MapPin,
  Package,
  ShoppingBag,
  UserCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useLojaAtiva, useSacola } from '@/hooks'
import { listarLojas } from '@/services/lojasApi'
import type { Unidade } from '@/features/unidades/types'
import { CookieBanner } from '@/features/lgpd/CookieBanner'
import { SkipLink } from '@/components/atoms/SkipLink'
import { cn } from '@/lib/utils'

const NAV_PRINCIPAL = [
  { to: '/home', rotulo: 'Descobrir', icon: Compass, end: true },
  { to: '/cardapio', rotulo: 'Cardápio', icon: ShoppingBag, end: false },
  { to: '/fidelidade', rotulo: 'Clube', icon: Gift, end: false },
  { to: '/pedidos', rotulo: 'Pedidos', icon: Package, end: false },
  { to: '/conta', rotulo: 'Perfil', icon: UserCircle, end: false },
]

function SeletorLoja() {
  const { lojaAtiva, selecionarLoja } = useLojaAtiva()
  const [aberto, setAberto] = useState(false)
  const [lojas, setLojas] = useState<Unidade[]>([])

  useEffect(() => {
    if (!aberto || lojas.length) return
    listarLojas().then(setLojas)
  }, [aberto, lojas.length])

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs md:text-sm">
          <MapPin className="size-4 text-secondary" aria-hidden />
          {lojaAtiva?.nome ?? 'Escolher loja'}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl md:side-left md:max-w-md md:rounded-none">
        <SheetHeader>
          <SheetTitle className="font-display">Onde você está?</SheetTitle>
          <SheetDescription>
            Cardápio e promoções mudam conforme a loja selecionada.
          </SheetDescription>
        </SheetHeader>
        <ul className="mt-4 space-y-2">
          {lojas.map((loja) => (
            <li key={loja.id}>
              <button
                type="button"
                onClick={() => {
                  selecionarLoja(loja)
                  setAberto(false)
                }}
                className={cn(
                  'w-full rounded-xl border p-4 text-left transition',
                  lojaAtiva?.id === loja.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted',
                )}
              >
                <p className="font-display font-semibold">{loja.nome}</p>
                <p className="text-xs text-muted-foreground">{loja.endereco}</p>
              </button>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  )
}

export default function ClienteLayout() {
  const { totais } = useSacola()

  return (
    <div className="flex min-h-screen flex-col bg-brand-areia">
      <SkipLink />

      {/* Sidebar desktop */}
      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-brand-areia md:flex">
          <Link to="/home" className="border-b border-border px-5 py-6">
            <span className="font-display text-xl font-bold text-primary">Sertanejão</span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              do Cerrado
            </span>
          </Link>
          <nav className="flex-1 space-y-1 p-3" aria-label="Menu lateral">
            {NAV_PRINCIPAL.map(({ to, rotulo, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                <Icon className="size-4" aria-hidden />
                {rotulo}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-border p-4 text-[10px] text-muted-foreground">
            © 2026 Sertanejão · Goiânia
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between gap-2 border-b border-border bg-brand-areia px-4 md:px-6">
            <div className="md:hidden">
              <Link to="/home" className="font-display text-lg font-bold text-primary">
                Sertanejão
              </Link>
            </div>
            <SeletorLoja />
            <Button asChild variant="default" size="sm" className="relative gap-2">
              <Link to="/carrinho" aria-label={`Sacola com ${totais.qtdItens} itens`}>
                <ShoppingBag className="size-4" />
                <span className="hidden sm:inline">Sacola</span>
                {totais.qtdItens > 0 && (
                  <span className="absolute -right-1 -top-1 grid min-h-[18px] min-w-[18px] place-items-center rounded-full bg-secondary px-1 text-[10px] font-bold text-white">
                    {totais.qtdItens > 9 ? '9+' : totais.qtdItens}
                  </span>
                )}
              </Link>
            </Button>
          </header>

          <main id="main-content" className="flex-1 pb-20 md:pb-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Bottom nav mobile */}
      <nav
        aria-label="Navegação inferior"
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-brand-areia md:hidden"
      >
        <ul className="grid grid-cols-5">
          {NAV_PRINCIPAL.map(({ to, rotulo, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )
                }
              >
                <Icon className="size-5" aria-hidden />
                {rotulo}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <footer className="hidden border-t border-border bg-muted/30 py-4 text-center text-xs text-muted-foreground md:block">
        <Link to="/politica-privacidade" className="mx-2 hover:text-foreground">
          Privacidade
        </Link>
        <Link to="/termos-uso" className="mx-2 hover:text-foreground">
          Termos
        </Link>
        <Link to="/conta/privacidade" className="mx-2 hover:text-foreground">
          Preferências LGPD
        </Link>
      </footer>

      <CookieBanner />
    </div>
  )
}
