import { motion } from 'motion/react'

/* =========================================================
   계약서에 들어가는 것들 — 집사 서명, 도장, 공주님 서명
   데이트 계약서 / 결혼 서약서가 같이 씀
   ========================================================= */

/** 집사 서명 = 하트 한 방. help 를 켜면 뒤에 아주 연하게 구조 요청이 비침 */
export function ButlerSign({ help = false }: { help?: boolean }) {
  return (
    <div className="relative h-28 overflow-hidden rounded-xl bg-white/60 ring-2 ring-amber-600/30">
      {help && (
        <span
          className="absolute inset-0 flex -rotate-3 items-center justify-center
                     font-impact text-5xl tracking-[0.35em] text-royal-900/5 italic select-none"
        >
          help
        </span>
      )}

      <svg className="absolute inset-0 h-full w-full -rotate-6" viewBox="0 0 200 100" fill="none">
        <path
          d="M100 80 C58 54, 60 22, 82 22 C93 22, 100 31, 100 38 C100 31, 107 22, 118 22
             C140 22, 142 54, 100 80 Z"
          stroke="#3b0764"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="#3b0764"
          fillOpacity="0.08"
        />
        {/* 서명 끝의 흘림 */}
        <path
          d="M34 84 C70 96, 132 94, 172 66"
          stroke="#3b0764"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

/** 도장 — 쾅 */
export function Seal({ top, bottom }: { top: string; bottom: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute -top-4 -right-3 flex h-24 w-24 items-center
                 justify-center rounded-full border-4 border-red-600 text-center font-impact
                 text-lg leading-tight font-bold text-red-600"
      initial={{ scale: 3.2, opacity: 0, rotate: -40 }}
      animate={{ scale: 1, opacity: 0.92, rotate: -14 }}
      transition={{ type: 'spring', stiffness: 700, damping: 16 }}
    >
      {top}
      <br />
      {bottom}
    </motion.div>
  )
}

/** 데이트 계약서에서 그린 서명을 그대로 옮겨 붙임 */
export function SignedMark({ src }: { src: string }) {
  return (
    <div className="relative h-28 overflow-hidden rounded-xl bg-white/70 ring-2 ring-amber-600/30">
      {src ? (
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-contain" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-sm text-royal-900/40">
          서명 없음
        </span>
      )}
    </div>
  )
}
