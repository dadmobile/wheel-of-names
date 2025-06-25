import React, { useState } from 'react'
import { Participant } from '../App'
import { PlusIcon, XIcon, UserIcon } from 'lucide-react'

interface ParticipantListProps {
  participants: Participant[]
  selectedParticipant: Participant | null
  onUpdate: (participants: Participant[]) => void
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  selectedParticipant,
  onUpdate
}) => {
  const [newName, setNewName] = useState('')

  const addParticipant = () => {
    if (newName.trim()) {
      const newParticipant: Participant = {
        id: Date.now().toString(),
        name: newName.trim()
      }
      onUpdate([...participants, newParticipant])
      setNewName('')
    }
  }

  const removeParticipant = (id: string) => {
    onUpdate(participants.filter(p => p.id !== id))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addParticipant()
    }
  }

  return (
    <div className="space-y-4">
      {/* Add new participant */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter participant name..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
          onClick={addParticipant}
          disabled={!newName.trim()}
          className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Participants list */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {participants.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <UserIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No participants added yet</p>
            <p className="text-sm">Add names above or import from Google Meet</p>
          </div>
        ) : (
          participants.map((participant) => (
            <div
              key={participant.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
                selectedParticipant?.id === participant.id
                  ? 'bg-green-100 border border-green-300'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-gray-500" />
                <span className={`font-medium ${
                  selectedParticipant?.id === participant.id
                    ? 'text-green-800'
                    : 'text-gray-700'
                }`}>
                  {participant.name}
                </span>
                {selectedParticipant?.id === participant.id && (
                  <span className="text-green-600 text-sm">🎉 Winner!</span>
                )}
              </div>
              <button
                onClick={() => removeParticipant(participant.id)}
                className="text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {participants.length > 0 && (
        <div className="text-sm text-gray-500 text-center pt-2 border-t">
          {participants.length} participant{participants.length !== 1 ? 's' : ''} ready to spin
        </div>
      )}
    </div>
  )
} 