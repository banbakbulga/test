import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { playSound } from '../fx/bgm'
import { useFx } from '../fx/fxStore'
import { Button } from '../ui/Button'
import { asset } from '../asset'

/* =========================================================
   후계자 양성교육

   선물 결과 화면에서 "후계자 양성교육에 참여하기" 를 누르면 나옴.

   1) 경고   — 광기 바이올린. 재용이 화면을 꽉 채우며 천천히 다가오고,
              중간에 "안돼" 가 겹침. 여기서 "도망친다" 를 누르면
   2) 추격   — 재용3 으로 바뀌며 "도망가시려고요 ..??".
              추격 음악 + 중간에 공습경보.
   3) 사면   — 재용2 가 귀엽게 나오며 "이번 한번만 봐드리지요 ....".
              OK 소리와 함께 선물 화면으로 돌아감.
   ========================================================= */

type Step = 'warn' | 'chase' | 'pardon'

/* ---- 소리 ---- */
const SND_VIOLIN = '/광기바이올린.mp3' // 경고 내내
const SND_NO = '/안돼.mp3' // 경고 중간
const SND_CHASE = '/추격.mp3' // 추격 내내
const SND_ALARM = '/공습경보.mp3' // 추격 중간
const SND_OK = '/OK.mp3' // 사면

/* ---- 그림 ---- */
const IMG_WARN = '/재용.png'
const IMG_CHASE = '/재용3.png'
const IMG_PARDON = '/재용2.png'

/* ---- 대사 ---- */
const LINE_WARN = '공주님 ... 정녕 .. 그곳에 다시 발을 들이시려는겁니까 ..?'
const LINE_CHASE = '공주님 도망가시려고요 ..??'
const LINE_PARDON = '좋습니다 이번 한번만 봐드리지요 ....'

/* ---- 타이밍 (ms) ---- */
const WARN_IMAGE = 1200 // 재용 등장
const WARN_SCREAM = 4300 // "안돼" + 들이닥침
const WARN_BUTTON = 5800 // 도망칠 기회

const CHASE_ALARM = 1500 // 공습경보 겹침
const CHASE_END = 5200 // 추격 끝 → 사면

const PARDON_END = 4200 // 사면 끝 → 선물 화면

