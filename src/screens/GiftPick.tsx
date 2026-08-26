import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useGame } from '../game/store'
import type { FxName } from '../game/types'
import { useFx } from '../fx/fxStore'
import { sfx } from '../fx/sfx'
import { playLoop, playSound } from '../fx/bgm'
import { Button } from '../ui/Button'
import { DodgeButton } from '../ui/DodgeButton'
import { useDodge } from '../ui/useDodge'
import { ButlerCall } from './ButlerCall'
import { DateContract } from './DateContract'
import { asset } from '../asset'

/* =========================================================
   선물 고르기
   "궁에 돌아오신 걸 환영합니다 공주님. 선물을 고르시지요."

   무엇을 고르든 결국 양준혁 집사가 나옵니다.
   선물2 는 마우스를 피해 도망다녀서 아예 고를 수 없습니다.
   ========================================================= */

interface Gift {
  src: string
  /** true 면 마우스/손가락을 피해 도망다님 (영영 못 고름) */
  dodge?: boolean
  /** 골랐을 때 나오는 멘트 */
  message?: string
  /** 골랐을 때 나는 소리 */
  sound?: string
  /** 결과로 띄울 사진 (없으면 RESULT_IMAGE) */
  result?: string
  /** true 면 결과 사진이 삥글삥글 돌면서 커짐 */
  spin?: boolean
  /** 골랐을 때 터뜨릴 이펙트 (없으면 DEFAULT_FX) */
  fx?: FxName[]
}

/** 따로 지정 안 한 선물의 기본 이펙트 */
const DEFAULT_FX: FxName[] = ['confetti', 'lovebomb', 'sparkle']

const GIFTS: Gift[] = [
  {
    src: '/선물1.jfif',
    message: '페라리 로마에 타고 있는 양준혁 집사를 고르다니 탁월한 선택입니다',
    sound: '/앙기모찌.mp3',
    result: '/집사2.jpg',
    spin: true,
  },
  { src: '/선물2.jfif', dodge: true },
  {
    src: '/선물3.webp',
    message: '대저택에 살고있는 양준혁 집사를 고르다니 탁월한 선택입니다',
    sound: '/오빠달린다.mp3',
    result: '/집사4.jpg',
    fx: ['flash', 'zoom', 'fireworks', 'crowns', 'lovebomb', 'sparkle'],
  },
  {
    src: '/선물4.webp',
    message: '요트에 타고있는 양준혁 집사를 고르다니 탁월한 선택입니다',
    sound: '/한국할아버지.mp3',
    result: '/집사5.jpg',
    fx: ['flash', 'bigshake', 'fireworks', 'hearts', 'crowns', 'sparkle'],
  },
  {
    src: '/선물5.jpg',
    message: '양준혁 집사를 고르다니 탁월한 선택입니다',
    sound: '/하앙.mp3',
  },
]

/** 뭘 고르든 결과로 나오는 사진 */
const RESULT_IMAGE = '/선물5.jpg'

/** 도망 카드(선물2)에 손을 뻗으면 나는 소리 */
const DODGE_SOUND = '/뿅.mp3'

/** 고르는 동안 계속 도는 음악. 고르면 꺼지고, 다시 고르러 오면 또 돎 */
const PICK_BGM = '/선물BGM.mp3'

