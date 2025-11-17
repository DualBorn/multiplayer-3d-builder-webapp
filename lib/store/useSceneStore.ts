import { create } from 'zustand'

export interface SceneObject {
  id: string
  type: 'cube' | 'sphere'
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color: string
  userId: string
  userName: string
  createdAt: string
}

interface SceneState {
  objects: SceneObject[]
  selectedObjectId: string | null
  isDragging: boolean
  addObject: (object: SceneObject) => void
  updateObject: (id: string, updates: Partial<SceneObject>) => void
  removeObject: (id: string) => void
  setObjects: (objects: SceneObject[]) => void
  setSelectedObject: (id: string | null) => void
  setDragging: (isDragging: boolean) => void
  clearScene: () => void
}

export const useSceneStore = create<SceneState>((set) => ({
  objects: [],
  selectedObjectId: null,
  isDragging: false,
  addObject: (object) => set((state) => ({ objects: [...state.objects, object] })),
  updateObject: (id, updates) =>
    set((state) => ({
      objects: state.objects.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj)),
    })),
  removeObject: (id) =>
    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
      selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
    })),
  setObjects: (objects) => set({ objects }),
  setSelectedObject: (id) => set({ selectedObjectId: id }),
  setDragging: (isDragging) => set({ isDragging }),
  clearScene: () => set({ objects: [], selectedObjectId: null, isDragging: false }),
}))

