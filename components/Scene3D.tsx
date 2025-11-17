'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, PerspectiveCamera, Grid } from '@react-three/drei'
import { Suspense, useRef, useEffect, useCallback, memo } from 'react'
import SceneObjects from './SceneObjects'
import UserAvatars from './UserAvatars'
import { useSceneStore } from '@/lib/store/useSceneStore'
import * as THREE from 'three'

interface Scene3DProps {
  userColor: string
  userName: string
}

interface OrbitControlsRef {
  mouseButtons: {
    LEFT: number
    MIDDLE: number
    RIGHT: number
  }
}

function Scene3D({ userColor, userName }: Scene3DProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const controlsRef = useRef<OrbitControlsRef>(null)
  const isDragging = useSceneStore((state) => state.isDragging)
  const { setSelectedObject } = useSceneStore()
  
  // Handle Shift + drag for panning (Figma-style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && controlsRef.current) {
        // Enable pan when Shift is pressed
        const controls = controlsRef.current
        if (controls) {
          controls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE,
          }
        }
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && controlsRef.current) {
        // Disable pan when Shift is released, back to rotate
        const controls = controlsRef.current
        if (controls) {
          controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <Canvas
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
      className="w-full h-full"
      onClick={useCallback((e: any) => {
        // Clear selection when clicking on empty space (not on an object)
        if (e.delta === 0 && !e.object) {
          setSelectedObject(null)
        }
      }, [setSelectedObject])}
    >
      <Suspense fallback={null}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        {/* Skybox */}
        <Sky
          distance={450000}
          sunPosition={[0, 1, 0]}
          inclination={0}
          azimuth={0.25}
        />

        {/* Grid */}
        <Grid
          renderOrder={-1}
          position={[0, -0.01, 0]}
          infiniteGrid
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#6f6f6f"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#9d4b4b"
          fadeDistance={30}
          fadeStrength={1}
        />

        {/* Camera */}
        <PerspectiveCamera
          ref={cameraRef}
          makeDefault
          position={[5, 5, 5]}
          fov={75}
        />

        {/* Controls - Disabled when dragging objects */}
        <OrbitControls
          ref={controlsRef}
          enablePan={!isDragging}
          enableZoom={!isDragging}
          enableRotate={!isDragging}
          minDistance={2}
          maxDistance={50}
          panSpeed={1}
          // Default: Left-click rotates, Shift + Left-click pans (Figma-style)
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE, // Left-click rotates
            MIDDLE: THREE.MOUSE.DOLLY, // Middle-click zooms
            RIGHT: THREE.MOUSE.PAN, // Right-click pans
          }}
        />

        {/* Scene Objects */}
        <SceneObjects userColor={userColor} userName={userName} />

        {/* User Avatars */}
        <UserAvatars currentUserColor={userColor} currentUserName={userName} />
      </Suspense>
    </Canvas>
  )
}

export default memo(Scene3D)

