'use client'

import { useRef, useState, useEffect, useCallback, memo } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import { Box, Sphere, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneStore, SceneObject } from '@/lib/store/useSceneStore'
import { supabase } from '@/lib/supabase/client'
import { ConfirmDialog } from '@/components/ConfirmDialog'

interface SceneObjectsProps {
  userColor: string
  userName: string
}

function SceneObjects({ userColor, userName }: SceneObjectsProps) {
  const { objects, selectedObjectId, setSelectedObject, removeObject, setDragging: setGlobalDragging } = useSceneStore()
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<THREE.Vector3 | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ obj: SceneObject } | null>(null)

  const handleObjectClick = useCallback((e: ThreeEvent<MouseEvent>, obj: SceneObject) => {
    e.stopPropagation()
    // Always allow selection on click
    setSelectedObject(obj.id)
  }, [setSelectedObject])

  const handleObjectDoubleClick = useCallback((e: ThreeEvent<MouseEvent>, obj: SceneObject) => {
    e.stopPropagation()
    setDeleteConfirm({ obj })
  }, [])

  const handleDragStart = (e: ThreeEvent<PointerEvent>, obj: SceneObject) => {
    e.stopPropagation()
    // Don't prevent click - just prepare for potential drag
    const intersection = e.intersections[0]
    if (intersection) {
      const worldPos = new THREE.Vector3().copy(intersection.point)
      const objPos = new THREE.Vector3(...obj.position)
      setDragOffset(worldPos.sub(objPos))
    }
  }

  const handleDragEnd = useCallback(async () => {
    if (dragging) {
      const obj = objects.find((o) => o.id === dragging)
      if (obj) {
        const { error } = await supabase
          .from('scene_objects')
          .update({ position: obj.position })
          .eq('id', obj.id)
        if (error) {
          console.error('Error updating object:', error)
        }
      }
    }
    setDragging(null)
    setDragOffset(null)
    setGlobalDragging(false) // Re-enable camera controls
  }, [dragging, objects, setGlobalDragging])

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirm) return
    const { obj } = deleteConfirm
    await supabase.from('scene_objects').delete().eq('id', obj.id)
    removeObject(obj.id)
    // Clear selection after deletion
    if (selectedObjectId === obj.id) {
      setSelectedObject(null)
    }
    setDeleteConfirm(null)
  }, [deleteConfirm, removeObject, selectedObjectId, setSelectedObject])

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirm(null)
  }, [])

  return (
    <>
      {objects.map((obj) => (
        <Object3D
          key={obj.id}
          obj={obj}
          isSelected={selectedObjectId === obj.id}
          isDragging={dragging === obj.id}
          onClick={(e) => handleObjectClick(e, obj)}
          onDoubleClick={(e) => handleObjectDoubleClick(e, obj)}
          onPointerDown={(e) => handleDragStart(e, obj)}
          onPointerUp={handleDragEnd}
          onStartDrag={(id) => {
            setDragging(id)
            setGlobalDragging(true)
          }}
          dragOffset={dragOffset}
          userColor={userColor}
        />
      ))}
      {deleteConfirm && (
        <ConfirmDialog
          message="Delete this object?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  )
}

interface Object3DProps {
  obj: SceneObject
  isSelected: boolean
  isDragging: boolean
  onClick: (e: ThreeEvent<MouseEvent>) => void
  onDoubleClick: (e: ThreeEvent<MouseEvent>) => void
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void
  onPointerUp: () => void
  onStartDrag: (id: string) => void
  dragOffset: THREE.Vector3 | null
  userColor: string
}

function Object3D({
  obj,
  isSelected,
  isDragging,
  onClick,
  onDoubleClick,
  onPointerDown,
  onPointerUp,
  onStartDrag,
  dragOffset,
}: Object3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const { updateObject } = useSceneStore()
  const [pointerDownPos, setPointerDownPos] = useState<THREE.Vector3 | null>(null)
  const [hasMoved, setHasMoved] = useState(false)

  // Removed all animations - objects stay completely still for building
  // useFrame is not needed anymore

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    // Store initial position for drag detection
    if (e.intersections.length > 0) {
      setPointerDownPos(new THREE.Vector3().copy(e.intersections[0].point))
      setHasMoved(false)
    }
    onPointerDown(e)
  }

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    // Start dragging only if mouse moved significantly
    if (pointerDownPos && !isDragging && !hasMoved && e.intersections.length > 0) {
      const currentPos = e.intersections[0].point
      const distance = pointerDownPos.distanceTo(currentPos)
      // Only start dragging if moved more than 0.1 units
      if (distance > 0.1) {
        setHasMoved(true)
        onStartDrag(obj.id)
      }
    }
    
    if (isDragging && e.intersections.length > 0) {
      const intersection = e.intersections[0]
      const newPosition = intersection.point.clone()
      
      if (dragOffset) {
        newPosition.sub(dragOffset)
      }
      
      updateObject(obj.id, {
        position: [newPosition.x, Math.max(0, newPosition.y), newPosition.z],
      })
    }
  }

  const handlePointerUp = useCallback(() => {
    // Reset drag tracking
    setPointerDownPos(null)
    setHasMoved(false)
    onPointerUp()
  }, [onPointerUp])

  // Handle pointer up globally (even if released outside the object)
  useEffect(() => {
    if (isDragging) {
      const handleGlobalPointerUp = () => {
        handlePointerUp()
      }
      window.addEventListener('pointerup', handleGlobalPointerUp)
      return () => {
        window.removeEventListener('pointerup', handleGlobalPointerUp)
      }
    }
  }, [isDragging, handlePointerUp])

  const Component = obj.type === 'cube' ? Box : Sphere
  // Make sphere slightly larger for easier interaction (0.6 instead of 0.5)
  const args = obj.type === 'cube' ? [1, 1, 1] : [0.6, 32, 32]

  return (
    <group ref={groupRef} position={obj.position} rotation={[0, 0, 0]}>
      <Component
        ref={meshRef}
        args={args}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerUp}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={obj.color}
          emissive={isSelected ? obj.color : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
          metalness={0.3}
          roughness={0.4}
        />
      </Component>
      {isSelected && (
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {obj.userName}
        </Text>
      )}
    </group>
  )
}

export default memo(SceneObjects)

