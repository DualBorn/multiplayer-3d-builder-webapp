import { create } from 'zustand'

export interface PresenceUser {
  id: string
  userId: string
  userName: string
  color: string
  position: [number, number, number]
  lastSeen: string
}

interface PresenceState {
  users: Map<string, PresenceUser>
  addUser: (user: PresenceUser) => void
  removeUser: (userId: string) => void
  updateUser: (userId: string, updates: Partial<PresenceUser>) => void
  getUsers: () => PresenceUser[]
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  users: new Map(),
  addUser: (user) =>
    set((state) => {
      const newUsers = new Map(state.users)
      newUsers.set(user.userId, user)
      return { users: newUsers }
    }),
  removeUser: (userId) =>
    set((state) => {
      const newUsers = new Map(state.users)
      newUsers.delete(userId)
      return { users: newUsers }
    }),
  updateUser: (userId, updates) =>
    set((state) => {
      const newUsers = new Map(state.users)
      const existing = newUsers.get(userId)
      if (existing) {
        newUsers.set(userId, { ...existing, ...updates })
      }
      return { users: newUsers }
    }),
  getUsers: () => Array.from(get().users.values()),
}))

