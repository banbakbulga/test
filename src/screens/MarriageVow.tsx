import { motion } from 'motion/react'
import { useGame } from '../game/store'
import { BUTLER, PRINCESS } from '../game/config'
import { Button } from '../ui/Button'
import { ButlerSign, Seal, SignedMark } from '../ui/ContractSigns'

/* =========================================================
   결혼 서약서
   데이트 계약서 뒤에 처음부터 숨어 있던 종이.
   공주님 서명은 아까 그린 그것이 그대로 붙어 있음.

   조항 고칠 곳 = VOWS
   ========================================================= */

const VOWS: { head: string; body: string[] }[] = [
  {
    head: '제1조 (혼인)',
    body: [
      '을은 갑과 혼인한다. 을의 의사는 앞장의 서명으로 이미 확인되었으므로 재차 묻지 아니한다.',
    ],
  },
  {
    head: '제2조 (호칭)',
    body: [
      '① 을은 갑을 "여보"라 부른다. "집사"라는 호칭은 신혼여행 종료와 동시에 소멸한다.',
      '② 갑은 을을 계속 "공주님"이라 부른다. 이것만은 갑이 양보하지 않는다.',
    ],
  },
  {
    head: '제3조 (가사)',
    body: [
      '설거지·빨래·분리수거·벌레 처리는 전부 갑이 한다.',
      '을은 소파에 앉아 그것을 지켜보는 것으로 가사에 참여한 것으로 본다.',
    ],
  },
  {
    head: '제4조 (분쟁)',
    body: [
      '부부싸움의 승자는 항상 을이다. 갑의 승률은 0%로 고정하며, 이의 조정은 불가능하다.',
    ],
  },
  {
    head: '제5조 (철회)',
    body: [
      '철회 조항은 데이트 계약서 뒷면에 기재되어 있었다.',
      '그러나 을은 뒷면을 확인하지 아니하였다. 따라서 철회권은 소멸하였다.',
    ],
  },
  {
    head: '제6조 (효력)',
    body: ['본 서약은 이미 발효되었다. 축하합니다, 사모님.'],
  },
]

export function MarriageVow({ signature, onYes }: { signature: string; onYes: () => void }) {
  const princess = useGame((s) => s.princess)

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-3xl bg-gradient-to-b
                 from-rose-50 to-amber-100 text-royal-900 shadow-[0_24px_70px_rgba(0,0,0,0.7)]
                 ring-4 ring-rose-400"
    >
      {/* 머리말 */}
      <div className="border-b-4 border-double border-rose-500/60 px-6 pt-6 pb-4 text-center">
        <p className="mb-2 text-sm text-rose-700 sm:text-base">
          ※ 본 서약서는 데이트 계약서 제6조에 따라 자동으로 발효되었습니다
        </p>
        <h2 className="font-impact text-3xl font-bold tracking-[0.3em] text-rose-700 sm:text-4xl">
          결혼 서약서
        </h2>
      </div>

      {/* 본문 */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 text-left leading-relaxed break-keep">
        <p className="mb-4 text-base sm:text-lg">
          갑 <b className="text-rose-700">{BUTLER}</b> 와 을{' '}
          <b className="text-rose-700">{princess || PRINCESS}</b> 는 아래와 같이 혼인을 서약한다.
          을은 본 서약서를 읽지 않았으나, 그것은 을의 사정이다.
        </p>

        {VOWS.map((v) => (
          <div key={v.head} className="mb-4">
            <div className="font-bold text-rose-700">{v.head}</div>
            {v.body.map((line, i) => (
              <p key={i} className="text-[15px] sm:text-base">
                {line}
              </p>
            ))}
          </div>
        ))}

        <p className="mb-5 text-center text-sm text-rose-700/80">
          — 부칙: 갑은 이 종이를 3년 전부터 들고 다녔음 —
        </p>

        {/* 서명란 — 아까 그 서명이 그대로 */}
        <div className="grid gap-4 border-t-2 border-dashed border-rose-500/50 pt-5 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-sm font-bold">갑 (신랑) {BUTLER}</div>
            {/* 이제 help 는 없다. 원하던 걸 얻었으므로 */}
            <ButlerSign />
          </div>

          <div>
            <div className="mb-1 text-sm font-bold">을 (신부) {princess || PRINCESS}</div>
            <div className="relative">
              <SignedMark src={signature} />
              <Seal top="혼인" bottom="성립" />
            </div>
            <p className="mt-1 text-xs text-rose-700">
              ↑ 아까 공주님이 직접 그으신 그 서명입니다
            </p>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div
        className="flex flex-wrap items-center justify-center gap-3 border-t-2 border-rose-500/40
                   bg-rose-100/80 px-6 py-4"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.8 }}
        >
          <Button onClick={onYes}>...네</Button>
        </motion.div>
      </div>
    </div>
  )
}
