'use client'

import { usePresenceStore } from '@/lib/store/usePresenceStore'
import { useAuthStore } from '@/lib/store/useAuthStore'

export default function PlayerList() {
  const users = usePresenceStore((state) => state.getUsers())
  const currentUser = useAuthStore((state) => state.user)

  return (
    <div className="p-4 border-b border-gray-700">
      <h2 className="text-lg font-semibold text-white mb-3">
        Players ({users.length})
      </h2>
      <div className="space-y-2">
        {users.length === 0 ? (
          <p className="text-gray-400 text-sm">No other players online</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center gap-2 p-2 rounded-lg ${
                user.userId === currentUser?.id
                  ? 'bg-blue-600/20 border border-blue-500/50'
                  : 'bg-gray-700/50'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: user.color }}
              ></div>
              <span className="text-gray-300 text-sm flex-1">{user.userName}</span>
              {user.userId === currentUser?.id && (
                <span className="text-xs text-blue-400">You</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

