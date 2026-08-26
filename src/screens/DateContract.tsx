import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useGame } from '../game/store'
import { BUTLER, PRINCESS } from '../game/config'
import { useFx } from '../fx/fxStore'
import { playLoop, playSequence, playSound } from '../fx/bgm'
import { sfx } from '../fx/sfx'
import { Button } from '../ui/Button'
import { Speech } from '../ui/Speech'
import { ButlerSign, Seal } from '../ui/ContractSigns'
import { SignaturePad } from '../ui/SignaturePad'
import type { SignaturePadHandle } from '../ui/SignaturePad'
import { MarriageVow } from './MarriageVow'
import { Ending } from './Ending'
import { asset } from '../asset'

/* =========================================================
   데이트 계약서
   놀러 가기 전에 을(공주님)이 마우스로 직접 서명해야 함.

   조항 고칠 곳 = CLAUSES
   ========================================================= */

interface Clause {
  head: string
  body: string[]
}

const CLAUSES: Clause[] = [
  {
    head: '제1조 (목적)',
    body: [
      `본 계약은 갑 ${BUTLER} 집사가 을 ${PRINCESS} 공주님을 모시고 나가는 데이트에 있어,` +
        ' 갑의 도리와 을의 권리를 명백히 함을 목적으로 한다.',
    ],
  },
  {
    head: '제2조 (갑의 의무)',
    body: [
      '① 갑은 약속 시각 30분 전에 도착하여 대기한다. 을이 늦는 것은 지각이 아니라 등장이다.',
      '② 갑은 을의 짐을 전부 든다. 을이 드는 것은 을의 손뿐이어야 한다.',
      '③ 갑은 사진을 최소 87장 촬영하되, 을의 다리는 실물보다 길게 나와야 한다.',
      '④ 갑은 "아무거나"라는 답변이 금지되며, 항상 선택지를 3개 이상 준비한다.',
    ],
  },
  {
    head: '제3조 (을의 권리)',
    body: [
      '① 메뉴 결정권은 전적으로 을에게 있다. 갑의 취향은 참고자료로도 쓰이지 아니한다.',
      '② 을은 사유 없이 계획을 변경할 수 있으며, 이때 갑은 "좋아요"라고만 답한다.',
      '③ 을이 춥다고 하면 갑은 즉시 겉옷을 벗는다. 계절은 고려하지 아니한다.',
    ],
  },
  {
    head: '제4조 (금지행위)',
    body: [
      '갑은 데이트 중 ① 휴대폰 확인 ② 다른 공주 쳐다보기 ③ 축구 이야기 15초 초과 를 하여서는 아니 된다.',
      '적발 시 즉시 파직하고 전 재산을 왕실에 헌납한다.',
    ],
  },
  {
    head: '제5조 (비용)',
    body: [
      '전액 갑 부담으로 한다. 갑은 이에 어떠한 이의도 제기할 수 없으며,' +
        ' 계산서를 보고 놀란 표정을 짓는 행위 또한 금지한다.',
    ],
  },
  {
    head: '제6조 (효력)',
    body: [
      '본 계약은 을의 서명 즉시 발효되고 유효기간은 영원으로 한다.',
      '해지 조항은 존재하지 않는다. 찾지 마시오.',
    ],
  },
]

/** 이만큼은 그어야 서명으로 쳐줌 (획 총 길이 px) */
const MIN_INK = 140

type Phase = 'read' | 'sign' | 'done' | 'twist' | 'back' | 'swap' | 'hyoeun' | 'ending'

/** 계약서 쓰는 동안 깔리는 음악 */
const CONTRACT_BGM = '/서약서BGM.mp3'

/** 서명 완료 — 도장 찍히는 순간 */
const SIGN_SFX = '/티모.mp3'

/* --- 서명 직후 반전 --- */
const TWIST_IMAGE = '/집사8.png'
const TWIST_BGM = '/덱스터.mp3'    // 집사8 이 나오는 동안
const TWIST_GOTCHA = '/잡았쥬.mp3' // 그 음악 중간에 한 번
const TWIST_SIUU = '/쓰우.mp3'     // 잡았쥬 바로 다음
const REVEAL_BGM = '/유희왕.mp3'   // 결혼 서약서가 드러날 때
const REVEAL_MWEOJI = '/뭐지.mp3'      // 유희왕 깔리고 1초 뒤
const REVEAL_IGE = '/이게뭐야.mp3'     // 뭐지가 끝나고 또 1초 뒤
const REVEAL_DELAY = 1000
const REVEAL_GAP = 1000
const TWIST_LINE = '호호호 야레야레... 공주님, 계약서를 자세히 보셨어야죠...'

