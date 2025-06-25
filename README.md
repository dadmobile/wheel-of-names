# 🎡 Wheel of Names - Google Meet Edition

A modern, interactive wheel spinner for randomly selecting names from participants, with special integration for Google Meet sessions.

## ✨ Features

- **🎯 Smooth Wheel Animation** - Beautiful, physics-based spinning wheel with Framer Motion
- **👥 Google Meet Integration** - Extract participant names directly from Google Meet
- **📱 Responsive Design** - Works perfectly on desktop and mobile devices
- **🎨 Modern UI** - Clean, intuitive interface with Tailwind CSS
- **⚡ Real-time Updates** - Dynamic participant management
- **🔄 Multiple Import Options** - Manual entry, copy/paste, or Chrome extension

## 🚀 Quick Start

### Web Application

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

### Chrome Extension (Optional)

1. **Build Extension**
   ```bash
   # The extension files are ready in the /extension folder
   ```

2. **Install in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked" and select the `extension` folder
   - The extension will appear in your toolbar

## 📖 How to Use

### Basic Usage

1. **Add Participants**
   - Manually type names in the participant list
   - Use the "+" button or press Enter to add

2. **Spin the Wheel**
   - Click "SPIN THE WHEEL!" button
   - Watch the beautiful animation
   - See the winner highlighted

### Google Meet Integration

#### Method 1: Chrome Extension (Recommended)
1. Install the Chrome extension (see above)
2. Join a Google Meet session
3. Click the extension icon in your toolbar
4. Click "Extract Participants"
5. Copy the names and paste them into the web app

#### Method 2: Manual Copy/Paste
1. In Google Meet, click the "People" tab
2. Select all participant names (Ctrl/Cmd + A)
3. Copy the names (Ctrl/Cmd + C)
4. In the Wheel app, paste into the "Manual Import" text area
5. Click "Import Participants"

## 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript
- **Animation**: Framer Motion
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Extension**: Chrome Extension Manifest V3

## 🎨 Architecture

```
wheel-of-names/
├── src/
│   ├── components/
│   │   ├── Wheel.tsx           # Main spinning wheel component
│   │   ├── ParticipantList.tsx # Participant management
│   │   └── MeetIntegration.tsx # Google Meet import features
│   ├── App.tsx                 # Main application component
│   └── main.tsx               # React entry point
├── extension/                  # Chrome extension files
│   ├── manifest.json          # Extension configuration
│   ├── content.js             # Google Meet DOM extraction
│   ├── popup.html             # Extension popup UI
│   └── popup.js               # Extension popup logic
└── public/                    # Static assets
```

## 🎯 Key Components

### Wheel Component
- SVG-based wheel with dynamic segments
- Smooth rotation animation with easing
- Color-coded segments for visual appeal
- Responsive pointer and winner highlighting

### Google Meet Integration
- **Content Script**: Extracts participant names from Meet DOM
- **Smart Parsing**: Removes "(You)", "(Host)", "(Guest)" suffixes
- **Real-time Monitoring**: Detects participant changes
- **Multiple Extraction Methods**: Various DOM selectors for reliability

### Participant Management
- Add/remove participants manually
- Import from various sources
- Duplicate detection
- Winner tracking and highlighting

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Extension Development

The Chrome extension uses Manifest V3 and includes:
- Content scripts for DOM access
- Popup UI for participant extraction
- Message passing between components
- Automatic Meet page detection

## 🎪 Demo Scenarios

### Classroom Use
- Teacher joins Google Meet with students
- Extracts student names via extension
- Spins wheel to randomly select students for questions

### Team Meetings
- Extract meeting participants
- Randomly assign presentation order
- Fair selection for tasks or activities

### Virtual Events
- Extract attendee names
- Random prize giveaways
- Interactive engagement activities

## 🔐 Privacy & Security

- **No Data Storage**: Names are only stored locally in browser session
- **No External Requests**: Extension only accesses current Meet page DOM
- **Minimal Permissions**: Extension only requests necessary permissions
- **Open Source**: All code is transparent and auditable

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by wheelofnames.com
- Built with modern web technologies
- Designed for seamless Google Meet integration

---

**Made with ❤️ for better virtual interactions** 