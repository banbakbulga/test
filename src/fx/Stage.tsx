import { useEffect } from 'react'
import { motion, AnimatePresence, useAnimate } from 'motion/react'
import type { ReactNode } from 'react'
import { useFx } from './fxStore'

/* =========================================================
   화면 전체를 감싸는 무대.
   흔들기 / 글리치 / 회전 / 반전 / 번쩍 / 줌펀치가 여기서 적용됨.

   주의: 이펙트를 재생하려고 key 를 바꾸면 안 됨.
        key 가 바뀌면 자식 전체가 리마운트돼서 게임이 처음부터 다시 시작됨.
        그래서 줌 펀치는 useAnimate 로 명령형 재생.
   ========================================================= */

export function Stage({ children }: { children: ReactNode }) {
  const screen = useFx((s) => s.screen)
  const flashes = useFx((s) => s.flashes)
  const zoomKey = useFx((s) => s.zoomKey)

  const [scope, animate] = useAnimate()

  useEffect(() => {
    if (zoomKey === 0 || !scope.current) return
    void animate(
      scope.current,
      { scale: [1, 1.18, 1] },
      { duration: 0.42, times: [0, 0.4, 1], ease: 'easeOut' },
    )
  }, [zoomKey, animate, scope])

  const classes = [
    'relative h-full w-full overflow-hidden',
    screen.has('shake') && 'shaking',
    screen.has('bigshake') && 'shaking [animation-duration:0.18s]',
    screen.has('glitch') && 'glitching',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#14001c]">
      <motion.div
        className={classes}
        animate={{
          rotate: screen.has('spin') ? 360 : 0,
          filter: screen.has('invert')
            ? 'invert(1) hue-rotate(180deg)'
            : 'invert(0) hue-rotate(0deg)',
        }}
        transition={{
          rotate: { duration: 1, ease: 'easeInOut' },
          filter: { duration: 0.18 },
        }}
      >
        <div ref={scope} className="h-full w-full">
          {children}
        </div>
      </motion.div>

      {/* 번쩍 */}
      <AnimatePresence>
        {flashes.map((f) => (
          <motion.div
            key={f.id}
            className="pointer-events-none absolute inset-0 z-[100]"
            style={{ background: f.color }}
            initial={{ opacity: 0.95 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: f.ms / 1000, ease: 'linear' }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