export function HeirTraining({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>('warn')
  const [beat, setBeat] = useState(0) // 각 단계 안에서의 진행 정도
  const play = useFx((s) => s.play)

  /** 지금 단계에서 틀어둔 배경음 — 단계가 바뀌면 꺼야 함 */
  const bgRef = useRef<HTMLAudioElement | null>(null)

  const stopBg = useCallback(() => {
    if (!bgRef.current) return
    bgRef.current.pause()
    bgRef.current.src = ''
    bgRef.current = null
  }, [])

  /* ---------- 1) 경고 ---------- */
  useEffect(() => {
    if (step !== 'warn') return
    bgRef.current = playSound(SND_VIOLIN, 0.75)

    const timers = [
      setTimeout(() => setBeat(1), WARN_IMAGE),
      setTimeout(() => {
        setBeat(2)
        playSound(SND_NO, 0.95)
        void play(['bigshake', 'redflash'])
      }, WARN_SCREAM),
      setTimeout(() => setBeat(3), WARN_BUTTON),
    ]
    return () => {
      timers.forEach(clearTimeout)
      stopBg()
    }
  }, [step, play, stopBg])

  /* ---------- 2) 추격 ---------- */
  useEffect(() => {
    if (step !== 'chase') return
    bgRef.current = playSound(SND_CHASE, 0.8)

    const timers = [
      setTimeout(() => {
        playSound(SND_ALARM, 0.7)
        void play(['redflash', 'shake'])
      }, CHASE_ALARM),
      setTimeout(() => setStep('pardon'), CHASE_END),
    ]
    return () => {
      timers.forEach(clearTimeout)
      stopBg()
    }
  }, [step, play, stopBg])

  /* ---------- 3) 사면 ---------- */
  useEffect(() => {
    if (step !== 'pardon') return
    playSound(SND_OK, 0.9)
    void play(['confetti', 'sparkle'])

    const t = setTimeout(onClose, PARDON_END)
    return () => clearTimeout(t)
  }, [step, play, onClose])

  /* 도망친다 */
  const flee = () => {
    stopBg()
    setStep('chase')
    void play(['glitch', 'bigshake'])
  }

  const chasing = step === 'chase'
  const pardoning = step === 'pardon'

  return (
    <motion.div
      className="absolute inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ---------- 재용 ----------
          주의: mode="wait" 를 쓰면 안 됨.
          추격 그림은 무한 반복 애니메이션이라 exit 이 끝나질 않아서
          다음 그림(재용2)이 영영 못 들어옴. 그냥 교차로 바꾼다. */}
      <AnimatePresence>
        {/* 경고: 천천히 다가오다가 확 들이닥침 */}
        {step === 'warn' && beat >= 1 && (
          <motion.img
            key="warn"
            src={asset(IMG_WARN)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: 'contrast(1.25) saturate(0.75) brightness(0.8)' }}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: beat >= 2 ? 1.75 : 1.3 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 2.4, ease: 'easeIn' },
              scale:
                beat >= 2
                  ? { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
                  : { duration: 3.6, ease: 'linear' },
            }}
          />
        )}

        {/* 추격: 확 들이닥친 채로 계속 들썩임 */}
        {chasing && (
          <motion.img
            key="chase"
            src={asset(IMG_CHASE)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: 'contrast(1.45) saturate(1.3) brightness(0.85)' }}
            initial={{ opacity: 0, scale: 2.2 }}
            animate={{ opacity: 1, scale: [1.55, 1.68, 1.55] }}
            // exit 에 transition 을 직접 달아 무한 반복을 끊어준다
            exit={{ opacity: 0, scale: 1.2, transition: { duration: 0.3 } }}
            transition={{
              opacity: { duration: 0.18 },
              scale: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' },
            }}
          />
        )}

        {/* 사면: 귀엽게 통통 */}
        {pardoning && (
          <motion.img
            key="pardon"
            src={asset(IMG_PARDON)}
            alt=""
            className="absolute top-1/2 left-1/2 max-h-[60vh] w-auto max-w-[86vw] object-contain"
            initial={{ opacity: 0, scale: 0.2, x: '-50%', y: '-50%', rotate: -12 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: '-50%',
              y: ['-50%', '-54%', '-50%'],
              rotate: [-3, 3, -3],
            }}
            exit={{ opacity: 0, scale: 0.6, x: '-50%', y: '-50%', transition: { duration: 0.3 } }}
            transition={{
              opacity: { duration: 0.3 },
              scale: { type: 'spring', stiffness: 260, damping: 12 },
              y: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            }}
          />
        )}
      </AnimatePresence>

      {/* ---------- 비네트 ---------- */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: pardoning
            ? 'radial-gradient(ellipse 75% 70% at 50% 50%, rgba(80,20,90,0.25) 0%, rgba(0,0,0,0.85) 100%)'
            : chasing
              ? 'radial-gradient(ellipse 65% 60% at 50% 50%, rgba(0,0,0,0) 25%, rgba(120,0,0,0.6) 68%, rgba(0,0,0,0.95) 100%)'
              : 'radial-gradient(ellipse 70% 65% at 50% 50%, rgba(0,0,0,0) 30%, rgba(60,0,0,0.55) 72%, rgba(0,0,0,0.92) 100%)',
        }}
      />

      {/* ---------- 대사 ---------- */}
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          className={[
            'relative z-10 max-w-[900px] px-6 text-center leading-relaxed break-keep',
            'drop-shadow-[0_4px_10px_rgba(0,0,0,1)]',
            chasing
              ? 'text-3xl font-bold text-rose-200 sm:text-5xl'
              : pardoning
                ? 'text-2xl text-amber-100 sm:text-4xl'
                : 'text-2xl text-white sm:text-4xl',
          ].join(' ')}
          initial={{ opacity: 0, y: 16, scale: chasing ? 0.7 : 1 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={
            chasing
              ? { type: 'spring', stiffness: 500, damping: 14 }
              : { duration: 1.1, ease: 'easeOut' }
          }
        >
          {chasing ? LINE_CHASE : pardoning ? LINE_PARDON : LINE_WARN}
        </motion.p>
      </AnimatePresence>

      {/* ---------- 도망칠 기회 (경고 단계에서만) ---------- */}
      <AnimatePresence>
        {step === 'warn' && beat >= 3 && (
          <motion.div
            className="relative z-10 mt-10"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          >
            <Button variant="ghost" onClick={flee}>
              도망친다
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
