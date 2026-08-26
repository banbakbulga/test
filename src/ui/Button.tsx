import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { sfx } from '../fx/sfx'

interface Props {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'gold' | 'ghost'
  className?: string
}

/** 과하게 화려한 버튼. 병맛 게임에 어울리게 크고 반짝임. */
export function Button({ children, onClick, disabled, variant = 'gold', className = '' }: Props) {
  const base =
    'relative select-none rounded-2xl px-8 py-3 text-lg font-bold tracking-wide ' +
    'transition-shadow disabled:cursor-not-allowed disabled:opacity-40'

  const skin =
    variant === 'gold'
      ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 text-royal-900 ' +
        'shadow-[0_6px_0_#b45309,0_10px_24px_rgba(251,191,36,0.45)] ' +
        'ring-2 ring-amber-200/70'
      : 'bg-white/10 text-white ring-2 ring-white/30 backdrop-blur ' +
        'shadow-[0_4px_0_rgba(255,255,255,0.15)]'

  return (
    <motion.button
      className={`${base} ${skin} ${className}`}
      disabled={disabled}
      onClick={() => {
        sfx.click()
        onClick?.()
      }}
      onHoverStart={() => !disabled && sfx.hover()}
      whileHover={disabled ? undefined : { scale: 1.06, y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.94, y: 3 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
    >
      {children}
    </motion.button>
  )
}
