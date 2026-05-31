import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

const ATUALIZACAO = '2026-05-07'

export default function TermosUso() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background px-4 py-3">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar">
          <Link to="/conta/privacidade">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="font-display text-lg text-foreground">Termos de Uso</h1>
      </header>

      <article className="mx-auto max-w-2xl space-y-6 px-5 py-8 text-sm leading-relaxed text-foreground md:px-8">
        <p className="text-xs text-muted-foreground">
          Última atualização: {ATUALIZACAO}
        </p>

        <section className="space-y-2">
          <h2 className="font-display text-xl">1. Aceitação</h2>
          <p>
            Ao criar conta ou usar o aplicativo da rede Sertanejão do Cerrado, você
            aceita estes Termos. Se não concordar com algum ponto, não use o
            serviço.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">2. Cadastro</h2>
          <p>
            Pra usar funcionalidades como pedido pelo app e programa de
            fidelidade, é necessário criar conta com dados verdadeiros. A
            responsabilidade pela conta é sua. Avise nossa equipe imediatamente
            em caso de uso indevido.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">3. Pedidos e pagamentos</h2>
          <p>
            Os pedidos são confirmados após aprovação do pagamento. Em caso de
            recusa do gateway, o pedido <strong>não é gerado</strong> e os itens
            permanecem no carrinho. Pagamentos são processados por parceiros
            (gateway externo) — a Sertanejão não armazena dados completos de cartão.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">4. Cardápio e disponibilidade</h2>
          <p>
            O cardápio varia por unidade. Produtos sazonais (juninos, por
            exemplo) ficam disponíveis em períodos específicos. Itens
            indisponíveis na unidade selecionada aparecem no app desabilitados.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">5. Programa Clube Pequi</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              Cada R$ 1,00 efetivamente consumido (pedido com status "retirado")
              vira 1 ponto.
            </li>
            <li>
              Os tiers Bronze (0-499), Prata (500-999) e Ouro (1000+) são
              calculados pelo saldo total acumulado.
            </li>
            <li>
              Recompensas são resgatadas no app e geram um cupom de desconto
              válido por 24 horas.
            </li>
            <li>
              A Sertanejão pode rever o programa com aviso prévio de 30 dias. Pontos
              acumulados são preservados em qualquer mudança.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">6. Cupons e descontos</h2>
          <p>
            Cupons promocionais têm validade e regras próprias, indicadas no
            momento da divulgação. Uso indevido (multiplas contas, fraude) pode
            resultar em cancelamento do pedido e suspensão da conta.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">7. Conduta esperada</h2>
          <p>
            Você se compromete a não usar o app pra fins ilegais, não tentar
            acessar áreas restritas, não enviar conteúdo abusivo a outros
            usuários ou à equipe.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">8. Limitação de responsabilidade</h2>
          <p>
            A Sertanejão se compromete a manter o serviço disponível, mas não pode
            garantir 100% de uptime. Falhas pontuais (energia, conectividade,
            terceiros) podem atrasar pedidos. Em casos comprovados, oferecemos
            crédito ou estorno.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">9. Encerramento de conta</h2>
          <p>
            Você pode excluir a conta a qualquer momento em "Privacidade e
            dados". A Sertanejão pode encerrar contas em caso de violação destes
            Termos, com aviso prévio sempre que possível.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">10. Foro e legislação</h2>
          <p>
            Estes Termos são regidos pelas leis brasileiras. Conflitos serão
            resolvidos no foro da comarca de Goiânia/GO, salvo direitos de
            consumidor previstos no CDC.
          </p>
        </section>

        <p className="pt-4 text-xs italic text-muted-foreground">
          Versão acadêmica preparada para a disciplina de Projeto
          Multidisciplinar (UNINTER, 2026).
        </p>
      </article>
    </main>
  )
}