/* --- ...네 를 누른 뒤 --- */
const HYOEUN_IMAGE = '/효은.jpg'
const HYOEUN_BGM = '/역할공개.mp3'
/** 효은 사진이 떴다가 사라지는 데 걸리는 시간 (ms) */
const HYOEUN_MS = 4200

/**
 * 곡을 틀고 그 곡 한가운데에서 onHit 을 한 번 터뜨림.
 * onEnd 를 주면 곡이 끝날 때(또는 재생이 막혔을 때) 불러줌. 정리 함수를 돌려줌.
 */
function playWithMidHit(track: string, onHit: () => void, onEnd?: () => void) {
  const a = playSound(track, 0.85)
  const timers: number[] = []

  const onMeta = () => {
    const half = (a.duration * 1000) / 2
    timers.push(window.setTimeout(onHit, Number.isFinite(half) ? half : 3000))
  }
  a.addEventListener('loadedmetadata', onMeta, { once: true })
  if (a.readyState >= 1) onMeta() // 이미 읽혔으면 바로

  if (onEnd) {
    a.addEventListener('ended', onEnd, { once: true })
    timers.push(window.setTimeout(onEnd, 15000)) // 소리가 안 나올 때도 진행은 되게
  }

  return () => {
    timers.forEach(clearTimeout)
    if (onEnd) a.removeEventListener('ended', onEnd)
    a.pause()
  }
}

