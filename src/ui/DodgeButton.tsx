import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Button } from './Button'
import { useDodge } from './useDodge'
import { sfx } from '../fx/sfx'

/* =========================================================
   영영 못 누르는 버튼.
   마우스가 다가오면 피하고, 손가락으로 찍으면 순간이동함.
   ========================================================= */

export function DodgeButton({ children }: { children: ReactNode }) {
  const { ref, offset, jump } = useDodge<HTMLDivElement>()

  return (
    <motion.div
      ref={ref}
      className="relative"
      style={{ touchAction: 'none' }}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      onPointerEnter={jump}
      onPointerDown={(e) => {
        e.preventDefault()
        sfx.swoosh()
        jump()
      }}
    >
      <Button variant="ghost">{children}</Button>
    </motion.div>
  )
}
