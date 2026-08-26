import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BUTLER } from '../game/config'
import { sfx } from '../fx/sfx'
import { playLoop } from '../fx/bgm'
import { useFx } from '../fx/fxStore'
import { Button } from '../ui/Button'
import { Speech } from '../ui/Speech'
import { asset } from '../asset'

/* =========================================================
   집사의 전화

   놀러가기를 누르면 먼저 전화가 옴.
   받으면(YES 든 네 든 결과는 같음) 집사가 서약서 얘기를 꺼내고,
   그 다음 계약서 화면으로 넘어감.
   ========================================================= */

/** 폰 사진. 비우면 아래 목업(직접 그린 폰)이 대신 나옴 */
const PHONE_IMAGE = '/폰.jpg'

/** 통화 중에 뜨는 집사 사진 */
const BUTLER_IMAGE = '/집사6.jpg'

/** 받을 때까지 반복해서 울리는 전화벨 */
const RINGTONE = '/전화벨.mp3'

/** 집사 대사 */
const LINE = `공주님, 저와 데이트를 나가기 위해서는 서약서가 필요합니다`

export function ButlerCall({ onDone, onClose }: { onDone: () => void; onClose: () => void }) {
  const [phase, setPhase] = useState<'ringing' | 'talking'>('ringing')
  const play = useFx((s) => s.play)

  /* 받을 때까지 전화벨 반복. 받거나 화면을 벗어나면 꺼짐 */
  useEffect(() => {
    if (phase !== 'ringing') return
    return playLoop(RINGTONE)
  }, [phase])

  const answer = () => {
    sfx.ok()
    setPhase('talking')
    void play('sparkle')
  }

  return (
    <motion.div
      className="absolute inset-0 z-[55] flex flex-col items-center justify-center gap-7
                 bg-black/85 px-5 py-8 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
        {/* 폰 */}
        <Phone ringing={phase === 'ringing'} />

        {/* 통화 연결되면 집사 등장 */}
        <AnimatePresence>
          {phase === 'talking' && (
            <motion.img
              src={asset(BUTLER_IMAGE)}
              alt=""
              className="max-h-[42vh] w-auto max-w-[80vw] rounded-3xl object-contain
                         shadow-[0_16px_50px_rgba(0,0,0,0.7)] ring-4 ring-amber-300/70"
              initial={{ x: 120, opacity: 0, scale: 0.7, rotate: 8 }}
              animate={{ x: 0, opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* 안내 / 대사 */}
      {phase === 'ringing' ? (
        <motion.p
          className="text-center font-impact text-2xl text-amber-200 drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] sm:text-4xl"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {BUTLER} 집사의 전화입니다. 받을까요?
        </motion.p>
      ) : (
        <Speech text={LINE} className="text-xl text-amber-100 sm:text-3xl" />
      )}

      {/* 버튼 — 뭘 눌러도 받아짐 */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {phase === 'ringing' ? (
          <>
            <Button onClick={answer}>YES</Button>
            <Button onClick={answer}>네</Button>
          </>
        ) : (
          <>
            <Button onClick={onDone}>서약서 쓰러 가기</Button>
            <Button variant="ghost" onClick={onClose}>
              끊기
            </Button>
          </>
        )}
      </div>
    </motion.div>
  )
}

/* ---------------------------------------------------------
   폰 — 사진이 없으면 직접 그림
   --------------------------------------------------------- */
function Phone({ ringing }: { ringing: boolean }) {
  // 흔들림 — 사진이든 목업이든 똑같이 씀
  const shake = ringing
    ? { rotate: [-2.5, 2.5, -2.5], x: [-4, 4, -4] }
    : { rotate: 0, x: 0 }

  const shakeTiming = {
    scale: { type: 'spring' as const, stiffness: 300, damping: 20 },
    y: { type: 'spring' as const, stiffness: 300, damping: 20 },
    opacity: { duration: 0.2 },
    rotate: ringing ? { duration: 0.22, repeat: Infinity } : { duration: 0.2 },
    x: ringing ? { duration: 0.22, repeat: Infinity } : { duration: 0.2 },
  }

  if (PHONE_IMAGE) {
    return (
      <motion.div
        // 제품 사진이라 배경이 흰색 — 흰 카드에 얹어 액자처럼 보이게
        className="rounded-3xl bg-white p-2 shadow-[0_16px_50px_rgba(0,0,0,0.8)] ring-4 ring-amber-300/70"
        initial={{ scale: 0.6, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1, ...shake }}
        transition={shakeTiming}
      >
        <img
          src={asset(PHONE_IMAGE)}
          alt=""
          className="h-[46vh] max-h-[420px] min-h-[300px] w-auto object-contain"
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      className="relative h-[46vh] max-h-[420px] min-h-[300px] w-[min(58vw,220px)]
                 rounded-[2.5rem] bg-neutral-900 p-3 shadow-[0_16px_50px_rgba(0,0,0,0.8)]
                 ring-4 ring-neutral-600"
      initial={{ scale: 0.6, y: 40, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1, ...shake }}
      transition={shakeTiming}
    >
      {/* 노치 */}
      <div className="absolute top-2.5 left-1/2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-neutral-700" />

      {/* 화면 */}
      <div
        className="flex h-full w-full flex-col items-center justify-between rounded-[1.9rem]
                   bg-gradient-to-b from-neutral-800 via-neutral-900 to-black px-4 pt-8 pb-6"
      >
        <div className="text-center">
          <p className="text-xs tracking-widest text-white/45">수신 전화</p>
          <p className="mt-1 font-impact text-2xl text-white">{BUTLER}</p>
          <p className="text-sm text-amber-300/80">집사</p>
        </div>

        {/* 프로필 — 울릴 때 파장 */}
        <div className="relative flex items-center justify-center">
          {ringing && (
            <motion.span
              className="absolute h-20 w-20 rounded-full ring-2 ring-amber-300/70"
              animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            />
          )}
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl">
            🤵
          </span>
        </div>

        {/* 받기 / 거절 — 장식용 (진짜 버튼은 아래) */}
        <div className="flex w-full items-center justify-around">
          <motion.span
            className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500 text-xl"
            animate={ringing ? { y: [0, -6, 0] } : { y: 0 }}
            transition={ringing ? { duration: 0.7, repeat: Infinity } : undefined}
          >
            📞
          </motion.span>
          <span className="flex h-11 w-11 rotate-[135deg] items-center justify-center rounded-full bg-red-500 text-xl">
            📞
          </span>
        </div>
      </div>
    </motion.div>
  )
}