export function DateContract({ onClose }: { onClose: () => void }) {
  const princess = useGame((s) => s.princess)
  const play = useFx((s) => s.play)

  /*  read → sign → done(도장) → twist(집사8) → back(계약서 다시) → swap(옆으로 슥) */
  const [phase, setPhase] = useState<Phase>('read')
  const [ink, setInk] = useState(0)
  const [resetKey, setResetKey] = useState(0)
  const [nag, setNag] = useState('')
  /** 공주님이 그은 서명 — 결혼 서약서로 그대로 넘어감 */
  const [signature, setSignature] = useState('')

  const pad = useRef<SignaturePadHandle>(null)

  const twisted = phase !== 'read' && phase !== 'sign' && phase !== 'done'
  /** 서명이 끝난 뒤로는 계속 도장이 찍혀 있음 */
  const signed = phase !== 'read' && phase !== 'sign'
  /** 데이트 계약서가 옆으로 빠진 뒤 (한 번 빠지면 다시 안 돌아옴) */
  const swept = phase === 'swap' || phase === 'hyoeun' || phase === 'ending'

  /* 계약서 음악 — 반전이 시작되면 꺼짐 */
  useEffect(() => {
    if (twisted) return
    return playLoop(CONTRACT_BGM, 0.55)
  }, [twisted])

  /* 도장 찍히고 잠깐 뒤, 갑자기 집사가 나타남 */
  useEffect(() => {
    if (phase !== 'done') return
    const t = setTimeout(() => setPhase('twist'), 2200)
    return () => clearTimeout(t)
  }, [phase])

  /* 집사8 등장 — 덱스터 한 곡, 그 중간에 잡았쥬, 끝나면 계약서가 다시 나옴 */
  useEffect(() => {
    if (phase !== 'twist') return

    void play(['redflash', 'glitch'])
    return playWithMidHit(
      TWIST_BGM,
      () => {
        playSequence([TWIST_GOTCHA, TWIST_SIUU], { overlapMs: 120 }) // 잡았쥬 → 쓰우
        void play(['zoom', 'bigshake'])
      },
      () => setPhase('back'),
    )
  }, [phase, play])

  /* 계약서를 잠깐 보여준 뒤 옆으로 치움 */
  useEffect(() => {
    if (phase !== 'back') return
    const t = setTimeout(() => {
      setPhase('swap')
      void play(['sparkle', 'hearts'])
    }, 1500)
    return () => clearTimeout(t)
  }, [phase, play])

  /* 결혼 서약서가 드러나는 동안 — 유희왕 → (1초) 뭐지 → (1초) 이게뭐야 */
  useEffect(() => {
    if (phase !== 'swap') return

    const bgm = playSound(REVEAL_BGM, 0.85)
    const timers: number[] = []
    let gone = false

    timers.push(
      window.setTimeout(() => {
        const a = playSound(REVEAL_MWEOJI)
        // 뭐지가 끝나고 1초를 쉰 다음 이게뭐야
        const after = () => {
          if (gone) return
          timers.push(window.setTimeout(() => playSound(REVEAL_IGE), REVEAL_GAP))
        }
        a.addEventListener('ended', after, { once: true })
        a.addEventListener('error', after, { once: true })
      }, REVEAL_DELAY),
    )

    return () => {
      gone = true
      timers.forEach(clearTimeout)
      bgm.pause()
    }
  }, [phase])

  /* ...네 → 효은 사진이 떴다 사라지고, 그대로 엔딩으로 */
  useEffect(() => {
    if (phase !== 'hyoeun') return
    playSound(HYOEUN_BGM, 0.8)
    const t = setTimeout(() => setPhase('ending'), HYOEUN_MS)
    return () => clearTimeout(t)
  }, [phase])

  const finish = () => {
    if (ink < MIN_INK) {
      setNag(
        ink === 0
          ? '서명란이 비어 있습니다. 왕실은 공백을 인정하지 않습니다.'
          : '성의가 부족합니다. 그것은 서명이 아니라 점입니다.',
      )
      sfx.error()
      return
    }
    setNag('')
    setSignature(pad.current?.snapshot() ?? '') // 서명을 떠 둠
    setPhase('done')
    playSound(SIGN_SFX)
    void play(['flash', 'zoom', 'fireworks', 'hearts', 'lovebomb', 'crowns', 'sparkle'])
  }

  return (
    <motion.div
      className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 계약서와 그 뒤에 숨어 있던 종이가 같은 자리에 겹쳐 있음 */}
      <div className="relative flex max-h-full w-[min(94vw,720px)] flex-col">
        {/* 뒤 — 결혼 서약서 */}
        {(phase === 'back' || swept) && (
          <div className="absolute inset-0">
            <MarriageVow signature={signature} onYes={() => setPhase('hyoeun')} />
          </div>
        )}


        {/* 앞 — 데이트 계약서. 다 끝나면 옆으로 슥 빠짐 */}
        <motion.div
          className={[
            'relative flex max-h-full flex-col overflow-hidden rounded-3xl',
            'bg-gradient-to-b from-amber-50 to-amber-100 text-royal-900',
            'shadow-[0_24px_70px_rgba(0,0,0,0.7)] ring-4 ring-amber-400',
            swept ? 'pointer-events-none' : '',
          ].join(' ')}
          initial={{ scale: 0.6, y: 60, rotate: -3 }}
          animate={
            swept
              ? { scale: 0.92, x: '115%', rotate: 9, opacity: 0 }
              : { scale: 1, x: 0, y: 0, rotate: 0, opacity: 1 }
          }
          exit={{ scale: 0.7, opacity: 0, y: 30 }}
          transition={
            swept
              ? { duration: 0.75, ease: [0.4, 0, 0.2, 1] }
              : { type: 'spring', stiffness: 320, damping: 24 }
          }
        >
        {/* 머리말 */}
        <div className="border-b-4 border-double border-amber-600/60 px-6 pt-6 pb-4 text-center">
          <p className="mb-2 text-sm text-royal-600 sm:text-base">
            집사와 데이트를 가기 전에 데이트 계약서에 서명을 해야 합니다
          </p>
          <h2 className="font-impact text-3xl font-bold tracking-[0.3em] sm:text-4xl">
            데이트 계약서
          </h2>
        </div>

        {/* 본문 */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 text-left leading-relaxed break-keep">
          <p className="mb-4 text-base sm:text-lg">
            갑 <b className="text-royal-600">{BUTLER}</b> (이하 집사) 와 을{' '}
            <b className="text-royal-600">{princess || PRINCESS}</b> (이하 공주님) 은 아래와 같이
            데이트 계약을 체결한다.
          </p>

          {CLAUSES.map((c) => (
            <div key={c.head} className="mb-4">
              <div className="font-bold text-royal-600">{c.head}</div>
              {c.body.map((line, i) => (
                <p key={i} className="text-[15px] sm:text-base">
                  {line}
                </p>
              ))}
            </div>
          ))}

          <p className="mb-5 text-center text-sm text-royal-600/80">
            — 부칙: 갑은 이미 서명을 마쳤음. 아주 기쁜 마음으로. —
          </p>

          {/* 서명란 */}
          <div className="grid gap-4 border-t-2 border-dashed border-amber-600/50 pt-5 sm:grid-cols-2">
            {/* 갑 — 이미 서명함 */}
            <div>
              <div className="mb-1 text-sm font-bold">갑 (집사) {BUTLER}</div>
              {/* 하트 한 방, 그 뒤에 아주 연하게 help */}
              <ButlerSign help />
            </div>

            {/* 을 — 여기에 직접 서명 */}
            <div>
              <div className="mb-1 text-sm font-bold">을 (공주님) {princess || PRINCESS}</div>
              <div
                className={[
                  'relative h-28 rounded-xl bg-white/70 ring-2 transition-shadow',
                  phase === 'sign'
                    ? 'shadow-[0_0_0_4px_rgba(217,70,239,0.25)] ring-royal-400'
                    : 'ring-amber-600/30',
                ].join(' ')}
              >
                {phase === 'read' ? (
                  <span className="absolute inset-0 flex items-center justify-center text-sm text-royal-900/40">
                    서명 대기 중
                  </span>
                ) : (
                  <SignaturePad
                    ref={pad}
                    className="h-28"
                    resetKey={resetKey}
                    enabled={phase === 'sign'}
                    onInk={setInk}
                  />
                )}

                {/* 계약 성립 도장 */}
                <AnimatePresence>
                  {signed && <Seal top="계약" bottom="성립" />}
                </AnimatePresence>
              </div>

              {phase === 'sign' && (
                <p className="mt-1 text-xs text-royal-600">
                  마우스를 끌어서 서명하십시오 (손가락도 됩니다)
                </p>
              )}
            </div>
          </div>

          {nag && (
            <motion.p
              className="mt-3 text-center font-bold text-red-600"
              initial={{ x: -8 }}
              animate={{ x: [8, -8, 6, -6, 0] }}
              transition={{ duration: 0.4 }}
            >
              {nag}
            </motion.p>
          )}

          {signed && (
            <motion.p
              className="mt-4 text-center text-lg font-bold text-royal-600"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              계약이 체결되었습니다. {BUTLER} 집사가 대문 앞에서 30분째 기다리고 있습니다.
            </motion.p>
          )}
        </div>

        {/* 버튼 */}
        <div
          className="flex flex-wrap items-center justify-center gap-3 border-t-2 border-amber-600/40
                     bg-amber-100/80 px-6 py-4"
        >
          {phase === 'read' && (
            <>
              <Button onClick={() => setPhase('sign')}>서명하기</Button>
              <Button
                variant="ghost"
                className="!text-royal-900 !ring-royal-900/30"
                onClick={onClose}
              >
                잠시만요
              </Button>
            </>
          )}

          {phase === 'sign' && (
            <>
              <Button onClick={finish}>서명 완료</Button>
              <Button
                variant="ghost"
                className="!text-royal-900 !ring-royal-900/30"
                onClick={() => {
                  setResetKey((k) => k + 1)
                  setNag('')
                }}
              >
                지우고 다시
              </Button>
            </>
          )}

          {/* 서명 후에는 버튼이 없다. 집사가 알아서 진행한다. */}
          {signed && (
            <p className="text-sm text-royal-600/70">잠시만 기다려 주십시오...</p>
          )}
        </div>
        </motion.div>
      </div>

      {/* ...네 → 오른쪽 빈자리에 효은이 스윽 떴다가 사라짐 */}
      <AnimatePresence>
        {phase === 'hyoeun' && (
          <motion.img
            src={asset(HYOEUN_IMAGE)}
            alt=""
            // 테두리 없이 원본 그대로
            className="pointer-events-none absolute top-1/2 right-[3vw] z-[65]
                       w-[clamp(150px,26vw,320px)] -translate-y-1/2 object-contain"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1, 1, 1.05] }}
            transition={{ duration: HYOEUN_MS / 1000, times: [0, 0.32, 0.7, 1] }}
          />
        )}
      </AnimatePresence>

      {/* 엔딩 */}
      <AnimatePresence>{phase === 'ending' && <Ending onClose={onClose} />}</AnimatePresence>

      {/* 반전 — 집사가 서서히 다가옴 */}
      <AnimatePresence>
        {phase === 'twist' && (
          <motion.div
            className="absolute inset-0 z-[70] flex flex-col items-center justify-center gap-6
                       overflow-hidden bg-black px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.img
              src={asset(TWIST_IMAGE)}
              alt=""
              className="max-h-[62vh] w-auto max-w-[92vw] object-contain"
              // 아주 천천히, 점점 크게 — 도망갈 수 없음
              initial={{ scale: 0.55, opacity: 0, filter: 'brightness(0.15) saturate(0.2)' }}
              animate={{ scale: 1.18, opacity: 1, filter: 'brightness(1) saturate(1.2)' }}
              transition={{ duration: 6, ease: 'easeIn' }}
            />

            <Speech
              text={TWIST_LINE}
              speed={95}
              className="text-xl font-bold text-red-300 sm:text-3xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
