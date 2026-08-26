import { useEffect, useRef, useState } from 'react'
import { sfx } from '../fx/sfx'
import { playSound } from '../fx/bgm'

/* =========================================================
   마우스가 다가오면 반대쪽으로 도망다니는 요소.
   도망 선물 카드(GiftCard) / 일 시키기 버튼(DodgeButton) 이 같이 씀.

   반환한 offset 을 x/y 로 먹이고, jump 를 포인터 핸들러에 물리면 됨.
   ========================================================= */

export function useDodge<T extends HTMLElement>(enabled = true, sound?: string) {
  const ref = useRef<T>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const lastCry = useRef(0)

  /** 도망칠 때 내는 소리. mp3 는 기니까 더 뜸하게 — 안 그러면 겹쳐서 아수라장 */
  const cry = () => {
    const now = performance.now()
    const gap = sound ? 900 : 220
    if (now - lastCry.current < gap) return
    lastCry.current = now
    if (sound) playSound(sound)
    else sfx.swoosh()
  }

  /** 아무 데나 순간이동 (터치용 / 구석에 몰렸을 때용) */
  const jump = () => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const maxX = Math.max(8, window.innerWidth - r.width - 8)
    const maxY = Math.max(8, window.innerHeight - r.height - 8)
    // 난수는 updater 밖에서 — StrictMode 가 updater 를 두 번 돌려도 결과가 같도록
    const rx = 8 + Math.random() * (maxX - 8)
    const ry = 8 + Math.random() * (maxY - 8)
    setOffset((o) => ({
      x: Math.round(rx - (r.left - o.x)),
      y: Math.round(ry - (r.top - o.y)),
    }))
  }

  useEffect(() => {
    if (!enabled) return

    const onMove = (e: PointerEvent) => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2

      // 커서 → 요소 중심 벡터 = 도망칠 방향
      const dx = cx - e.clientX
      const dy = cy - e.clientY
      const dist = Math.hypot(dx, dy)

      const reach = Math.max(r.width, r.height) * 1.1 // 이 거리 안으로 들어오면 반응
      if (dist > reach) return

      const len = dist || 1
      const push = reach * 1.2
      let nx = cx + (dx / len) * push
      let ny = cy + (dy / len) * push

      // 화면 안에 붙잡아 두기
      const halfW = r.width / 2 + 8
      const halfH = r.height / 2 + 8
      nx = Math.min(window.innerWidth - halfW, Math.max(halfW, nx))
      ny = Math.min(window.innerHeight - halfH, Math.max(halfH, ny))

      // 구석에 몰려서 못 도망가면 반대편으로 순간이동
      if (Math.hypot(nx - e.clientX, ny - e.clientY) < reach * 0.75) {
        jump()
        return
      }

      cry()

      setOffset((o) => ({
        x: Math.round(o.x + (nx - cx)),
        y: Math.round(o.y + (ny - cy)),
      }))
    }

    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
    // jump 는 ref/setState 만 쓰므로 첫 렌더 클로저로 충분함
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  return { ref, offset, jump, cry }
}
