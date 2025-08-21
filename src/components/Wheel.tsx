import React from 'react'
import { motion } from 'framer-motion'
import { Participant } from '../App'

interface WheelProps {
  participants: Participant[]
  selectedParticipant: Participant | null
  isSpinning: boolean
  onSelectionComplete?: (participant: Participant) => void
}

const COLORS = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
  '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
  '#10ac84', '#ee5a24', '#0984e3', '#a29bfe', '#fd79a8',
  '#fdcb6e', '#6c5ce7', '#74b9ff', '#81ecec', '#fab1a0'
]

export const Wheel: React.FC<WheelProps> = ({ 
  participants, 
  selectedParticipant, 
  isSpinning,
  onSelectionComplete
}) => {
  const [currentRotation, setCurrentRotation] = React.useState(0)
  const [isInternallySpinning, setIsInternallySpinning] = React.useState(false)

  // Update rotation when spinning starts
  React.useEffect(() => {
    if (isSpinning && !isInternallySpinning) {
      setIsInternallySpinning(true)
      const spinAmount = 1800 + Math.random() * 1800 // 5-10 full rotations
      setCurrentRotation(prev => prev + spinAmount)
    }
  }, [isSpinning, isInternallySpinning])

  const segmentAngle = participants.length > 0 ? 360 / participants.length : 0
  const radius = 150
  const centerX = 160
  const centerY = 160

  const createPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle)
    const end = polarToCartesian(centerX, centerY, radius, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
    
    return [
      "M", centerX, centerY,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ")
  }

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    }
  }

  const getTextPosition = (angle: number) => {
    const midAngle = angle + segmentAngle / 2
    const textRadius = radius * 0.7
    return polarToCartesian(centerX, centerY, textRadius, midAngle)
  }

  const calculateSelectedParticipant = (finalRotation: number) => {
    if (participants.length === 0) return null
    
    // Normalize the rotation to 0-360 degrees
    const normalizedRotation = finalRotation % 360
    
    // The arrow points to the top (0 degrees). Since the wheel rotates clockwise,
    // we need to find which segment is currently at the top position
    // We invert the rotation because when wheel spins clockwise, 
    // the segments effectively move counter-clockwise relative to the arrow
    let arrowAngle = (360 - normalizedRotation) % 360
    
    // Ensure positive angle
    if (arrowAngle < 0) arrowAngle += 360
    
    // Find which segment the arrow is pointing to
    const selectedIndex = Math.floor(arrowAngle / segmentAngle) % participants.length
    
    return participants[selectedIndex]
  }

  if (participants.length === 0) {
    return (
      <div className="flex items-center justify-center w-80 h-80 mx-auto">
        <div className="text-center text-gray-500">
          <div className="w-32 h-32 mx-auto mb-4 border-4 border-dashed border-gray-300 rounded-full flex items-center justify-center">
            <span className="text-4xl">🎡</span>
          </div>
          <p>Add participants to spin the wheel!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
        </div>
        
        {/* Wheel */}
        <motion.svg
          width="320"
          height="320"
          className="drop-shadow-lg"
          animate={{ rotate: currentRotation }}
          transition={{
            duration: isInternallySpinning ? 4 : 0,
            ease: "easeOut"
          }}
          onAnimationComplete={() => {
            setIsInternallySpinning(false)
            if (onSelectionComplete && participants.length > 0) {
              const selectedParticipant = calculateSelectedParticipant(currentRotation)
              if (selectedParticipant) {
                onSelectionComplete(selectedParticipant)
              }
            }
          }}
        >
          {participants.map((participant, index) => {
            const startAngle = index * segmentAngle
            const endAngle = (index + 1) * segmentAngle
            const path = createPath(startAngle, endAngle)
            const textPos = getTextPosition(startAngle)
            const color = COLORS[index % COLORS.length]
            
            const isSelected = selectedParticipant?.id === participant.id
            
            return (
              <g key={participant.id}>
                <path
                  d={path}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className={`wheel-segment ${isSelected ? 'brightness-110' : ''}`}
                  style={{
                    filter: isSelected ? 'brightness(1.2) drop-shadow(0 0 10px rgba(0,0,0,0.3))' : undefined
                  }}
                />
                <text
                  x={textPos.x}
                  y={textPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  className="pointer-events-none"
                  style={{
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}
                >
                  {participant.name.length > 12 
                    ? participant.name.substring(0, 12) + '...' 
                    : participant.name
                  }
                </text>
              </g>
            )
          })}
          
          {/* Center circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r="20"
            fill="#374151"
            stroke="#ffffff"
            strokeWidth="3"
          />
        </motion.svg>
      </div>
    </div>
  )
} 