import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  soundEnabled: boolean
  hapticsEnabled: boolean
  playerName: string
  avatar: string
  selectedPacks: string[]
  toggleSound: () => void
  toggleHaptics: () => void
  setProfile: (name: string, avatar: string) => void
  setSelectedPacks: (packs: string[]) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      hapticsEnabled: true,
      playerName: '',
      avatar: '🦊',
      selectedPacks: [],
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleHaptics: () => set((s) => ({ hapticsEnabled: !s.hapticsEnabled })),
      setProfile: (playerName, avatar) => set({ playerName, avatar }),
      setSelectedPacks: (selectedPacks) => set({ selectedPacks }),
    }),
    { name: 'smn-ui' },
  ),
)
