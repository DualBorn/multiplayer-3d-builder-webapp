'use client'

import { useFrame } from '@react-three/fiber'
import { Sphere, Text } from '@react-three/drei'
import { useRef } from 'react'
import { usePresenceStore } from '@/lib/store/usePresenceStore'
import * as THREE from 'three'

interface UserAvatarsProps {
  currentUserColor: string
  currentUserName: string
}

export default function UserAvatars({ currentUserColor, currentUserName }: UserAvatarsProps) {
  const users = usePresenceStore((state) => state.getUsers())

  return (
    <>
      {users.map((user) => (
        <UserAvatar key={user.id} user={user} />
      ))}
    </>
  )
}

function UserAvatar({ user }: { user: any }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      const floatOffset = Math.sin(state.clock.elapsedTime + user.id.charCodeAt(0)) * 0.2
      meshRef.current.position.y = user.position[1] + floatOffset + 1

      // Gentle rotation
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <group position={user.position}>
      <Sphere ref={meshRef} args={[0.3, 16, 16]}>
        <meshStandardMaterial
          color={user.color}
          emissive={user.color}
          emissiveIntensity={0.3}
          metalness={0.5}
          roughness={0.3}
        />
      </Sphere>
      <Text
        position={[0, 1, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {user.userName}
      </Text>
    </group>
  )
}

