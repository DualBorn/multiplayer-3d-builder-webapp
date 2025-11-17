'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useSceneStore } from '@/lib/store/useSceneStore'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { SavedScene } from '@/types'
import { useToast } from '@/hooks/useToast'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export default function SaveLoadPanel() {
  const [sceneName, setSceneName] = useState('')
  const [savedScenes, setSavedScenes] = useState<SavedScene[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{ type: 'load' | 'delete'; scene: SavedScene } | null>(null)
  const { objects, setObjects } = useSceneStore()
  const user = useAuthStore((state) => state.user)
  const { showSuccess, showError } = useToast()

  const loadSavedScenes = useCallback(async () => {
    if (!user) {
      showError('You must be logged in to load scenes')
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('saved_scenes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      showError('Failed to load scenes: ' + error.message)
    } else if (data) {
      setSavedScenes(data as SavedScene[])
    }
    setLoading(false)
  }, [user, showError])

  const handleSave = useCallback(async () => {
    if (!sceneName.trim()) {
      showError('Please enter a scene name')
      return
    }

    if (!user) {
      showError('You must be logged in to save scenes')
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('saved_scenes')
      .insert([
        {
          name: sceneName,
          scene_data: objects,
          user_id: user.id,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      showError('Error saving scene: ' + error.message)
    } else if (data) {
      showSuccess('Scene saved successfully!')
      setSceneName('')
      loadSavedScenes()
    }
    setLoading(false)
  }, [sceneName, user, objects, showError, showSuccess, loadSavedScenes])

  const handleLoad = useCallback((scene: SavedScene) => {
    setConfirmDialog({ type: 'load', scene })
  }, [])

  const handleDelete = useCallback((scene: SavedScene) => {
    setConfirmDialog({ type: 'delete', scene })
  }, [])

  const confirmLoad = useCallback(async () => {
    if (!confirmDialog || confirmDialog.type !== 'load') return

    setLoading(true)
    const scene = confirmDialog.scene

    // Get all current scene objects and delete them properly
    const { data: currentObjects } = await supabase.from('scene_objects').select('id')
    if (currentObjects && currentObjects.length > 0) {
      const ids = currentObjects.map((obj) => obj.id)
      await supabase.from('scene_objects').delete().in('id', ids)
    }

    // Convert scene data to database format and insert
    if (scene.scene_data && Array.isArray(scene.scene_data)) {
      // Convert camelCase to snake_case for database
      const dbObjects = scene.scene_data.map((obj) => ({
        id: obj.id,
        type: obj.type,
        position: obj.position,
        rotation: obj.rotation,
        scale: obj.scale,
        color: obj.color,
        user_id: obj.userId,
        user_name: obj.userName,
        created_at: obj.createdAt,
      }))

      const { error } = await supabase.from('scene_objects').insert(dbObjects)
      if (error) {
        showError('Error loading scene: ' + error.message)
      } else {
        setObjects(scene.scene_data)
        showSuccess('Scene loaded successfully!')
      }
    }
    setConfirmDialog(null)
    setLoading(false)
  }, [confirmDialog, setObjects, showError, showSuccess])

  const confirmDelete = useCallback(async () => {
    if (!confirmDialog || confirmDialog.type !== 'delete') return

    setLoading(true)
    const { error } = await supabase.from('saved_scenes').delete().eq('id', confirmDialog.scene.id)
    if (error) {
      showError('Error deleting scene: ' + error.message)
    } else {
      showSuccess('Scene deleted successfully!')
      loadSavedScenes()
    }
    setConfirmDialog(null)
    setLoading(false)
  }, [confirmDialog, loadSavedScenes, showError, showSuccess])

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-white mb-3">Save & Load</h2>

      <div className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Scene name"
            value={sceneName}
            onChange={(e) => setSceneName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading || !sceneName.trim()}
          className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
        >
          Save Scene
        </button>

        <button
          onClick={loadSavedScenes}
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
        >
          Load Saved Scenes
        </button>

        {savedScenes.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-400">Saved Scenes:</p>
            {savedScenes.map((scene) => (
              <div
                key={scene.id}
                className="p-2 bg-gray-700 rounded-lg flex items-center justify-between"
              >
                <span className="text-gray-300 text-sm flex-1">{scene.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLoad(scene)}
                    disabled={loading}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-xs rounded transition-colors"
                    aria-label={`Load scene ${scene.name}`}
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleDelete(scene)}
                    disabled={loading}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-xs rounded transition-colors"
                    aria-label={`Delete scene ${scene.name}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {confirmDialog && (
        <ConfirmDialog
          message={
            confirmDialog.type === 'load'
              ? 'Load this scene? Current scene will be replaced.'
              : 'Delete this saved scene?'
          }
          onConfirm={confirmDialog.type === 'load' ? confirmLoad : confirmDelete}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  )
}

