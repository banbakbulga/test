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
  window.removeEventListener('pointerdown', pendingUnlock)
  window.removeEventListener('keydown', pendingUnlock)
  window.removeEventListener('touchstart', pendingUnlock)
  pendingUnlock = null
}

/** 배경음악 재생. 자동재생이 막히면 첫 조작 때 시작됨. */
export function playBgm(src: string, volume = 0.45) {
  stopBgm(0)

  el = new Audio(encodeURI(src))
  el.loop = true
  el.volume = volume

  const tryPlay = () => el?.play()

  void tryPlay()?.catch(() => {
    // 자동재생 차단됨 → 첫 조작 때 재시도
    const unlock = () => {
      removeUnlock()
      void el?.play().catch(() => {})
    }
    pendingUnlock = unlock
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    window.addEventListener('touchstart', unlock, { once: true })
  })
}

/* ---------------------------------------------------------
   일회성 효과음 (mp3 파일)
   --------------------------------------------------------- */
export function playSound(src: string, volume = 0.8) {
  const a = new Audio(encodeURI(src))
  a.volume = volume
  void a.play().catch(() => {
    // 자동재생이 막히면 조용히 넘어감 (게임 진행에는 지장 없음)
  })
  return a
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
