import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '../ui/Button'
import { Popup } from '../ui/Popup'
import { LoadingBar } from '../ui/LoadingBar'
import { useFx } from '../fx/fxStore'
import { sfx } from '../fx/sfx'
import { playBgm, stopBgm, playSound } from '../fx/bgm'

/** 환영 화면에서 터지는 소리 */
const SND_YAHO = '/야호.mp3'      // 최효은일 때
const SND_GET_OUT = '/꺼져.mp3'   // 아닐 때
import { isPrincess } from '../game/config'
import type { FxName } from '../game/types'

/* =========================================================
   ★ 게임 첫 화면 ★
   안녕하세요 공주님. 존함을 입력해 주세요.

   흐름:
     greeting → asking → verifying → confirm → welcome
   welcome 에서 이름에 따라 반응이 갈림 (config.ts 의 PRINCESS)
   ========================================================= */

type Phase = 'greeting' | 'asking' | 'verifying' | 'confirm' | 'welcome'

interface Props {
  onDone: (name: string) => void
}

/** 킹받는 입력 검증 */
function validate(raw: string): string | null {
  const name = raw.trim()
  if (!name) return '공주님... 존함이 없으시다니요? 그럴 리가 없습니다.'
  if (name.length === 1) return '한 글자요? 왕실 규정상 두 글자 이상이어야 합니다.'
  if (['공주', '공주님', 'princess'].includes(name.toLowerCase()))
    return '그건 존함이 아니라 직함이십니다.'
  if (/^[0-9]+$/.test(name)) return '숫자는 죄수 번호입니다. 존함을 입력해 주세요.'
  return null
}

/* ---------------------------------------------------------
   환영 대사 — 이름에 따라 두 갈래
   --------------------------------------------------------- */
interface WelcomeLine {
  text: string
  fx?: FxName | FxName[]
  /** 앞 줄이 뜨고 나서 이만큼 뒤에 뜸 (ms) */
  gap?: number
  big?: boolean
  rainbow?: boolean
}

const WELCOME_PRINCESS: WelcomeLine[] = [
  { text: '공주님 안녕하십니까', fx: 'crowns', gap: 400 },
  { text: '환영합니다', fx: 'confetti', gap: 900 },
  { text: '사랑합니다', fx: ['lovebomb', 'fireworks'], gap: 900, big: true, rainbow: true },
]

/** 대사 안의 {이름} 은 입력한 존함으로 치환됩니다. */
const WELCOME_STRANGER: WelcomeLine[] = [
  { text: '{이름}...?', gap: 500 },
  { text: '너 누군데?', fx: ['glitch', 'shake'], gap: 900 },
  { text: '...', gap: 1100 },
  { text: '나가라', fx: 'redflash', gap: 1300, big: true },
]

const fillName = (text: string, name: string) => text.replaceAll('{이름}', name)

/* ---------------------------------------------------------
   환영 시퀀스에 깔리는 사진 (public/)
   대사가 진행될수록 화면 가장자리에 하나씩 흩뿌려집니다.
   --------------------------------------------------------- */
const IMG_PRINCESS = [
  '/환영합니다.jpg',
  '/환영합니다2.jpg',
  '/환영합니다3.jpg',
  '/환영합니다4.jpg',
  '/환영합니다5.jpg',
]

const IMG_STRANGER = [
  '/너 누군데.jpg',
  '/너 누군데2.jpg',
  '/너 누군데3.jpg',
  '/너 누군데4.jpg',
  '/너 누군데5.jpg',
]

/** 화면을 꽉 채우도록 크게 깔리는 자리 (네 귀퉁이 + 가운데) */
const SPOTS = [
  { top: '-2%', left: '-3%', rot: -5 },
  { top: '-3%', right: '-3%', rot: 4 },
  { bottom: '-3%', left: '-2%', rot: 4 },
  { bottom: '-2%', right: '-3%', rot: -4 },
  { top: '50%', left: '50%', center: true, rot: 2 },
] as const