export function GiftPick() {
  const princess = useGame((s) => s.princess)
  const gift = useGame((s) => s.gift)
  const pickGift = useGame((s) => s.pickGift)
  const clearGift = useGame((s) => s.clearGift)
  const play = useFx((s) => s.play)
  // 놀러가기 → 집사 전화 → 데이트 계약서
  const [flow, setFlow] = useState<'none' | 'call' | 'contract'>('none')

  /* 아직 안 골랐을 때만 음악 */
  useEffect(() => {
    if (gift !== null) return
    return playLoop(PICK_BGM, 0.5)
  }, [gift])

  const choose = (i: number) => {
    pickGift(i)
    const s = GIFTS[i].sound
    if (s) playSound(s)
    else sfx.fanfare()
    void play(GIFTS[i].fx ?? DEFAULT_FX)
  }

  return (
    <div className="royal-bg relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-5 py-8">
      {/* 머리말 */}
      <motion.div
        className="z-10 mb-8 text-center"
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <motion.div
          className="shimmer mb-3 text-6xl"
          initial={{ scale: 0, rotate: -140 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 12 }}
        >
          👑
        </motion.div>

        <h1 className="font-impact text-2xl text-amber-200 sm:text-4xl">
          궁에 돌아오신 걸 환영합니다
        </h1>
        <p className="mt-1 font-impact text-3xl font-bold sm:text-5xl">
          <span className="rainbow-text">{princess} 공주님</span>
        </p>
        <p className="mt-4 text-lg text-fuchsia-100/80 sm:text-2xl">선물을 고르시지요</p>
      </motion.div>

      {/* 선물 5개 */}
      <div className="z-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {GIFTS.map((g, i) => (
          <GiftCard key={g.src} gift={g} index={i} onPick={() => choose(i)} />
        ))}
      </div>

      {/* 결과 — 뭘 골라도 양준혁 집사 */}
      <AnimatePresence>
        {gift !== null && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-black/85 px-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.img
              src={asset(GIFTS[gift].result ?? RESULT_IMAGE)}
              alt=""
              className="max-h-[58vh] w-auto max-w-[92vw] object-contain"
              // 삥글삥글: 세 바퀴 돌면서 점점 커짐 / 기본: 통통 튀어나옴
              initial={
                GIFTS[gift].spin
                  ? { scale: 0, rotate: -1080, opacity: 0 }
                  : { scale: 0.2, rotate: -12, opacity: 0 }
              }
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={
                GIFTS[gift].spin
                  ? {
                      rotate: { duration: 1.3, ease: [0.16, 1, 0.3, 1] },
                      scale: { duration: 1.3, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.25 },
                    }
                  : { type: 'spring', stiffness: 240, damping: 15 }
              }
            />

            <motion.p
              className="max-w-[900px] px-2 text-center text-2xl leading-relaxed break-keep
                         text-amber-100 drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] sm:text-4xl"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.35 }}
            >
              {GIFTS[gift].message}
            </motion.p>

            <motion.div
              className="flex flex-wrap items-center justify-center gap-4"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.9 }}
            >
              <Button
                variant="ghost"
                onClick={() => {
                  setFlow('none')
                  clearGift()
                }}
              >
                다시 고르기
              </Button>

              {/* 집사는 일하기 싫어함 — 영영 못 누름 */}
              <DodgeButton>집사 일 시키기</DodgeButton>

              <Button onClick={() => setFlow('call')}>집사랑 놀러가기</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 집사 전화 — 받으면 서약서 얘기를 꺼냄 */}
      <AnimatePresence>
        {flow === 'call' && (
          <ButlerCall onDone={() => setFlow('contract')} onClose={() => setFlow('none')} />
        )}
      </AnimatePresence>

      {/* 데이트 계약서 — 서명해야 놀러 갈 수 있음 */}
      <AnimatePresence>
        {flow === 'contract' && <DateContract onClose={() => setFlow('none')} />}
      </AnimatePresence>
    </div>
  )
}

/* ---------------------------------------------------------
   선물 카드 하나
   --------------------------------------------------------- */
function GiftCard({ gift, index, onPick }: { gift: Gift; index: number; onPick: () => void }) {
  // 도망 카드는 useDodge 가 마우스를 피해 다님 (일 시키기 버튼과 같은 로직)
  const { ref, offset, jump, cry } = useDodge<HTMLButtonElement>(!!gift.dodge, DODGE_SOUND)

  return (
    <motion.button
      ref={ref}
      // 도망 카드는 아래 레이어로 — 안 그러면 다른 선물 위에 올라앉아 못 고르게 막음
      className={[
        'group relative aspect-square w-[40vw] max-w-44 overflow-hidden rounded-3xl',
        'bg-black/40 ring-4 ring-amber-300/50 sm:w-40',
        gift.dodge ? 'z-0' : 'z-10',
      ].join(' ')}
      style={{ touchAction: gift.dodge ? 'none' : undefined }}
      initial={{ opacity: 0, y: 40, scale: 0.7, rotate: -8 }}
      animate={{ opacity: 1, y: offset.y, scale: 1, rotate: 0, x: offset.x }}
      transition={{
        opacity: { delay: 0.3 + index * 0.12 },
        scale: { type: 'spring', stiffness: 320, damping: 18, delay: 0.3 + index * 0.12 },
        rotate: { type: 'spring', stiffness: 320, damping: 18, delay: 0.3 + index * 0.12 },
        // 도망칠 때는 빠르게, 처음 등장할 때는 순서대로
        x: { type: 'spring', stiffness: 500, damping: 22 },
        y: {
          type: 'spring',
          stiffness: 500,
          damping: 22,
          delay: offset.y === 0 ? 0.3 + index * 0.12 : 0,
        },
      }}
      whileHover={gift.dodge ? undefined : { scale: 1.09, y: -8, rotate: index % 2 ? 3 : -3 }}
      whileTap={gift.dodge ? undefined : { scale: 0.93 }}
      // 마우스 추적 도망은 위 useEffect 가 담당. 여기는 보조.
      onPointerEnter={(e) => {
        if (gift.dodge) jump()
        else if (e.pointerType === 'mouse') sfx.hover()
      }}
      // 터치로도 못 잡게 (폰에는 hover 가 없음)
      onPointerDown={(e) => {
        if (!gift.dodge) return
        e.preventDefault()
        cry()
        jump()
      }}
      onClick={() => {
        if (gift.dodge) return
        onPick()
      }}
    >
      <img
        src={asset(gift.src)}
        alt={`선물 ${index + 1}`}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
      />

      {/* 번호 배지 */}
      <span
        className="absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-full
                   bg-gradient-to-b from-amber-300 to-amber-500 font-bold text-royal-900
                   ring-2 ring-amber-100"
      >
        {index + 1}
      </span>

      {/* 올려놨을 때 반짝 */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200
                   group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)',
        }}
      />
    </motion.button>
  )
}
