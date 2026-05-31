import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { UsePedirDeNovoReturn } from './usePedirDeNovo'

interface Props {
  controlador: UsePedirDeNovoReturn
}

export function DialogPedirDeNovo({ controlador }: Props) {
  const { confirmacao, cancelar, confirmarSubstituir, confirmarAdicionar } =
    controlador
  const aberto = confirmacao !== null

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && cancelar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">
            Você já tem itens no carrinho
          </DialogTitle>
          <DialogDescription>
            {confirmacao && confirmacao.produtosFora > 0
              ? `Alguns itens deste pedido podem estar fora da sua unidade. O que você quer fazer?`
              : 'O que você quer fazer com os itens deste pedido?'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-2">
          <Button variant="ghost" onClick={cancelar} className="sm:order-1">
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={confirmarAdicionar}
            className="sm:order-2"
          >
            Adicionar aos atuais
          </Button>
          <Button
            variant="destructive"
            onClick={confirmarSubstituir}
            className="sm:order-3"
          >
            Substituir carrinho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
