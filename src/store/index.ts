import { create } from 'zustand'

interface RoomState {
  /** 昼夜状态 */
  isNight: boolean
  toggleNight: () => void
}

export const useRoomStore = create<RoomState>((set) => ({
  isNight: false,
  toggleNight: () => set((s) => ({ isNight: !s.isNight })),
}))
