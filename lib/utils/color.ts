/**
 * Generates a unique color for a user based on their ID
 */
export const generateUserColor = (userId: string): string => {
  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
  ] as const

  const colorIndex = (userId.charCodeAt(0) + userId.charCodeAt(1)) % colors.length
  return colors[colorIndex]
}

