'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { useSceneStore } from '@/lib/store/useSceneStore'
import { usePresenceStore } from '@/lib/store/usePresenceStore'
import Scene3D from '@/components/Scene3D'
import PlayerList from '@/components/PlayerList'
import Toolbar from '@/components/Toolbar'
import SaveLoadPanel from '@/components/SaveLoadPanel'
import { generateUserColor } from '@/lib/utils/color'
import { convertDatabaseToStore } from '@/lib/utils/sceneConverter'
import { PresenceData } from '@/types'
import { ToastContainer } from '@/components/Toast'
import { useToast } from '@/hooks/useToast'

export default function BuilderPage() {
  const user = useAuthStore((state) => state.user)
  const { setObjects, clearScene } = useSceneStore()
  const { addUser, removeUser } = usePresenceStore()
  const { toasts, showError, removeToast } = useToast()

  // Memoize user name and color to prevent unnecessary recalculations
  const userName = useMemo(() => {
    if (!user) return ''
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  }, [user])

  const userColor = useMemo(() => {
    if (!user) return '#3b82f6'
    return generateUserColor(user.id)
  }, [user])

  // Helper function to add presence user (extracted to avoid duplication)
  const addPresenceUser = useCallback(
    (presence: PresenceData) => {
      if (presence.userId) {
        addUser({
          id: presence.id || presence.userId,
          userId: presence.userId,
          userName: presence.userName || 'User',
          color: presence.color || '#3b82f6',
          position: presence.position || [0, 0, 0],
          lastSeen: new Date().toISOString(),
        })
      }
    },
    [addUser]
  )

  const loadScene = useCallback(async () => {
    const { data, error } = await supabase.from('scene_objects').select('*').order('created_at')
    if (error) {
      showError('Failed to load scene: ' + error.message)
      return
    }
    if (data) {
      // Convert snake_case to camelCase for the store
      const convertedObjects = data.map((obj) => convertDatabaseToStore(obj as import('@/types').DatabaseSceneObject))
      setObjects(convertedObjects)
    }
  }, [setObjects, showError])

  useEffect(() => {
    if (!user) return

    // Set up presence
    const channel = supabase.channel('presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.values(state).flat() as PresenceData[]
        users.forEach((presence) => {
          addPresenceUser(presence)
        })
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        newPresences.forEach((presence: PresenceData) => {
          addPresenceUser(presence)
        })
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach((presence: PresenceData) => {
          if (presence.userId) {
            removeUser(presence.userId)
          }
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: user.id,
            userId: user.id,
            userName: userName,
            color: userColor,
            position: [0, 0, 0],
            online_at: new Date().toISOString(),
          })
        }
      })

    // Set up scene sync
    const sceneChannel = supabase
      .channel('scene-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scene_objects',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newObj = payload.new as unknown as import('@/types').DatabaseSceneObject
            const convertedObj = convertDatabaseToStore(newObj)
            setObjects([...useSceneStore.getState().objects, convertedObj])
          } else if (payload.eventType === 'UPDATE') {
            const updatedObj = payload.new as unknown as import('@/types').DatabaseSceneObject
            const convertedObj = convertDatabaseToStore(updatedObj)
            const objects = useSceneStore.getState().objects
            const updated = objects.map((obj) =>
              obj.id === convertedObj.id ? convertedObj : obj
            )
            setObjects(updated)
          } else if (payload.eventType === 'DELETE') {
            const objects = useSceneStore.getState().objects
            const filtered = objects.filter((obj) => obj.id !== (payload.old as { id: string }).id)
            setObjects(filtered)
          }
        }
      )
      .subscribe()

    // Load initial scene
    loadScene()

    return () => {
      channel.unsubscribe()
      sceneChannel.unsubscribe()
      supabase.removeChannel(channel)
      supabase.removeChannel(sceneChannel)
    }
  }, [user, userName, userColor, addPresenceUser, removeUser, setObjects, loadScene])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    clearScene()
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return null

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 overflow-hidden">
      {/* Header */}
      <header className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 md:gap-4">
          <h1 className="text-lg md:text-xl font-bold text-white">3D Builder</h1>
          <div className="hidden sm:flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: userColor }}
            ></div>
            <span className="text-gray-300 text-sm">{userName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <button
            onClick={handleSignOut}
            className="px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs md:text-sm transition-colors"
            aria-label="Sign out"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* 3D Scene */}
        <div className="flex-1 relative">
          <Scene3D userColor={userColor} userName={userName} />
        </div>

        {/* Sidebar - Mobile: Overlay, Desktop: Fixed */}
        <div
          className={`${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
          } fixed md:relative top-0 right-0 h-full w-80 bg-gray-800/95 md:bg-gray-800/90 backdrop-blur-sm border-l border-gray-700 flex flex-col z-20 transition-transform duration-300`}
        >
          <Toolbar userColor={userColor} />
          <div className="flex-1 overflow-y-auto">
            <PlayerList />
            <SaveLoadPanel />
          </div>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-10"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

