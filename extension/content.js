// Content script for Google Meet participant extraction
class MeetParticipantExtractor {
  constructor() {
    this.participants = new Set()
    this.observer = null
    this.isExtracting = false
  }

  // Extract participants from the people panel
  extractParticipants() {
    const participants = new Set() // Restored Set to deduplicate names
    
    console.log('🔍 Starting participant extraction...')
    
    // Strategy 1: People panel (most reliable)
    this.extractFromPeoplePanel(participants)
    
    // Strategy 2: Video tiles/grid view
    this.extractFromVideoTiles(participants)
    
    // Strategy 3: Alternative selectors for different Meet versions
    this.extractFromAlternativeSelectors(participants)
    
    console.log(`✅ Found ${participants.size} participants:`, Array.from(participants))
    return Array.from(participants)
  }

  extractFromPeoplePanel(participants) {
    console.log('🔍 Looking for participants list...')
    
    // Target the specific participants list container
    const participantsList = this.findParticipantsList()
    
    if (participantsList) {
      console.log('🎯 Found participants list:', participantsList)
      this.extractFromParticipantsList(participantsList, participants)
    } else {
      console.log('❌ Participants list not found, trying alternative methods...')
      
      // Check if people panel seems to be loaded properly
      this.checkPeoplePanelState()
      
      // Fallback to Contributors section search
      const contributorsSection = this.findContributorsSection()
      
      if (contributorsSection) {
        console.log('📋 Found Contributors section:', contributorsSection)
        this.extractFromContributorsSection(contributorsSection, participants)
      } else {
        // Final fallback: generic panel search
        this.fallbackPanelSearch(participants)
      }
    }

    // If still no participants, give user guidance
    if (participants.size === 0) {
      this.suggestTroubleshooting()
    }
  }

  findParticipantsList() {
    // Target the specific participants list structure
    const participantsListSelectors = [
      '[role="list"][aria-label="Participants"]',
      '[aria-label="Participants"]',
      '[role="list"][aria-label*="participant"]',
      '[role="list"][aria-label*="Participant"]',
      '.AE8xFb.OrqRRb.GvcuGe.goTdfd', // Specific classes mentioned
      '[jsname="jrQDbd"]' // Specific jsname
    ]

    for (const selector of participantsListSelectors) {
      const list = document.querySelector(selector)
      if (list) {
        console.log(`🎯 Found participants list with selector: ${selector}`)
        return list
      }
    }

    console.log('❌ No participants list found with specific selectors')
    return null
  }

  extractFromParticipantsList(list, participants) {
    console.log('🔍 Extracting from participants list...')
    console.log('🔍 List content preview:', list.textContent?.substring(0, 200))
    
    // Look for individual participant items within the list
    const participantItemSelectors = [
      '[role="listitem"]',
      'li',
      'div[data-participant-id]',
      'div[data-self-name]',
      '.participant-item',
      'div:not(:has(div))', // Leaf div elements
      'span:not(:has(span))' // Leaf span elements
    ]

    let foundAny = false

    participantItemSelectors.forEach(selector => {
      const items = list.querySelectorAll(selector)
      console.log(`🔍 Found ${items.length} items with selector: ${selector}`)
      
      items.forEach((item, index) => {
        const text = item.textContent?.trim()
        console.log(`  Item ${index}: "${text}" (${item.tagName})`)
        
                 const name = this.extractNameFromElement(item)
         if (name) {
           participants.add(name)
           console.log(`👤 Found participant: ${name}`)
           foundAny = true
        } else if (text && text.length > 0 && text.length < 100) {
          console.log(`  ❌ Rejected: "${text}" (failed validation)`)
          // Let's also check why it failed
          console.log(`    Valid name check: ${this.isValidParticipantName(text)}`)
          console.log(`    UI text check: ${this.isUIText(text)}`)
        }
      })
    })

    if (!foundAny) {
      console.log('🔍 No participants found in specific selectors, trying all children...')
      this.extractFromAllChildren(list, participants)
    }
  }

  extractFromAllChildren(container, participants) {
    // Get all direct and indirect children
    const allChildren = container.querySelectorAll('*')
    console.log(`🔍 Checking all ${allChildren.length} child elements...`)
    
    allChildren.forEach((child, index) => {
      // Only check elements with minimal children (likely to contain names)
      if (child.children.length <= 2) {
        const text = child.textContent?.trim()
        if (text && text.length > 2 && text.length < 100) {
          console.log(`  Child ${index}: "${text}" (${child.tagName}.${child.className})`)
          
                     if (this.isValidParticipantName(text)) {
             const cleanName = this.cleanParticipantName(text)
             if (cleanName) {
               participants.add(cleanName)
               console.log(`👤 Found participant (all children): ${cleanName}`)
             }
           }
        }
      }
    })
  }

