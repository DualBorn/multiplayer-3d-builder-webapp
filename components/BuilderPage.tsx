'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { useSceneStore } from '@/lib/store/useSceneStore'
import { usePresenceStore } from '@/lib/store/usePresenceStore'
import Scene3D from '@/components/Scene3D'
import PlayerList from '@/components/PlayerList'
import Toolbar from '@/components/Toolbar'
import SaveLoadPanel from '@/components/SaveLoadPanel'

export default function BuilderPage() {
  const user = useAuthStore((state) => state.user)
  const [userName, setUserName] = useState('')
  const [userColor, setUserColor] = useState('#3b82f6')
  const { setObjects, clearScene } = useSceneStore()
  const { addUser, removeUser, updateUser } = usePresenceStore()

  useEffect(() => {
    if (!user) return

    // Get or set user name
    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    setUserName(name)

    // Generate a unique color for this user
    const colors = [
      '#3b82f6', // blue
      '#ef4444', // red
      '#10b981', // green
      '#f59e0b', // amber
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#84cc16', // lime
    ]
    const colorIndex = (user.id.charCodeAt(0) + user.id.charCodeAt(1)) % colors.length
    setUserColor(colors[colorIndex])

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
        const users = Object.values(state).flat() as any[]
        users.forEach((presence: any) => {
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
        })
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        newPresences.forEach((presence: any) => {
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
        })
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        leftPresences.forEach((presence: any) => {
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
            userName: name,
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
            const newObj = payload.new as any
            const convertedObj = {
              id: newObj.id,
              type: newObj.type,
              position: newObj.position,
              rotation: newObj.rotation,
              scale: newObj.scale,
              color: newObj.color,
              userId: newObj.user_id,
              userName: newObj.user_name,
              createdAt: newObj.created_at,
            }
            setObjects([...useSceneStore.getState().objects, convertedObj])
          } else if (payload.eventType === 'UPDATE') {
            const updatedObj = payload.new as any
            const convertedObj = {
              id: updatedObj.id,
              type: updatedObj.type,
              position: updatedObj.position,
              rotation: updatedObj.rotation,
              scale: updatedObj.scale,
              color: updatedObj.color,
              userId: updatedObj.user_id,
              userName: updatedObj.user_name,
              createdAt: updatedObj.created_at,
            }
            const objects = useSceneStore.getState().objects
            const updated = objects.map((obj) =>
              obj.id === convertedObj.id ? convertedObj : obj
            )
            setObjects(updated)
          } else if (payload.eventType === 'DELETE') {
            const objects = useSceneStore.getState().objects
            const filtered = objects.filter((obj) => obj.id !== payload.old.id)
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
  }, [user, userColor])

  const loadScene = async () => {
    const { data, error } = await supabase.from('scene_objects').select('*').order('created_at')
    if (!error && data) {
      // Convert snake_case to camelCase for the store
      const convertedObjects = data.map((obj: any) => ({
        id: obj.id,
        type: obj.type,
        position: obj.position,
        rotation: obj.rotation,
        scale: obj.scale,
        color: obj.color,
        userId: obj.user_id,
        userName: obj.user_name,
        createdAt: obj.created_at,
      }))
      setObjects(convertedObjects)
    }
  }

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
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <button
            onClick={handleSignOut}
            className="px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs md:text-sm transition-colors"
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
    </div>
  )
}

