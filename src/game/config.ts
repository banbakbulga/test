/* =========================================================
   게임 설정 — 사람 이름 같은 건 여기 모아둠
   ========================================================= */

/** 진짜 공주님. 계약서·서약서에 찍히는 정식 존함. */
export const PRINCESS = '최효은'

/**
 * 통과되는 존함들. 이 중 하나면 극진히 환대하고, 아니면 쫓아냄.
 * 여기에 한 줄 추가하면 그 이름도 통과됩니다.
 */
export const PRINCESS_ALIASES = [
  '최효은',
  '효은',
  '효으니',
  '효은공주',
  '최효은공주',
]

/** 공백 제거 후 비교 (띄어쓰기 해도 통과) */
export function isPrincess(name: string) {
  const cleaned = name.replace(/\s/g, '')
  return PRINCESS_ALIASES.includes(cleaned)
}

/** 무슨 선물을 고르든 결국 나오는 그 집사. */
export const BUTLER = '양준혁'
