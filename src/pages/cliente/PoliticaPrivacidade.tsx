import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

const ATUALIZACAO = '2026-05-07'

export default function PoliticaPrivacidade() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background px-4 py-3">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar">
          <Link to="/conta/privacidade">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="font-display text-lg text-foreground">
          Política de Privacidade
        </h1>
      </header>

      <article className="mx-auto max-w-2xl space-y-6 px-5 py-8 text-sm leading-relaxed text-foreground md:px-8">
        <p className="text-xs text-muted-foreground">
          Última atualização: {ATUALIZACAO}
        </p>

        <section className="space-y-2">
          <h2 className="font-display text-xl">1. Introdução</h2>
          <p>
            Esta Política descreve como a rede Sertanejão do Cerrado coleta, usa,
            compartilha e protege os dados pessoais de quem usa nosso aplicativo
            e nossos canais de atendimento. O documento é compatível com a Lei
            Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">2. Dados que coletamos</h2>
          <p>
            Coletamos só o que precisamos pra atender, entregar pedidos e
            melhorar o serviço:
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <strong>Cadastrais:</strong> nome, e-mail, telefone, CPF e data de
              nascimento (quando você cria conta).
            </li>
            <li>
              <strong>Transacionais:</strong> pedidos feitos, métodos de
              pagamento usados e cupons resgatados.
            </li>
            <li>
              <strong>De uso:</strong> páginas visitadas e ações no app, quando
              você consente com cookies analíticos.
            </li>
            <li>
              <strong>Localização:</strong> coordenadas aproximadas, só quando
              você autoriza, pra sugerir a unidade mais próxima.
            </li>
          </ul>
        </section>

        <section className="space-y-2" id="tratamento">
          <h2 className="font-display text-xl">3. Como usamos seus dados</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>Processar pedidos e pagamentos.</li>
            <li>Operar o programa de fidelidade Sertanejão.</li>
            <li>
              Personalizar recomendações de produtos (somente com seu
              consentimento).
            </li>
            <li>
              Enviar comunicações de marketing (somente com seu consentimento).
            </li>
            <li>Cumprir obrigações legais e tributárias.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">4. Compartilhamento</h2>
          <p>
            Não vendemos dados. Compartilhamos só com parceiros essenciais à
            operação:
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>Gateway de pagamento (para processar a transação).</li>
            <li>
              Serviços de e-mail e push (apenas se você aceitar marketing).
            </li>
            <li>
              Autoridades, quando obrigatório por lei ou ordem judicial.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">5. Seus direitos (LGPD Art. 18)</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>Confirmar a existência de tratamento.</li>
            <li>Acessar seus dados (botão "Exportar meus dados").</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
            <li>
              Solicitar anonimização, bloqueio ou eliminação de dados
              desnecessários.
            </li>
            <li>
              Revogar consentimento a qualquer momento (toggles na tela
              "Privacidade").
            </li>
            <li>Eliminar sua conta e os dados tratados com seu consentimento.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">6. Retenção</h2>
          <p>
            Dados cadastrais ficam guardados enquanto sua conta estiver ativa.
            Dados transacionais são mantidos por 5 anos para fins fiscais e de
            auditoria. Após esse prazo ou após exclusão da conta, são
            anonimizados ou eliminados.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">7. Cookies</h2>
          <p>
            Cookies essenciais são necessários pro app funcionar e não podem ser
            desligados. Cookies analíticos são opcionais e medem uso anônimo.
            Você decide no banner exibido na primeira visita ou em "Privacidade
            e dados".
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">8. Segurança</h2>
          <p>
            Aplicamos controles técnicos e organizacionais proporcionais ao
            risco: criptografia em trânsito (HTTPS), controle de acesso, logs de
            auditoria e treinamento da equipe. Em caso de incidente que afete
            dados pessoais, comunicaremos a ANPD e os titulares conforme
            previsto na lei.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">9. Encarregado pelo Tratamento (DPO)</h2>
          <p>
            Em caso de dúvida ou solicitação relacionada a seus dados, fale com
            nosso encarregado:
          </p>
          <p className="rounded-md bg-muted p-3">
            <strong>Encarregado(a):</strong> Maria Helena Albuquerque
            <br />
            <strong>E-mail:</strong> dpo@raizesdonordeste.com.br
            <br />
            <strong>Endereço:</strong> R. T-37, 1234 — Setor Marista,
            Goiânia/GO
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl">10. Atualizações desta política</h2>
          <p>
            Podemos atualizar este documento. Quando isso acontecer,
            avisaremos no app e atualizaremos a data no topo. Mudanças
            relevantes podem exigir reaceitação dos consentimentos.
          </p>
        </section>

        <p className="pt-4 text-xs italic text-muted-foreground">
          Versão acadêmica preparada para a disciplina de Projeto
          Multidisciplinar (UNINTER, 2026). Em produção, este texto seria
          revisado por departamento jurídico.
        </p>
      </article>
    </main>
  )
}
