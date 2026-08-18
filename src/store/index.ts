import { create } from 'zustand'

export interface InfoPayload {
  key: string
  title: string
  text: string
}

interface RoomState {
  /** 昼夜状态 */
  isNight: boolean
  toggleNight: () => void
  /** 顶部信息条当前展示的内容 */
  info: InfoPayload | null
  showInfo: (payload: InfoPayload) => void
  clearInfo: () => void
}

export const useRoomStore = create<RoomState>((set) => ({
  isNight: false,
  toggleNight: () => set((s) => ({ isNight: !s.isNight })),
  info: null,
  showInfo: (info) => set({ info }),
  clearInfo: () => set({ info: null }),
}))
