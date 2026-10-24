<div align="center">

  <img src="icons/icon128.png" alt="YouTube Auto Skip Logo" width="96" height="96" style="border-radius: 20px; box-shadow: 0 8px 24px rgba(255, 0, 51, 0.35);" />

  # ⚡ YouTube Auto Skip

  **A lightweight, high-performance browser extension that automatically skips, fast-forwards through, and silences YouTube ads seamlessly.**

  [![Manifest V3](https://img.shields.io/badge/Manifest-V3-red.svg?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![Platform](https://img.shields.io/badge/Platform-Chromium%20%7C%20Edge%20%7C%20Brave-blue.svg?style=for-the-badge)](https://www.google.com/chrome/)


  <p align="center">
    <a href="#-key-features">Features</a> •
    <a href="#-how-it-works">How It Works</a> •
    <a href="#-installation-guide">Installation</a> •
    <a href="#-popup-controls">Popup Controls</a> •
    <a href="#-project-structure">Project Structure</a> •
    <a href="#-faq--troubleshooting">FAQ</a>
  </p>

</div>

---

## 📖 Overview

Tired of sitting through 5-second countdowns before the **"Skip Ad"** button turns clickable, or getting stuck listening to unskippable ads?

**YouTube Auto Skip** is an ultra-lightweight, native Chrome extension built on **Manifest V3**. It runs passively in the background without heavy dependencies, detecting and accelerating ads in milliseconds while offering full control directly from an elegant glassmorphic popup.

---

## ✨ Key Features

- ⏩ **Instant Skip Button Triggering**  
  Detects and clicks all YouTube skip button variations (`.ytp-skip-ad-button`, `.ytp-ad-skip-button-modern`, dynamic slot buttons) the millisecond they appear in the DOM.

- ⚡ **Turbo Fast-Forward (Countdown & Unskippable Ads)**  
  Eliminates the mandatory 5-second countdown and unskippable 15-second ads by bumping the video playback rate to **16x** and seeking straight to the end to trigger instant completion.

- 🔇 **Smart Auto-Mute Protection**  
  Instantly mutes the video during ad playback to prevent loud ad interruptions, and cleanly restores your custom audio volume as soon as the main video resumes.

- 🚫 **Overlay & Banner Auto-Closer**  
  Silently dismisses promo banners and image overlays that cover your video screen.

- 🛡️ **Anti-Adblock Modal Auto-Dismiss**  
  Closes annoying warning dialogs and popup reminders automatically so your viewing stays uninterrupted.

- 📊 **Real-Time Ad-Skip Counter**  
  Tracks the total number of ads skipped with persistent storage and a one-click reset option.

- 🎨 **Modern Dark Glassmorphic Popup**  
  Sleek, responsive dark-mode popup with smooth switches and glowing active status indicators.

- ⚡ **Zero Bloat & Battery Friendly**  
  Uses a throttled `MutationObserver` and `requestAnimationFrame` to ensure zero lag, minimal memory usage, and zero CPU waste.

---

## 🛠️ How It Works

```
                                  [ YouTube Video Page ]
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
            [ DOM MutationObserver ]                      [ Video Time Update ]
                       │                                           │
                       └─────────────────────┬─────────────────────┘
                                             │ Throttled (rAF)
                                             ▼
                                    Is Ad Detected?
                                   (.ad-showing, etc.)
                                    /              \
                                  YES              NO
                                  /                  \
             ┌───────────────────┴───┐            Restore audio &
             ▼                       ▼            playback speed
     [ Skip Button Ready? ]   [ Fast-Forward ]
       • Click button           • Rate = 16x
       • Increment count        • Seek to duration
       • Auto-mute              • Auto-mute
```

1. **Detection**: Listens for YouTube's ad state flags (such as `.ad-showing`, `.ad-interrupting`, `.ytp-ad-player-overlay`).
2. **Action**: 
   - If a skip button is rendered, it triggers both native and synthetic click events.
   - If the ad is unskippable or counting down, it temporarily accelerates the ad at 16x speed and jumps the playback position.
   - Mutes the ad audio during this transition.
3. **Restoration**: As soon as the main video returns, volume and 1x playback speed are immediately restored.
4. **Synchronization**: State toggles and skip statistics are synced via `chrome.storage.local`.

---

## 🚀 Installation Guide

Because this is a custom extension, you can install it into any Chromium-based browser (**Google Chrome**, **Brave**, **Microsoft Edge**, **Opera**, or **Vivaldi**) in less than 30 seconds:

### Step 1: Open Extension Management
Open your browser and navigate to:
- **Chrome**: `chrome://extensions/`
- **Brave**: `brave://extensions/`
- **Edge**: `edge://extensions/`

### Step 2: Enable Developer Mode
Look for the **Developer mode** toggle switch in the top-right corner and turn it **ON**.

### Step 3: Load the Extension
1. Click the **Load unpacked** button in the top-left corner.
2. Select the extension directory:
   ```
   Select the extension directory where you cloned or extracted the project folder.
   ```
3. The extension card **"YouTube Auto Skip"** will appear in your extension list!

### Step 4: Pin & Enjoy
1. Click the puzzle icon 🧩 in the browser toolbar and pin **YouTube Auto Skip**.
2. Open any video on [YouTube](https://www.youtube.com).
3. The extension is active and will handle all ads automatically!

---

## 🎛️ Popup Controls

Click the extension icon in your browser toolbar to open the control panel:

| Control | Description | Default |
| :--- | :--- | :---: |
| **Master Switch** | Enables or pauses the entire extension globally | `ON` |
| **Instant Fast-Forward** | Accelerates unskippable ads and countdown timers | `ON` |
| **Silence Ad Audio** | Mutes sound whenever an ad is active | `ON` |
| **Ads Blocked Counter** | Shows total ads handled; click the refresh icon to reset | `0` |

---

## 📁 Project Structure

```bash
youtube-add-skip-extension/
├── manifest.json         # Extension manifest (V3) declaring permissions & scripts
├── content.js            # Content script running on YouTube to detect & skip ads
├── popup.html            # Extension popup user interface (CSP-compliant)
├── popup.js              # Logic & chrome.storage state synchronization
├── style.css             # Glassmorphic dark styling for popup UI
├── generate_icons.js     # Script to generate crisp PNG icons
├── icons/                # Extension icons
│   ├── icon16.png        # 16x16 icon (favicon/toolbar)
│   ├── icon48.png        # 48x48 icon (extension manager)
│   └── icon128.png       # 128x128 icon (webstore / detail view)
└── README.md             # Project documentation
```

---

## ❓ FAQ & Troubleshooting

<details>
<summary><b>Does this violate YouTube's terms or trigger anti-adblock warnings?</b></summary>
<br>
Unlike traditional network-level ad blockers that intercept and block network requests, <b>YouTube Auto Skip</b> works entirely inside the client player. It simply interacts with the player controls (speed, seek, and clicking skip buttons) just like a user would. This prevents common ad blocker detection scripts from breaking the video player.
</details>

<details>
<summary><b>Why does the popup say "Extension Active" but ads aren't skipping?</b></summary>
<br>
1. Refresh the YouTube tab once after installing or reloading the extension.<br>
2. Ensure you are on <code>https://www.youtube.com/</code>.<br>
3. Open <code>chrome://extensions/</code> and ensure the extension toggle is enabled.
</details>

<details>
<summary><b>How can I edit or test changes to the code?</b></summary>
<br>
Any time you modify <code>content.js</code>, <code>popup.js</code>, or <code>manifest.json</code>:
1. Go to <code>chrome://extensions/</code>.
2. Click the 🔄 <b>Reload</b> icon on the YouTube Auto Skip card.
3. Refresh the YouTube page.
</details>

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


<div align="center">
  <sub>Built with ❤️ for a distraction-free YouTube experience.</sub>
</div>
