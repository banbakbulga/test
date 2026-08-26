/* =========================================================
   효과음 — 파일 없이 WebAudio 로 생성
   병맛 게임은 소리가 반이라서 넣어둠. 끄려면 setMuted(true).
   ========================================================= */

let ctx: AudioContext | null = null
let muted = false

export function setMuted(v: boolean) {
  muted = v
}
export function isMuted() {
  return muted
}

function audio(): AudioContext | null {
  if (muted) return null
  if (!ctx) {
    try {
      ctx = new AudioContext()
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.06) {
  const c = audio()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(vol, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start()
  osc.stop(c.currentTime + dur)
}

function slide(from: number, to: number, dur: number, type: OscillatorType = 'square') {
  const c = audio()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(from, c.currentTime)
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), c.currentTime + dur)
  gain.gain.setValueAtTime(0.07, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start()
  osc.stop(c.currentTime + dur)
}

function seq(steps: Array<[freq: number, at: number, dur?: number]>, type: OscillatorType = 'square') {
  steps.forEach(([f, at, d]) => setTimeout(() => tone(f, d ?? 0.14, type, 0.07), at))
}

export const sfx = {
  /** 타이핑 삑 */
  blip: () => tone(880, 0.028, 'square', 0.022),
  click: () => tone(1200, 0.05),
  hover: () => tone(1500, 0.03, 'sine', 0.03),

  ok: () => seq([[700, 0], [1050, 70]]),
  bad: () => seq([[300, 0, 0.12], [190, 90, 0.2]]),
  ding: () => { tone(1400, 0.08, 'sine', 0.09); setTimeout(() => tone(2100, 0.22, 'sine', 0.07), 80) },

  /** 팡파레 — 왕실 등극용 */
  fanfare: () => seq([[523, 0], [659, 110], [784, 220], [1046, 330, 0.5]], 'square'),
  /** 킹받는 상승음 */
  kingbat: () => seq([[400, 0, 0.08], [560, 70, 0.08], [720, 140, 0.08], [880, 210, 0.08], [1040, 280, 0.14]]),

  boom: () => slide(220, 40, 0.35, 'sawtooth'),
  swoosh: () => slide(1600, 200, 0.22, 'sine'),
  error: () => slide(400, 120, 0.3, 'sawtooth'),
}
