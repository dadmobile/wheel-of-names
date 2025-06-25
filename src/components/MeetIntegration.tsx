import React, { useState } from 'react'
import { Participant } from '../App'
import { 
  VideoIcon, 
  DownloadIcon, 
  CopyIcon, 
  AlertCircleIcon,
  CheckCircleIcon,
  ExternalLinkIcon 
} from 'lucide-react'

interface MeetIntegrationProps {
  onParticipantsUpdate: (participants: Participant[]) => void
}

export const MeetIntegration: React.FC<MeetIntegrationProps> = ({
  onParticipantsUpdate
}) => {
  const [importText, setImportText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const processParticipantText = (text: string) => {
    const lines = text.split('\n')
    const participants: Participant[] = []
    
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (trimmed && trimmed.length > 0) {
        // Clean up common Google Meet artifacts
        let name = trimmed
          .replace(/^\d+\.\s*/, '') // Remove numbered lists
          .replace(/\s*\(You\)$/, '') // Remove "(You)" suffix
          .replace(/\s*\(Host\)$/, '') // Remove "(Host)" suffix
          .replace(/\s*\(Guest\)$/, '') // Remove "(Guest)" suffix
          .trim()
        
        if (name.length > 0) {
          participants.push({
            id: `import-${Date.now()}-${index}`,
            name
          })
        }
      }
    })
    
    return participants
  }

  const handleImport = () => {
    if (!importText.trim()) {
      setMessage({ type: 'error', text: 'Please paste participant names first' })
      return
    }

    setIsProcessing(true)
    
    try {
      const participants = processParticipantText(importText)
      
      if (participants.length === 0) {
        setMessage({ type: 'error', text: 'No valid participant names found' })
      } else {
        onParticipantsUpdate(participants)
        setImportText('')
        setMessage({ 
          type: 'success', 
          text: `Successfully imported ${participants.length} participant${participants.length !== 1 ? 's' : ''}` 
        })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error processing participant list' })
    }
    
    setIsProcessing(false)
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  const sampleText = `Alice Johnson
Bob Smith
Carol Davis (Host)
David Wilson
Emma Brown (You)`

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <VideoIcon className="w-5 h-5 text-blue-600" />
        Google Meet Integration
      </h3>

      <div className="space-y-4">
        {/* Chrome Extension Option */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <ExternalLinkIcon className="w-4 h-4" />
            Chrome Extension (Coming Soon)
          </h4>
          <p className="text-sm text-blue-700 mb-3">
            Install our Chrome extension to automatically fetch participant names from Google Meet.
          </p>
          <button 
            disabled
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm opacity-50 cursor-not-allowed"
          >
            Install Extension
          </button>
        </div>

        {/* Manual Import */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            <CopyIcon className="w-4 h-4" />
            Manual Import
          </h4>
          <p className="text-sm text-gray-600">
            Copy participant names from Google Meet and paste them below (one name per line):
          </p>
          
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={sampleText}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />

          <button
            onClick={handleImport}
            disabled={isProcessing || !importText.trim()}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            {isProcessing ? 'Processing...' : 'Import Participants'}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircleIcon className="w-4 h-4" />
            ) : (
              <AlertCircleIcon className="w-4 h-4" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>How to get participant names from Google Meet:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>In Google Meet, click the "People" tab</li>
            <li>Select all participant names (Ctrl/Cmd + A)</li>
            <li>Copy the names (Ctrl/Cmd + C)</li>
            <li>Paste them in the text area above</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 