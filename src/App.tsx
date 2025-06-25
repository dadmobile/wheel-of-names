import React, { useState } from 'react'
import { Wheel } from './components/Wheel'
import { ParticipantList } from './components/ParticipantList'
import { MeetIntegration } from './components/MeetIntegration'
import { VideoIcon, UsersIcon, RotateCcwIcon } from 'lucide-react'

export interface Participant {
  id: string
  name: string
  isSelected?: boolean
}

function App() {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Alice Johnson' },
    { id: '2', name: 'Bob Smith' },
    { id: '3', name: 'Carol Davis' },
    { id: '4', name: 'David Wilson' },
    { id: '5', name: 'Emma Brown' },
  ])
  
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)

  const handleSpin = () => {
    if (participants.length === 0 || isSpinning) return
    
    setIsSpinning(true)
    setSelectedParticipant(null)
    
    // Simulate spinning delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * participants.length)
      const selected = participants[randomIndex]
      setSelectedParticipant(selected)
      setIsSpinning(false)
    }, 4000)
  }

  const handleParticipantsUpdate = (newParticipants: Participant[]) => {
    setParticipants(newParticipants)
    setSelectedParticipant(null)
  }

  const resetSelection = () => {
    setSelectedParticipant(null)
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Wheel of Names
          </h1>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <VideoIcon className="w-5 h-5" />
            Google Meet Edition
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Meet Integration */}
          <div className="space-y-6">
            <MeetIntegration onParticipantsUpdate={handleParticipantsUpdate} />
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UsersIcon className="w-5 h-5" />
                Participants ({participants.length})
              </h3>
              <ParticipantList 
                participants={participants} 
                selectedParticipant={selectedParticipant}
                onUpdate={setParticipants}
              />
            </div>
          </div>

          {/* Center Panel - Wheel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <Wheel 
                  participants={participants}
                  selectedParticipant={selectedParticipant}
                  isSpinning={isSpinning}
                />
                
                <div className="mt-8 space-y-4">
                  <button
                    onClick={handleSpin}
                    disabled={participants.length === 0 || isSpinning}
                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 
                             text-white px-8 py-3 rounded-lg font-semibold text-lg
                             transition-colors duration-200 disabled:cursor-not-allowed"
                  >
                    {isSpinning ? 'Spinning...' : 'SPIN THE WHEEL!'}
                  </button>
                  
                  {selectedParticipant && (
                    <button
                      onClick={resetSelection}
                      className="ml-4 text-gray-600 hover:text-gray-800 px-4 py-2 
                               rounded-lg border border-gray-300 hover:border-gray-400
                               transition-colors duration-200 flex items-center gap-2"
                    >
                      <RotateCcwIcon className="w-4 h-4" />
                      Reset
                    </button>
                  )}
                </div>

                {selectedParticipant && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-1">
                      🎉 Winner Selected!
                    </h3>
                    <p className="text-2xl font-bold text-green-700">
                      {selectedParticipant.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 