import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { sfx } from '../fx/sfx'

/* =========================================================
   대사 — 「 」 안에 한 글자씩 찍힘
   ========================================================= */

interface Props {
  text: string
  /** 글자 하나당 ms. 클수록 느리게(= 무섭게) */
  speed?: number
  className?: string
}

export function Speech({ text, speed = 55, className = '' }: Props) {
  const [n, setN] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(t)
          return v
        }
        if (v % 2 === 0) sfx.blip()
        return v + 1
      })
    }, speed)
    return () => clearInterval(t)
  }, [text, speed])

  return (
    <motion.p
      className={`max-w-[900px] px-2 text-center leading-relaxed break-keep
                  drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] ${className}`}
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      「{text.slice(0, n)}
      <span className="opacity-70">{n < text.length ? '▌' : '」'}</span>
    </motion.p>
  )
}
