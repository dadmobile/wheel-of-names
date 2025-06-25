// Popup script for the Chrome extension
class PopupController {
  constructor() {
    this.participants = []
    this.init()
  }

  init() {
    // Get DOM elements
    this.participantsList = document.getElementById('participantsList')
    this.participantCount = document.getElementById('participantCount')
    this.extractBtn = document.getElementById('extractBtn')
    this.copyBtn = document.getElementById('copyBtn')
    this.openWheelBtn = document.getElementById('openWheelBtn')
    this.status = document.getElementById('status')

    // Bind event listeners
    this.extractBtn.addEventListener('click', () => this.extractParticipants())
    this.copyBtn.addEventListener('click', () => this.copyToClipboard())
    this.openWheelBtn.addEventListener('click', () => this.openWheelApp())

    // Check if we're on Google Meet
    this.checkMeetPage()
  }

  async checkMeetPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
      if (!tab.url.includes('meet.google.com')) {
        this.showStatus('Please navigate to a Google Meet session first', 'info')
        this.extractBtn.disabled = true
        return false
      }
      
      return true
    } catch (error) {
      this.showStatus('Error checking current page', 'error')
      return false
    }
  }

  async extractParticipants() {
    this.extractBtn.disabled = true
    this.extractBtn.textContent = 'Extracting...'
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
      // Send message to content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'GET_PARTICIPANTS'
      })

      if (response && response.participants) {
        this.participants = response.participants
        this.updateParticipantsList()
        
        if (this.participants.length > 0) {
          this.showStatus(`Found ${this.participants.length} participants`, 'success')
          this.copyBtn.disabled = false
        } else {
          this.showStatus('No participants found. Make sure the People panel is open in Meet.', 'info')
        }
      } else {
        throw new Error('No response from content script')
      }
    } catch (error) {
      console.error('Error extracting participants:', error)
      this.showStatus('Error extracting participants. Try refreshing the Meet page.', 'error')
    } finally {
      this.extractBtn.disabled = false
      this.extractBtn.textContent = 'Extract Participants'
    }
  }

  updateParticipantsList() {
    this.participantCount.textContent = `Participants (${this.participants.length})`
    
    if (this.participants.length === 0) {
      this.participantsList.innerHTML = '<div class="no-participants">No participants found</div>'
      return
    }

    const html = this.participants
      .map(name => `<div class="participant-item">• ${this.escapeHtml(name)}</div>`)
      .join('')
    
    this.participantsList.innerHTML = html
  }

  async copyToClipboard() {
    if (this.participants.length === 0) {
      this.showStatus('No participants to copy', 'error')
      return
    }

    try {
      const text = this.participants.join('\n')
      await navigator.clipboard.writeText(text)
      this.showStatus('Participants copied to clipboard!', 'success')
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = this.participants.join('\n')
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      this.showStatus('Participants copied to clipboard!', 'success')
    }
  }

  async openWheelApp() {
    // First, try to copy participants to clipboard
    if (this.participants.length > 0) {
      try {
        const text = this.participants.join('\n')
        await navigator.clipboard.writeText(text)
        this.showStatus(`Copied ${this.participants.length} participants to clipboard! Paste them in the wheel app.`, 'success')
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = this.participants.join('\n')
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        this.showStatus(`Copied ${this.participants.length} participants to clipboard! Paste them in the wheel app.`, 'success')
      }
    } else {
      this.showStatus('No participants to copy. Extract participants first.', 'info')
    }

    // Open the wheel of names app
    const wheelUrl = 'http://localhost:3000' // Development URL
    chrome.tabs.create({ url: wheelUrl })
  }

  showStatus(message, type) {
    this.status.textContent = message
    this.status.className = `status ${type}`
    
    // Clear status after 3 seconds for success/error messages
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        this.status.textContent = ''
        this.status.className = 'status'
      }, 3000)
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController()
}) 