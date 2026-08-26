import { asset } from '../asset'

/* =========================================================
   배경음악

   주의: 브라우저는 사용자가 화면을 한 번이라도 건드리기 전에는
        소리 재생을 막습니다(자동재생 정책). 그래서 일단 재생을 시도하고,
        막히면 첫 터치/키입력 때 자동으로 시작하도록 예약해 둡니다.
   ========================================================= */

let el: HTMLAudioElement | null = null
let pendingUnlock: (() => void) | null = null

function removeUnlock() {
  if (!pendingUnlock) return
  // capture 로 걸었으니 뗄 때도 capture 로
  window.removeEventListener('pointerdown', pendingUnlock, true)
  window.removeEventListener('keydown', pendingUnlock, true)
  window.removeEventListener('touchstart', pendingUnlock, true)
  pendingUnlock = null
}

/** 배경음악 재생. 자동재생이 막히면 조작이 있을 때마다 될 때까지 다시 시도함. */
export function playBgm(src: string, volume = 0.45) {
  stopBgm(0)

  const target = new Audio(asset(src))
  target.loop = true
  target.volume = volume
  el = target

  const tryPlay = () => {
    if (el !== target) return // 그새 다른 곡으로 바뀜
    void target
      .play()
      .then(removeUnlock) // 소리가 나기 시작했으면 대기 해제
      .catch(() => {})
  }

  // 자동재생 차단에 대비해 대기부터 걸어둠.
  // capture:true — 중간에서 stopPropagation 해도 여기까지는 옴
  removeUnlock()
  pendingUnlock = tryPlay
  window.addEventListener('pointerdown', tryPlay, true)
  window.addEventListener('keydown', tryPlay, true)
  window.addEventListener('touchstart', tryPlay, true)

  tryPlay()
}

/* ---------------------------------------------------------
   일회성 효과음 (mp3 파일)
   --------------------------------------------------------- */
export function playSound(src: string, volume = 0.8) {
  const a = new Audio(asset(src))
  a.volume = volume
  void a.play().catch(() => {
    // 자동재생이 막히면 조용히 넘어감 (게임 진행에는 지장 없음)
  })
  return a
}

/**
 * 목록 순서대로 이어서 재생.
 * overlapMs 만큼 앞 소리가 끝나기 전에 다음 소리를 시작해서 살짝 겹치게 함.
 */
export function playSequence(
  srcs: string[],
  {
    volume = 0.8,
    overlapMs = 500,
    onStep,
  }: { volume?: number; overlapMs?: number; onStep?: (i: number) => void } = {},
) {
  let i = 0

  const next = () => {
    if (i >= srcs.length) return
    const at = i++
    const a = new Audio(asset(srcs[at]))
    a.volume = volume
    onStep?.(at) // 이 순서에 맞춰 다른 소리를 같이 깔고 싶을 때

    // 끝났을 때 / 파일이 없을 때 / 재생이 막혔을 때 — 어느 쪽이든 딱 한 번만 넘어감
    let moved = false
    const go = () => {
      if (moved) return
      moved = true
      next()
    }

    // 길이를 알아내면 끝나기 조금 전에 다음 소리를 미리 시작 (겹침)
    a.addEventListener(
      'playing',
      () => {
        const left = (a.duration - a.currentTime) * 1000 - overlapMs
        if (Number.isFinite(left)) setTimeout(go, Math.max(0, left))
      },
      { once: true },
    )
    a.addEventListener('ended', go, { once: true })
    a.addEventListener('error', go, { once: true })
    void a.play().catch(go)
  }

  next()
}

/** 반복 재생. 반환한 함수를 부르면 멈춤. (배경음악과 별개로 돎) */
export function playLoop(src: string, volume = 0.7) {
  const a = new Audio(asset(src))
  a.loop = true
  a.volume = volume
  void a.play().catch(() => {})

  return () => {
    a.pause()
    a.src = ''
  }
}

/** 서서히 줄이며 정지 */
export function stopBgm(fadeMs = 700) {
  removeUnlock()

  const target = el
  el = null
  if (!target) return

  if (fadeMs <= 0) {
    target.pause()
    target.src = ''
    return
  }

  const from = target.volume
  const started = performance.now()

  const step = () => {
    const t = (performance.now() - started) / fadeMs
    if (t >= 1) {
      target.pause()
      target.src = ''
      return
    }
    target.volume = from * (1 - t)
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
