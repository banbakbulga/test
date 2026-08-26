import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { sfx } from '../fx/sfx'

/* =========================================================
   99% 에서 한참 멈추는 로딩바.
   ========================================================= */

interface Props {
  label: string
  ms?: number
  onDone: () => void
}

export function LoadingBar({ label, ms = 3200, onDone }: Props) {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const tick = setInterval(() => {
      setPct((v) => {
        // 90% 까지 시원하게 → 99% 까지 기어감 → 99% 에서 거의 멈춤
        const step = v < 90 ? 3 + Math.random() * 8 : v < 99 ? 0.2 + Math.random() * 0.7 : 0.02
        return Math.min(100, v + step)
      })
    }, ms / 60)

    const blip = setInterval(() => sfx.blip(), 260)

    const finish = setTimeout(() => {
      setPct(100)
      sfx.ok()
      setTimeout(onDone, 420)
    }, ms)

    return () => {
      clearInterval(tick)
      clearInterval(blip)
      clearTimeout(finish)
    }
  }, [ms, onDone])

  return (
    <motion.div
      className="w-[min(88vw,520px)]"
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <div className="mb-3 text-center text-xl text-amber-200">{label}</div>

      <div className="h-7 overflow-hidden rounded-full bg-black/50 p-1 ring-2 ring-amber-300/60">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber-300 via-fuchsia-400 to-amber-300"
          style={{ width: `${pct}%`, backgroundSize: '200% 100%' }}
          animate={{ backgroundPositionX: ['0%', '200%'] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="mt-2 text-right text-lg font-bold text-amber-300">{Math.floor(pct)}%</div>
    </motion.div>
  )
}
