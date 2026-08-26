import { useEffect } from 'react'
import { motion } from 'motion/react'
import { BUTLER } from '../game/config'
import { useGame } from '../game/store'
import { useFx } from '../fx/fxStore'
import { playSound } from '../fx/bgm'
import { Button } from '../ui/Button'
import { asset } from '../asset'

/* =========================================================
   엔딩

   결국 ....  →  결혼 사진  →  행복하게 오래오래 살았답니다 ~~~~
   ========================================================= */

const WEDDING_IMAGE = '/결혼.jpg'
const ENDING_BGM = '/미이채널.mp3'

/** 사진이 나오는 시각 (초) — 아래 delay 들이 전부 여기 맞춰져 있음 */
const AT_PHOTO = 1.6
const AT_LINE = AT_PHOTO + 1.8
const AT_BUTTON = AT_LINE + 1.4

export function Ending({ onClose }: { onClose: () => void }) {
  const princess = useGame((s) => s.princess)
  const play = useFx((s) => s.play)

  /* 사진이 뜨는 순간부터 음악 + 축포 */
  useEffect(() => {
    const t = setTimeout(() => {
      playSound(ENDING_BGM, 0.7)
      void play(['confetti', 'hearts', 'sparkle'])
    }, AT_PHOTO * 1000)
    return () => clearTimeout(t)
  }, [play])

  return (
    <motion.div
      className="absolute inset-0 z-[80] flex flex-col items-center justify-center gap-6
                 bg-black px-5 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.p
        className="font-impact text-3xl tracking-[0.3em] text-amber-200 sm:text-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        결국 ....
      </motion.p>

      <motion.img
        src={asset(WEDDING_IMAGE)}
        alt=""
        className="max-h-[52vh] w-auto max-w-[92vw] rounded-3xl object-contain
                   shadow-[0_20px_60px_rgba(0,0,0,0.8)] ring-4 ring-amber-300/80"
        initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: AT_PHOTO }}
      />

      <motion.p
        className="px-2 text-center font-impact text-2xl break-keep sm:text-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: AT_LINE }}
      >
        <span className="rainbow-text">행복하게 오래오래 살았답니다 ~~~~</span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: AT_BUTTON }}
      >
        <Button variant="ghost" onClick={onClose}>
          {princess} 님과 {BUTLER} 집사의 이야기 — 끝
        </Button>
      </motion.div>
    </motion.div>
  )
}