export function NameInput({ onDone }: Props) {
  const [phase, setPhase] = useState<Phase>('greeting')
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const play = useFx((s) => s.play)

  const name = value.trim()
  const royal = isPrincess(name)

  /* 시작 화면 배경음악 — 존함이 접수되면 꺼짐 */
  useEffect(() => {
    playBgm('/Springtime.mp3')
    return () => stopBgm(0)
  }, [])

  /* 인사 → 입력 요청 */
  useEffect(() => {
    if (phase !== 'greeting') return
    void play('sparkle')
    const t = setTimeout(() => setPhase('asking'), 2600)
    return () => clearTimeout(t)
  }, [phase, play])

  useEffect(() => {
    if (phase === 'asking') inputRef.current?.focus()
  }, [phase])

  const submit = () => {
    const problem = validate(value)
    if (problem) {
      setError(problem)
      setAttempts((a) => a + 1)
      sfx.error()
      void play(['shake', 'redflash'])
      return
    }
    setError(null)
    sfx.ding()
    stopBgm()            // 존함 입력 완료 → 음악 끄기
    setPhase('verifying')
  }

  return (
    <div className="royal-bg relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-6">
      <FloatingDeco />

      <AnimatePresence mode="wait">
        {/* ---------- 1. 인사 ---------- */}
        {phase === 'greeting' && (
          <motion.div key="greeting" className="z-10 text-center" exit={{ opacity: 0, scale: 1.4 }}>
            <PopIn text="안녕하세요" className="text-4xl text-amber-100 sm:text-5xl" />
            <motion.div
              className="mt-4 font-impact text-6xl sm:text-8xl"
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: -3 }}
              transition={{ type: 'spring', stiffness: 260, damping: 11, delay: 1.1 }}
            >
              <span className="rainbow-text drop-shadow-[0_6px_0_rgba(0,0,0,0.5)]">공주님</span>
            </motion.div>
            <motion.div
              className="shimmer mt-6 text-7xl"
              initial={{ y: -140, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 1.7 }}
            >
              👑
            </motion.div>
          </motion.div>
        )}

        {/* ---------- 2. 존함 입력 ---------- */}
        {phase === 'asking' && (
          <motion.div
            key="asking"
            className="z-10 flex w-full flex-col items-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <motion.div className="floating mb-2 text-6xl">👑</motion.div>

            <h1 className="mb-1 text-center font-impact text-3xl text-amber-200 sm:text-4xl">
              왕실 등록 시스템
            </h1>
            <p className="mb-8 text-center text-lg text-fuchsia-200/80">존함을 입력해 주세요</p>

            <div className="flex w-[min(92vw,520px)] flex-col gap-4">
              <motion.input
                ref={inputRef}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  setError(null)
                  if (e.target.value.length > value.length) sfx.blip()
                }}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                maxLength={12}
                placeholder="여기에 존함을..."
                spellCheck={false}
                autoComplete="off"
                className="w-full rounded-2xl bg-black/45 px-6 py-5 text-center text-3xl
                           text-white ring-4 ring-amber-300/50 transition-shadow
                           outline-none placeholder:text-white/25 focus:ring-amber-300"
                animate={error ? { x: [0, -12, 12, -8, 8, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
              />

              <Button onClick={submit}>확 인</Button>
            </div>

            {/* 킹받는 에러 메시지 */}
            <AnimatePresence>
              {error && (
                <motion.p
                  className="mt-5 max-w-[92vw] text-center text-lg text-rose-300"
                  initial={{ opacity: 0, y: -10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                >
                  {error}
                  {attempts >= 3 && (
                    <span className="mt-1 block text-base text-rose-400/70">
                      ... 벌써 {attempts}번째이십니다.
                    </span>
                  )}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ---------- 3. 조회 중 (99%에서 멈추는 로딩바) ---------- */}
        {phase === 'verifying' && (
          <motion.div key="verifying" className="z-10" exit={{ opacity: 0, scale: 0.9 }}>
            <LoadingBar
              label="왕실 데이터베이스 조회 중..."
              ms={3400}
              onDone={() => setPhase('confirm')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- 4. 확인 팝업 (아니요 버튼은 도망감) ---------- */}
      <AnimatePresence>
        {phase === 'confirm' && (
          <Popup
            key="confirm"
            title="최종 확인"
            buttons={[
              {
                label: '네, 맞습니다',
                onClick: () => {
                  setPhase('welcome')
                  if (royal) {
                    playSound(SND_YAHO)       // 야호
                    void play('flash')
                  } else {
                    playSound(SND_GET_OUT)    // 꺼져
                  }
                },
              },
              {
                label: '아니요',
                variant: 'ghost',
                onClick: () => {
                  // 아니라고 하면 존함부터 다시
                  sfx.bad()
                  void play('glitch')
                  setPhase('asking')
                  setValue('')
                },
              },
            ]}
          >
            정말 <span className="font-impact text-2xl text-amber-300">{name}</span>
            {royal ? ' 공주님이 맞으십니까?' : ' 님... 맞으십니까?'}
          </Popup>
        )}
      </AnimatePresence>

      {/* ---------- 5. 환영 (이름에 따라 갈림) ---------- */}
      <AnimatePresence>
        {phase === 'welcome' && (
          <WelcomeSequence
            key="welcome"
            name={name}
            royal={royal}
            onFinish={() => onDone(name)}
            onBack={() => {
              // 최효은이 아니면 여기서 쫓겨나 처음으로 돌아감
              sfx.error()
              void play('glitch')
              setValue('')
              setError(null)
              setPhase('asking')
              playBgm('/Springtime.mp3')   // 시작 화면으로 돌아왔으니 음악 다시
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* =========================================================
   환영 시퀀스 — 대사를 한 줄씩 띄우고 마지막에 버튼
   ========================================================= */
function WelcomeSequence({
  name,
  royal,
  onFinish,
  onBack,
}: {
  name: string
  royal: boolean
  onFinish: () => void
  onBack: () => void
}) {
  const lines = royal ? WELCOME_PRINCESS : WELCOME_STRANGER
  const [shown, setShown] = useState(0)
  const play = useFx((s) => s.play)

  useEffect(() => {
    if (shown >= lines.length) return
    const line = lines[shown]
    const t = setTimeout(() => {
      if (line.fx) void play(line.fx)
      sfx[royal ? 'ding' : 'blip']()
      setShown((n) => n + 1)
    }, line.gap ?? 700)
    return () => clearTimeout(t)
  }, [shown, lines, play, royal])

  const done = shown >= lines.length

  return (
    <motion.div
      className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 px-6 text-center"
      style={{ background: royal ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.75)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 사진 — 대사가 진행될수록 한 장씩 깔림 (화면을 꽉 채움) */}
      <ScatteredImages
        images={royal ? IMG_PRINCESS : IMG_STRANGER}
        revealed={Math.ceil((shown / lines.length) * 5)}
      />

      {/* 가운데 어둡게 — 사진 위에서도 글씨가 읽히도록 */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'radial-gradient(ellipse 52% 48% at 50% 50%, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.82) 42%, rgba(0,0,0,0.45) 68%, rgba(0,0,0,0) 88%)',
        }}
      />

      {/* 글씨 묶음 — 사진 위로 */}
      <div className="relative z-20 flex flex-col items-center gap-3 drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]">
        {/* 아이콘 */}
        <motion.div
          className={royal ? 'text-8xl' : 'text-7xl'}
          initial={{ scale: 0, rotate: royal ? -180 : 0 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: royal ? 10 : 20 }}
        >
          {royal ? '👑' : '🤨'}
        </motion.div>

        {/* 이름 — 최효은일 때만 크게 띄움 (아니면 대사가 이름을 직접 부름) */}
        {royal && (
          <motion.h2
            className="font-impact text-5xl font-bold sm:text-6xl"
            initial={{ scale: 0.3, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 13, delay: 0.2 }}
          >
            <span className="rainbow-text">{name}</span>
          </motion.h2>
        )}

        {/* 대사 한 줄씩 */}
        <div className="mt-3 flex flex-col items-center gap-2">
          {lines.slice(0, shown).map((line, i) => (
            <motion.p
              key={i}
              className={[
                line.big ? 'text-5xl font-bold sm:text-6xl' : 'text-3xl',
                line.rainbow ? 'rainbow-text' : royal ? 'text-amber-100' : 'text-white/80',
              ].join(' ')}
              initial={{ opacity: 0, y: 16, scale: royal ? 0.7 : 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            >
              {fillName(line.text, name)}
            </motion.p>
          ))}
        </div>

        {/* 마지막 버튼 — 최효은은 입장, 아니면 쫓겨남 */}
        <AnimatePresence>
          {done && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.4 }}
            >
              {royal ? (
                <Button variant="gold" onClick={onFinish}>
                  입 장 하 기
                </Button>
              ) : (
                <Button variant="ghost" onClick={onBack}>
                  냅다 꺼지기
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* =========================================================
   가장자리에 흩뿌려지는 사진들
   ========================================================= */
function ScatteredImages({ images, revealed }: { images: string[]; revealed: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {images.slice(0, revealed).map((src, i) => {
          const spot = SPOTS[i % SPOTS.length]
          const centered = 'center' in spot && spot.center

          return (
            <motion.img
              key={src}
              src={encodeURI(src)}
              alt=""
              // 테두리·둥근모서리·필터 없이 원본 그대로, 화면을 꽉 채울 만큼 크게
              className="absolute w-[58vw] max-w-[760px] min-w-[280px]"
              style={{
                top: 'top' in spot ? spot.top : undefined,
                bottom: 'bottom' in spot ? spot.bottom : undefined,
                left: 'left' in spot ? spot.left : undefined,
                right: 'right' in spot ? spot.right : undefined,
                ...(centered ? { x: '-50%', y: '-50%' } : null),
              }}
              initial={{ opacity: 0, scale: 0.5, rotate: spot.rot - 12 }}
              animate={{ opacity: 1, scale: 1, rotate: spot.rot }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{
                opacity: { duration: 0.3 },
                scale: { type: 'spring', stiffness: 260, damping: 18 },
                rotate: { type: 'spring', stiffness: 260, damping: 18 },
              }}
            />
          )
        })}
      </AnimatePresence>
    </div>
  )
}

/* ---------------------------------------------------------
   글자 하나씩 튀어나오는 텍스트
   --------------------------------------------------------- */
function PopIn({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={className}>
      {[...text].map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: -60, scale: 0.3, rotate: -30 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 12, delay: i * 0.12 }}
        >
          {ch}
        </motion.span>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------
   배경에 둥둥 떠다니는 장식
   --------------------------------------------------------- */
const DECO = ['👑', '✨', '💖', '🌸', '⭐', '💎', '🎀', '🫧']

function FloatingDeco() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {DECO.map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-3xl opacity-40"
          style={{ left: `${8 + i * 11}%`, top: `${(i % 4) * 24 + 6}%` }}
          animate={{
            y: [0, -28, 0],
            rotate: [0, 14, -14, 0],
            opacity: [0.25, 0.55, 0.25],
          }}
          transition={{
            duration: 4 + i * 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.35,
          }}
        >
          {emoji}
        </motion.span>
      ))}
    </div>
  )
}
