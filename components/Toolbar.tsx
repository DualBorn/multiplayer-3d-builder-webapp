'use client'

import { useState, useCallback, memo } from 'react'
import { useSceneStore } from '@/lib/store/useSceneStore'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { useToast } from '@/hooks/useToast'

interface ToolbarProps {
  userColor: string
}

function Toolbar({ userColor }: ToolbarProps) {
  const [objectType, setObjectType] = useState<'cube' | 'sphere'>('cube')
  const { addObject } = useSceneStore()
  const user = useAuthStore((state) => state.user)
  const { showError } = useToast()

  const handleAddObject = useCallback(async () => {
    if (!user) return

    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    
    // Create object with database field names (snake_case)
    const newObject = {
      id: crypto.randomUUID(),
      type: objectType,
      position: [
        (Math.random() - 0.5) * 5,
        1,
        (Math.random() - 0.5) * 5,
      ] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
      color: userColor,
      user_id: user.id,  // snake_case for database
      user_name: userName,  // snake_case for database
      created_at: new Date().toISOString(),
    }

    // Insert into Supabase
    const { data, error } = await supabase.from('scene_objects').insert([newObject]).select()

    if (error) {
      console.error('Error adding object:', error)
      showError('Error adding object: ' + error.message)
      return
    }

    if (data && data[0]) {
      // Convert back to camelCase for the store
      const storeObject = {
        id: data[0].id,
        type: data[0].type,
        position: data[0].position,
        rotation: data[0].rotation,
        scale: data[0].scale,
        color: data[0].color,
        userId: data[0].user_id,
        userName: data[0].user_name,
        createdAt: data[0].created_at,
      }
      addObject(storeObject)
    }
  }, [user, objectType, userColor, addObject, showError])

  return (
    <div className="p-4 border-b border-gray-700">
      <h2 className="text-lg font-semibold text-white mb-4">Tools</h2>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Object Type</label>
          <div className="flex gap-2">
            <button
              onClick={() => setObjectType('cube')}
              className={`flex-1 py-2 px-3 rounded-lg transition-colors ${
                objectType === 'cube'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              aria-label="Select cube"
              aria-pressed={objectType === 'cube'}
            >
              Cube
            </button>
            <button
              onClick={() => setObjectType('sphere')}
              className={`flex-1 py-2 px-3 rounded-lg transition-colors ${
                objectType === 'sphere'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              aria-label="Select sphere"
              aria-pressed={objectType === 'sphere'}
            >
              Sphere
            </button>
          </div>
        </div>

        <button
          onClick={handleAddObject}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          aria-label={`Add ${objectType}`}
        >
          Add {objectType === 'cube' ? 'Cube' : 'Sphere'}
        </button>

        <div className="pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-2">Controls:</p>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Click: Select object</li>
            <li>• Double-click: Delete</li>
            <li>• Drag: Move object</li>
            <li>• Mouse: Rotate camera</li>
            <li>• Scroll: Zoom</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default memo(Toolbar)

