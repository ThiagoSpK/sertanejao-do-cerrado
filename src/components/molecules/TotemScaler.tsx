import { useEffect, useState, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

const STAGE_W = 1080
const STAGE_H = 1920

/**
 * Renderiza o canvas real do totem (1080×1920) e escala via transform pra
 * caber na viewport. Padrão correto: wrapper externo recebe as dimensões
 * já escaladas (DOM real), filho mantém 1080×1920 e usa transform-origin
 * top-left — aí o flex/grid pai consegue centralizar com base no tamanho
 * real do wrapper. No hardware do totem, scale fica em 1.
 */
export function TotemScaler({ children }: Props) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    function fit() {
      const padding = 32
      const aw = window.innerWidth - padding
      const ah = window.innerHeight - padding
      const k = Math.min(aw / STAGE_W, ah / STAGE_H, 1)
      setScale(k)
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  return (
    <div className="grid min-h-screen place-items-center overflow-auto bg-[#1a1108] p-4">
      <div
        className="flex-none"
        style={{
          width: STAGE_W * scale,
          height: STAGE_H * scale,
        }}
      >
        <div
          style={{
            width: STAGE_W,
            height: STAGE_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          className="relative flex flex-col overflow-hidden rounded-[28px] border-4 border-[#1a1108] bg-background shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
