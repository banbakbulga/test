import { motion } from 'motion/react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from './Button'
import { sfx } from '../fx/sfx'

/* =========================================================
   병맛 팝업.
   버튼 하나는 도망가게 만들 수 있음 (dodge).
   ========================================================= */

export interface PopupButton {
  label: string
  onClick: () => void
  /** true 면 마우스를 갖다댈 때 도망감. 숫자면 그 횟수만큼만 도망감. */
  dodge?: boolean | number
  variant?: 'gold' | 'ghost'
}

interface Props {
  title?: string
  children: ReactNode
  buttons: PopupButton[]
}

export function Popup({ title, children, buttons }: Props) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-[min(90vw,460px)] rounded-3xl bg-gradient-to-b from-fuchsia-900 to-royal-900
                   p-7 text-center shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-4 ring-amber-300/70"
        initial={{ scale: 0.5, rotate: -8, y: 40 }}
        animate={{ scale: 1, rotate: 0, y: 0 }}
        exit={{ scale: 0.7, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 420, damping: 20 }}
      >
        {title && (
          <div className="mb-3 text-2xl font-bold text-amber-300">{title}</div>
        )}

        <div className="mb-7 text-xl leading-relaxed text-white">{children}</div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {buttons.map((b, i) => (
            <PopupBtn key={i} {...b} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

/** 도망가는 버튼 처리 */
function PopupBtn({ label, onClick, dodge, variant = 'gold' }: PopupButton) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [runs, setRuns] = useState(0)

  const maxRuns = dodge === true ? 4 : typeof dodge === 'number' ? dodge : 0

  return (
    <motion.div
      animate={offset}
      transition={{ type: 'spring', stiffness: 700, damping: 14 }}
      onHoverStart={() => {
        if (runs >= maxRuns) return
        sfx.swoosh()
        setRuns((r) => r + 1)
        setOffset({
          x: Math.round((Math.random() - 0.5) * 320),
          y: Math.round((Math.random() - 0.5) * 220),
        })
      }}
    >
      <Button variant={variant} onClick={onClick}>
        {label}
      </Button>
    </motion.div>
  )
}
