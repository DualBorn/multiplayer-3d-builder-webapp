import { SceneObject } from '@/lib/store/useSceneStore'
import { DatabaseSceneObject } from '@/types'

/**
 * Converts database object (snake_case) to store object (camelCase)
 */
export const convertDatabaseToStore = (dbObj: DatabaseSceneObject): SceneObject => {
  return {
    id: dbObj.id,
    type: dbObj.type,
    position: dbObj.position,
    rotation: dbObj.rotation,
    scale: dbObj.scale,
    color: dbObj.color,
    userId: dbObj.user_id,
    userName: dbObj.user_name,
    createdAt: dbObj.created_at,
  }
}

/**
 * Converts store object (camelCase) to database object (snake_case)
 */
export const convertStoreToDatabase = (storeObj: SceneObject): DatabaseSceneObject => {
  return {
    id: storeObj.id,
    type: storeObj.type,
    position: storeObj.position,
    rotation: storeObj.rotation,
    scale: storeObj.scale,
    color: storeObj.color,
    user_id: storeObj.userId,
    user_name: storeObj.userName,
    created_at: storeObj.createdAt,
  }
}

