'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useSceneStore } from '@/lib/store/useSceneStore'
import { useAuthStore } from '@/lib/store/useAuthStore'

export default function SaveLoadPanel() {
  const [sceneName, setSceneName] = useState('')
  const [savedScenes, setSavedScenes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { objects, setObjects, clearScene } = useSceneStore()
  const user = useAuthStore((state) => state.user)

  const loadSavedScenes = async () => {
    if (!user) {
      alert('You must be logged in to load scenes')
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('saved_scenes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!error && data) {
      setSavedScenes(data)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!sceneName.trim()) {
      alert('Please enter a scene name')
      return
    }

    if (!user) {
      alert('You must be logged in to save scenes')
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

    if (!error && data) {
      alert('Scene saved successfully!')
      setSceneName('')
      loadSavedScenes()
    } else {
      alert('Error saving scene: ' + (error?.message || 'Unknown error'))
    }
    setLoading(false)
  }

  const handleLoad = async (scene: any) => {
    if (!confirm('Load this scene? Current scene will be replaced.')) return

    setLoading(true)
    // Clear current scene objects from database
    await supabase.from('scene_objects').delete().neq('id', 'dummy')

    // Insert loaded objects
    if (scene.scene_data && Array.isArray(scene.scene_data)) {
      const { error } = await supabase.from('scene_objects').insert(scene.scene_data)
      if (!error) {
        setObjects(scene.scene_data)
        alert('Scene loaded successfully!')
      } else {
        alert('Error loading scene: ' + error.message)
      }
    }
    setLoading(false)
  }

  const handleDelete = async (sceneId: string) => {
    if (!confirm('Delete this saved scene?')) return

    setLoading(true)
    const { error } = await supabase.from('saved_scenes').delete().eq('id', sceneId)
    if (!error) {
      loadSavedScenes()
    }
    setLoading(false)
  }

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
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleDelete(scene.id)}
                    disabled={loading}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-xs rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

