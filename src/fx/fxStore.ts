import { create } from 'zustand'
import confetti from 'canvas-confetti'
import type { FxName } from '../game/types'

/* =========================================================
   이펙트 상태
   - 파티클류(confetti/hearts/...)는 canvas-confetti 가 직접 그림
   - 화면 전체 효과(shake/glitch/...)는 여기 상태를 보고 CSS 클래스가 붙음
   ========================================================= */

/** 화면 전체에 거는 효과 — 동시에 여러 개 가능 */
type ScreenFx = 'shake' | 'bigshake' | 'glitch' | 'spin' | 'invert'

interface Flash {
  id: number
  color: string
  ms: number
}

interface FxState {
  screen: Set<ScreenFx>
  flashes: Flash[]
  zoomKey: number          // 값이 바뀌면 줌 펀치 재생

  play: (fx: FxName | FxName[]) => Promise<void>
  clear: () => void
  _removeFlash: (id: number) => void
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

let flashId = 0

export const useFx = create<FxState>((set, get) => ({
  screen: new Set(),
  flashes: [],
  zoomKey: 0,

  clear: () => set({ screen: new Set(), flashes: [] }),

  _removeFlash: (id) =>
    set((s) => ({ flashes: s.flashes.filter((f) => f.id !== id) })),

  play: async (fx) => {
    const list = Array.isArray(fx) ? fx : [fx]
    await Promise.all(list.map((name) => runOne(name, set, get)))
  },
}))

/* ---------------------------------------------------------
   화면 전체 효과 on/off 헬퍼
   --------------------------------------------------------- */
async function withScreenFx(
  name: ScreenFx,
  ms: number,
  set: (fn: (s: FxState) => Partial<FxState>) => void,
) {
  set((s) => ({ screen: new Set(s.screen).add(name) }))
  await sleep(ms)
  set((s) => {
    const next = new Set(s.screen)
    next.delete(name)
    return { screen: next }
  })
}

function flash(color: string, ms: number, set: (fn: (s: FxState) => Partial<FxState>) => void) {
  const id = ++flashId
  set((s) => ({ flashes: [...s.flashes, { id, color, ms }] }))
  setTimeout(() => useFx.getState()._removeFlash(id), ms + 60)
  return sleep(ms)
}

/* ---------------------------------------------------------
   파티클 — canvas-confetti
   --------------------------------------------------------- */
const heartShape = confetti.shapeFromText({ text: '💖', scalar: 3 })
const crownShape = confetti.shapeFromText({ text: '👑', scalar: 3 })
const sparkShape = confetti.shapeFromText({ text: '✨', scalar: 2.5 })

function burst(opts: confetti.Options) {
  void confetti({ disableForReducedMotion: false, ...opts })
}

function fireworks(durationMs: number) {
  const end = Date.now() + durationMs
  const tick = () => {
    burst({ particleCount: 40, spread: 360, startVelocity: 28, ticks: 60,
            origin: { x: Math.random(), y: Math.random() * 0.6 } })
    if (Date.now() < end) setTimeout(tick, 220)
  }
  tick()
  return sleep(durationMs)
}

/* ---------------------------------------------------------
   이름 → 실제 동작
   --------------------------------------------------------- */
function runOne(
  name: FxName,
  set: (fn: (s: FxState) => Partial<FxState>) => void,
  get: () => FxState,
): Promise<void> {
  switch (name) {
    case 'confetti':
      burst({ particleCount: 160, spread: 90, origin: { y: 0.65 } })
      return sleep(400)

    case 'fireworks':
      return fireworks(2200)

    case 'hearts':
      burst({ particleCount: 28, spread: 70, scalar: 2.4, shapes: [heartShape],
              origin: { y: 0.7 }, startVelocity: 34 })
      return sleep(400)

    case 'lovebomb':
      burst({ particleCount: 90, spread: 160, scalar: 3, shapes: [heartShape],
              origin: { y: 0.6 }, startVelocity: 45, ticks: 200 })
      return sleep(700)

    case 'sparkle':
      burst({ particleCount: 50, spread: 120, scalar: 2, shapes: [sparkShape],
              origin: { y: 0.5 }, startVelocity: 22, gravity: 0.4 })
      return sleep(400)

    case 'crowns':
      burst({ particleCount: 40, spread: 180, scalar: 3, shapes: [crownShape],
              origin: { y: 0.3 }, startVelocity: 18, gravity: 0.7, ticks: 220 })
      return sleep(700)

    case 'shake':    return withScreenFx('shake',   450, set)
    case 'bigshake': return withScreenFx('bigshake', 900, set)
    case 'glitch':   return withScreenFx('glitch',   600, set)
    case 'spin':     return withScreenFx('spin',    1000, set)
    case 'invert':   return withScreenFx('invert',   500, set)

    case 'flash':    return flash('#ffffff', 320, set)
    case 'redflash': return flash('#ff2d55', 380, set)

    case 'zoom':
      set(() => ({ zoomKey: get().zoomKey + 1 }))
      return sleep(420)
  }
}