  fallbackPanelSearch(participants) {
    // Final fallback: look for people panel with general selectors
    const peoplePanelSelectors = [
      '[data-panel-id="2"]', // People panel
      '[aria-label*="participant"]',
      '[role="complementary"]',
      '[data-tab-id="2"]'
    ]

    for (const selector of peoplePanelSelectors) {
      const panel = document.querySelector(selector)
      if (panel) {
        console.log('📋 Found people panel (fallback):', selector)
        this.extractFromGenericPanel(panel, participants)
        break
      }
    }
  }

  checkPeoplePanelState() {
    console.log('🔍 Checking people panel state...')
    
    // Look for indicators that people panel is open and loaded
    const indicators = [
      'Add people',
      'Search for people', 
      'Contributors',
      'Participants',
      'In call',
      'participants'
    ]

    const pageText = document.body.textContent || ''
    const foundIndicators = indicators.filter(indicator => 
      pageText.toLowerCase().includes(indicator.toLowerCase())
    )

    console.log('🔍 Found panel indicators:', foundIndicators)
    
    if (foundIndicators.length === 0) {
      console.log('⚠️ People panel may not be open. Make sure to click the People icon in Google Meet.')
    }
  }

  suggestTroubleshooting() {
    console.log('❌ No participants found. Troubleshooting suggestions:')
    console.log('1. Make sure you\'re in an active Google Meet session')
    console.log('2. Click the "People" icon to open the people panel')
    console.log('3. Make sure there are other participants in the meeting')
    console.log('4. Check if there\'s a "Contributors" or "In call" section visible')
    console.log('5. Try refreshing the Meet page and rejoining')
  }

  findContributorsSection() {
    console.log('🔍 Searching for Contributors section...')
    
    // First, let's see what text we can find in the people panel
    this.debugPeoplePanelContent()
    
    // Look for "Contributors" text/heading with various patterns
    const allElements = document.querySelectorAll('*')
    const contributorsPatterns = [
      'Contributors',
      'contributors', 
      'CONTRIBUTORS',
      'Participants',
      'participants',
      'PARTICIPANTS',
      'People',
      'people',
      'PEOPLE'
    ]
    
    for (const element of allElements) {
      const text = element.textContent?.trim()
      
      // Look for Contributors/Participants heading
      if (contributorsPatterns.some(pattern => text === pattern)) {
        console.log('🎯 Found heading:', text, element)
        
        // The participant list should be nearby (parent, sibling, or child)
        const possibleContainers = [
          element.parentElement,
          element.parentElement?.parentElement,
          element.nextElementSibling,
          element.parentElement?.nextElementSibling,
          element.parentElement?.parentElement?.nextElementSibling
        ]
        
        for (const container of possibleContainers) {
          if (container && this.hasParticipantList(container)) {
            console.log('🎯 Found good container for participants:', container)
            return container
          }
        }
        
        // If no good container found, return the element itself
        console.log('🎯 Using element parent as fallback:', element.parentElement)
        return element.parentElement || element
      }
    }
    
    console.log('❌ No Contributors/Participants heading found')
    return null
  }

  debugPeoplePanelContent() {
    console.log('🔍 DEBUG: Looking for people panel content...')
    
    // Try to find the people panel first
    const peoplePanelSelectors = [
      '[data-panel-id="2"]',
      '[role="complementary"]',
      '[data-tab-id="2"]',
      '[aria-label*="people"]',
      '[aria-label*="participant"]'
    ]
    
    for (const selector of peoplePanelSelectors) {
      const panel = document.querySelector(selector)
      if (panel) {
        console.log(`🔍 DEBUG: Found panel with ${selector}:`, panel)
        console.log('🔍 DEBUG: Panel content preview:', panel.textContent?.substring(0, 200))
        
        // Log all headings/text elements in this panel
        const textElements = panel.querySelectorAll('h1, h2, h3, h4, h5, h6, span, div')
        console.log('🔍 DEBUG: Text elements in panel:')
        textElements.forEach((el, i) => {
          const text = el.textContent?.trim()
          if (text && text.length < 50 && text.length > 2) {
            console.log(`  ${i}: "${text}"`)
          }
        })
        break
      }
    }
  }

  hasParticipantList(element) {
    // Check if this element likely contains a participant list
    const childCount = element.children?.length || 0
    const textContent = element.textContent || ''
    
    // Should have multiple children (participant items)
    // Should not be mostly UI text
    return childCount > 0 && 
           childCount < 50 && // Reasonable number of participants
           !this.isUIText(textContent) &&
           !textContent.includes('Add people') &&
           !textContent.includes('Search for people')
  }

