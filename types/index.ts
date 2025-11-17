import { SceneObject } from '@/lib/store/useSceneStore'

export interface PresenceData {
  id: string
  userId: string
  userName: string
  color: string
  position: [number, number, number]
  online_at?: string
}

export interface SavedScene {
  id: string
  name: string
  scene_data: SceneObject[]
  user_id: string
  created_at: string
  updated_at: string
}

export interface DatabaseSceneObject {
  id: string
  type: 'cube' | 'sphere'
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color: string
  user_id: string
  user_name: string
  created_at: string
  updated_at?: string
}

