import { useEffect, useImperativeHandle, useRef } from 'react'
import type { Ref } from 'react'

/* =========================================================
   마우스(손가락)로 직접 긋는 서명판.
   - resetKey 값이 바뀌면 싹 지움
   - onInk 로 그은 획의 총 길이를 알려줌 (성의 판정용)
   - ref.snapshot() 으로 그려진 서명을 png 로 뽑을 수 있음
     (배경이 투명해서 다른 종이에 그대로 얹힘)
   ========================================================= */

export interface SignaturePadHandle {
  snapshot: () => string
}

interface Props {
  ref?: Ref<SignaturePadHandle>
  resetKey?: number
  onInk?: (len: number) => void
  /** 다 그린 뒤엔 false 로 잠금 */
  enabled?: boolean
  className?: string
}

export function SignaturePad({ ref, resetKey = 0, onInk, enabled = true, className = '' }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const ink = useRef(0)

  // 렌더 중에 ref 를 건드리지 않으려고 콜백은 이펙트로 갱신
  const cb = useRef(onInk)
  useEffect(() => {
    cb.current = onInk
  })

  useImperativeHandle(ref, () => ({
    snapshot: () => canvas.current?.toDataURL('image/png') ?? '',
  }))

  /* 캔버스 실제 해상도 = CSS 크기 × DPR. 안 맞추면 글씨가 뭉개짐 */
  useEffect(() => {
    const c = canvas.current
    if (!c) return

    const fit = () => {
      const r = c.getBoundingClientRect()
      if (!r.width || !r.height) return
      const dpr = window.devicePixelRatio || 1
      c.width = Math.round(r.width * dpr)
      c.height = Math.round(r.height * dpr)
      const ctx = c.getContext('2d')
      if (!ctx) return
      ctx.scale(dpr, dpr) // 이제부터 CSS 픽셀 좌표로 그리면 됨
      ctx.lineWidth = 3.2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#3b0764' // 먹색
    }

    fit()
    window.addEventListener('resize', fit) // 크기가 바뀌면 캔버스는 비워짐
    return () => window.removeEventListener('resize', fit)
  }, [])

  /* 지우기 */
  useEffect(() => {
    const c = canvas.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    ctx.clearRect(0, 0, c.width, c.height)
    ink.current = 0
    cb.current?.(0)
  }, [resetKey])

  const at = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  return (
    <canvas
      ref={canvas}
      className={`w-full touch-none ${enabled ? 'cursor-crosshair' : 'pointer-events-none'} ${className}`}
      onPointerDown={(e) => {
        if (!enabled) return
        e.preventDefault()
        canvas.current?.setPointerCapture(e.pointerId)
        drawing.current = true
        last.current = at(e)
      }}
      onPointerMove={(e) => {
        if (!drawing.current) return
        const ctx = canvas.current?.getContext('2d')
        if (!ctx) return
        const p = at(e)
        ctx.beginPath()
        ctx.moveTo(last.current.x, last.current.y)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()
        ink.current += Math.hypot(p.x - last.current.x, p.y - last.current.y)
        last.current = p
        cb.current?.(ink.current)
      }}
      onPointerUp={() => (drawing.current = false)}
      onPointerLeave={() => (drawing.current = false)}
    />
  )
}