  extractFromContributorsSection(section, participants) {
    console.log('🔍 Extracting from Contributors section...')
    
    // Look for participant items within the Contributors section
    const participantSelectors = [
      '[role="listitem"]',
      '[data-participant-id]',
      'div[data-self-name]',
      'span[data-self-name]',
      // Look for elements that might contain names
      'div:not(:has(*))', // Leaf div elements (no children)
      'span:not(:has(*))', // Leaf span elements
    ]

         participantSelectors.forEach(selector => {
       const elements = section.querySelectorAll(selector)
       console.log(`🔍 Checking ${elements.length} elements with selector: ${selector}`)
       
       elements.forEach((element, index) => {
         const text = element.textContent?.trim()
         console.log(`  Element ${index}: "${text}" (${element.tagName})`)
         
         const name = this.extractNameFromElement(element)
         if (name) {
           participants.add(name)
           console.log(`👤 Found participant (contributors): ${name}`)
         } else if (text && text.length > 0) {
           console.log(`  ❌ Rejected: "${text}" (failed validation)`)
         }
       })
     })

    // Also check direct text nodes in the section
    this.extractFromTextNodes(section, participants)
  }

  extractFromTextNodes(container, participants) {
    // Walk through all text nodes to find participant names
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    )

    let node
    while (node = walker.nextNode()) {
      const text = node.textContent?.trim()
      if (text && this.isValidParticipantName(text)) {
                 const cleanName = this.cleanParticipantName(text)
         if (cleanName) {
           participants.add(cleanName)
           console.log(`👤 Found participant (text node): ${cleanName}`)
        }
      }
    }
  }

  extractFromGenericPanel(panel, participants) {
    console.log('🔍 Extracting from generic panel...')
    
    // Fallback method for generic panel extraction
    const nameSelectors = [
      '[role="listitem"]',
      '[data-participant-id]',
      '[data-self-name]',
      '.participant-name',
      '.name'
    ]

    nameSelectors.forEach(nameSelector => {
      const elements = panel.querySelectorAll(nameSelector)
      console.log(`🔍 Found ${elements.length} elements with selector: ${nameSelector}`)
      
      elements.forEach(element => {
                 const name = this.extractNameFromElement(element)
         if (name) {
           participants.add(name)
           console.log('👤 Found participant (generic panel):', name)
        }
      })
    })

    // If we still haven't found participants, try a more aggressive approach
    if (participants.size === 0) {
      console.log('🔍 No participants found yet, trying aggressive text extraction...')
      this.extractFromAllText(panel, participants)
    }
  }

  extractFromAllText(container, participants) {
    // Get all text elements and look for potential names
    const allElements = container.querySelectorAll('*')
    
    allElements.forEach(element => {
      // Skip elements with many children (likely containers)
      if (element.children.length > 3) return
      
      const text = element.textContent?.trim()
      if (text && this.isValidParticipantName(text)) {
                 const cleanName = this.cleanParticipantName(text)
         if (cleanName && cleanName.length > 1) {
           participants.add(cleanName)
           console.log(`👤 Found participant (aggressive): ${cleanName}`)
        }
      }
    })
  }

  extractFromVideoTiles(participants) {
    // Look for video tiles with participant names
    const videoSelectors = [
      '[data-participant-id] [data-self-name]',
      '[data-participant-id]',
      '.participant-name',
      '[aria-label*="video"]',
      '[data-fps-request-screencast-cap]'
    ]

    videoSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
                 const name = this.extractNameFromElement(element)
         if (name) {
           participants.add(name)
           console.log('🎥 Found participant (video tile):', name)
        }
      })
    })
  }

  extractFromAlternativeSelectors(participants) {
    // Only scan specific areas that are likely to contain participant names
    const targetSelectors = [
      '[data-participant-id]',
      '[data-self-name]', 
      '[role="listitem"]',
      '[aria-label*="participant"]',
      '[aria-label*="video"]',
      '.participant',
      '.name'
    ]
    
    targetSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
        // Only check direct text content, not nested elements
        const directText = this.getDirectTextContent(element)
        
        if (this.isValidParticipantName(directText)) {
                   const cleanName = this.cleanParticipantName(directText)
         if (cleanName && cleanName.length > 1) {
           participants.add(cleanName)
           console.log('🔤 Found participant (targeted scan):', cleanName)
          }
        }
      })
    })
  }

  getDirectTextContent(element) {
    // Get only the direct text content, not from child elements
    let text = ''
    for (let node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent
      }
    }
    return text.trim()
  }

  isValidParticipantName(text) {
    if (!text || text.length < 2 || text.length > 100) return false
    
    // Must be primarily letters, spaces, and common name characters
    if (!/^[a-zA-Z\s\-'\.]+(\s\(You\)|\s\(Host\)|\s\(Guest\)|\s\(Presenter\))?$/.test(text)) return false
    
    // Filter out obvious UI text
    if (this.isUIText(text)) return false
    
    // Filter out meeting codes and technical text
    if (/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/.test(text)) return false // meeting codes like "erw-zqba-yqt"
    if (text.includes('Meet -')) return false
    if (text.includes('isn\'t taking notes')) return false
    if (text.includes('Waiting to')) return false
    
    // Must have at least one space (most real names have first + last name)
    // But allow single names too, just be more strict about them
    const words = text.trim().split(/\s+/)
    if (words.length === 1) {
      // For single words, be more strict
      return text.length >= 3 && /^[A-Z][a-z]+$/.test(text)
    }
    
    return true
  }

  isUIText(text) {
    // Filter out common UI text that's not participant names
    const uiTexts = [
      'join', 'leave', 'mute', 'unmute', 'camera', 'mic', 'microphone',
      'chat', 'share', 'screen', 'record', 'end', 'call', 'meeting',
      'participants', 'people', 'more', 'options', 'settings', 'help',
      'turn on', 'turn off', 'enable', 'disable', 'cancel', 'ok', 'done',
      'video', 'audio', 'present', 'stop', 'start', 'pause', 'resume',
      'pin', 'devices', 'reframe', 'background', 'effects', 'raising',
      'hand', 'jump', 'bottom', 'back', 'close', 'search', 'waiting',
      'pair', 'contributors', 'reducing', 'noise', 'mood', 'info', 'apps',
      'alarm', 'gemini', 'notes', 'taking', 'meet', 'captions', 'live',
      'transcription', 'breakout', 'rooms', 'polls', 'whiteboard', 'jamboard'
    ]
    
    const lowerText = text.toLowerCase()
    return uiTexts.some(ui => lowerText.includes(ui))
  }

  cleanParticipantName(text) {
    if (!text) return null
    
    return text
      .replace(/\s*\(You\)$/, '')
      .replace(/\s*\(Host\)$/, '') 
      .replace(/\s*\(Guest\)$/, '')
      .replace(/\s*\(Presenter\)$/, '')
      .replace(/^\d+\s*/, '')
      .trim()
  }

  // Extract clean name from various element types
  extractNameFromElement(element) {
    if (!element) return null

    let name = ''
    
    // Try different methods to get the name
    if (element.dataset?.selfName) {
      name = element.dataset.selfName
    } else if (element.getAttribute && element.getAttribute('data-self-name')) {
      name = element.getAttribute('data-self-name')
    } else if (element.textContent) {
      name = element.textContent.trim()
    } else if (element.innerText) {
      name = element.innerText.trim()
    } else if (element.getAttribute && element.getAttribute('aria-label')) {
      // Sometimes names are in aria-label
      const ariaLabel = element.getAttribute('aria-label')
      if (ariaLabel && ariaLabel.includes('video')) {
        // Extract name from aria-label like "John Doe's video"
        name = ariaLabel.replace(/'s video.*$/i, '').trim()
      }
    }

    if (!name) return null

    // Clean up the name using the centralized function
    name = this.cleanParticipantName(name)

    // Validate the name
    if (!name || name.length < 2 || name.length > 50) return null
    if (/^[^a-zA-Z]*$/.test(name)) return null // Must contain at least some letters
    if (this.isUIText(name)) return null // Filter out UI text

    return name
  }

  // Start monitoring for participant changes
  startMonitoring() {
    if (this.observer) {
      this.observer.disconnect()
    }

    this.observer = new MutationObserver(() => {
      this.extractAndNotify()
    })

    // Observe changes in the document
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // Initial extraction
    this.extractAndNotify()
  }

  // Extract participants and notify extension popup
  extractAndNotify() {
    if (this.isExtracting) return
    this.isExtracting = true

    setTimeout(() => {
      const participants = this.extractParticipants()
      
      // Send message to popup/background script
      chrome.runtime.sendMessage({
        type: 'PARTICIPANTS_UPDATED',
        participants: participants
      })

      this.isExtracting = false
    }, 1000) // Debounce rapid changes
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}

// Initialize extractor
const extractor = new MeetParticipantExtractor()

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'GET_PARTICIPANTS':
      const participants = extractor.extractParticipants()
      sendResponse({ participants })
      break
    case 'START_MONITORING':
      extractor.startMonitoring()
      sendResponse({ success: true })
      break
    case 'STOP_MONITORING':
      extractor.stopMonitoring()
      sendResponse({ success: true })
      break
  }
})

// Auto-start monitoring when on Google Meet
if (window.location.hostname === 'meet.google.com') {
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => extractor.startMonitoring(), 2000)
    })
  } else {
    setTimeout(() => extractor.startMonitoring(), 2000)
  }
} 