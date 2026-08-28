import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { playSound } from '../fx/bgm'
import { useFx } from '../fx/fxStore'
import { Button } from '../ui/Button'
import { asset } from '../asset'

/* =========================================================
   후계자 양성교육

   선물 결과 화면에서 "후계자 양성교육에 참여하기" 를 누르면 나옴.
   대사가 뜨는 동안 광기 바이올린이 깔리고,
   재용이 화면을 꽉 채우며 아주 천천히 다가온다.
   중간에 "안돼" 가 겹쳐 들어옴.
   ========================================================= */

/** 처음부터 끝까지 깔리는 광기 바이올린 */
const VIOLIN = '/광기바이올린.mp3'

/** 재용이 코앞까지 왔을 때 겹쳐 나오는 비명 */
const NO = '/안돼.mp3'

/** 슥 다가오는 그 사람 */
const JAEYONG = '/재용.png'

const LINE = '공주님 ... 정녕 .. 그곳에 다시 발을 들이시려는겁니까 ..?'

/** 연출 타이밍 (ms) */
const T_IMAGE = 1200 // 재용 등장 시작
const T_SCREAM = 4300 // "안돼" + 화면 흔들림
const T_BUTTON = 5800 // 도망칠 기회

export function HeirTraining({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0)
  const play = useFx((s) => s.play)

  useEffect(() => {
    const violin = playSound(VIOLIN, 0.75)

    const timers = [
      setTimeout(() => setStep(1), T_IMAGE),
      setTimeout(() => {
        setStep(2)
        playSound(NO, 0.95)
        void play(['bigshake', 'redflash'])
      }, T_SCREAM),
      setTimeout(() => setStep(3), T_BUTTON),
    ]

    return () => {
      timers.forEach(clearTimeout)
      violin.pause()
      violin.src = ''
    }
  }, [play])

  return (
    <motion.div
      className="absolute inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 재용 — 화면을 꽉 채우며 아주 천천히 다가옴 */}
      <AnimatePresence>
        {step >= 1 && (
          <motion.img
            key="jaeyong"
            src={asset(JAEYONG)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: 'contrast(1.25) saturate(0.75) brightness(0.8)' }}
            initial={{ opacity: 0, scale: 1 }}
            animate={{
              opacity: 1,
              // 천천히 다가오다가(1 → 1.3) 비명 순간에 코앞까지 확 들이닥침(1.75)
              scale: step >= 2 ? 1.75 : 1.3,
            }}
            transition={{
              opacity: { duration: 2.4, ease: 'easeIn' },
              scale:
                step >= 2
                  ? { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
                  : { duration: 3.6, ease: 'linear' },
            }}
          />
        )}
      </AnimatePresence>

      {/* 붉은 비네트 — 가장자리를 어둡게 눌러서 무섭게 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 65% at 50% 50%, rgba(0,0,0,0) 30%, rgba(60,0,0,0.55) 72%, rgba(0,0,0,0.92) 100%)',
        }}
      />

      {/* 대사 */}
      <motion.p
        className="relative z-10 max-w-[900px] px-6 text-center text-2xl leading-relaxed break-keep
                   text-white drop-shadow-[0_4px_10px_rgba(0,0,0,1)] sm:text-4xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      >
        {LINE}
      </motion.p>

      {/* 도망칠 기회 */}
      <AnimatePresence>
        {step >= 3 && (
          <motion.div
            className="relative z-10 mt-10"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          >
            <Button variant="ghost" onClick={onClose}>
              도망친다
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
