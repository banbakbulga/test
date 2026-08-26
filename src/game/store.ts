import { create } from 'zustand'

/* =========================================================
   게임 상태
   ========================================================= */

export type Screen = 'nameInput' | 'giftPick'

interface GameState {
  screen: Screen
  princess: string          // 입력받은 존함
  gift: number | null       // 고른 선물 (0~4)

  enterGame: (name: string) => void
  pickGift: (i: number) => void
  clearGift: () => void
  backToInput: () => void
}

export const useGame = create<GameState>((set) => ({
  screen: 'nameInput',
  princess: '',
  gift: null,

  enterGame: (princess) => set({ princess, screen: 'giftPick' }),
  pickGift: (gift) => set({ gift }),
  clearGift: () => set({ gift: null }),
  backToInput: () => set({ princess: '', gift: null, screen: 'nameInput' }),
}))
