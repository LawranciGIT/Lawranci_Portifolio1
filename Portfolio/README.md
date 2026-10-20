# 🕹️ RETRO.WAVE // 90s Synthwave Portfolio & Creative Showcase

A fully responsive, highly polished creative showcase web application styled in an authentic **Synthwave / 90s Retro Aesthetic** with neon purples, hot pinks, cyan/electric blue glows, dark wireframe grid lines, CRT scanlines, and retro pixel arcade fonts.

---

## 🌟 Key Features

### 1. Header & Profile Dossier (Top of Page)
- **Visuals:** 3D animated perspective grid floor, striped retro neon sunset, starry cosmos, and an authentic CRT scanline overlay with a one-click toggle (`📺 CRT [ON/OFF]`).
- **Personal Info Display:**
  - Full Name: *Alex 'CyberViper' Sterling*
  - Nickname: *@CYBER_VIPER_94*
  - Age: *26 YRS*
  - Nationality: *Neo-Tokyo / Brazil*
  - Role: *Lead Game Architect & Sci-Fi Author*
  - Stats: HP Pool, MP Pool, High Score, Level 99 status.
  - Holographic avatar with rotating cyber borders and corner reticles.

### 2. Search & Filterable Sections
- **Games Vault (`#games`):**
  - Real-time search bar (filters by title, engine, platform, release year, tags).
  - Sub-category tabs: **ALL GAMES**, **OFFICIAL GAMES**, **FANGAMES**.
  - Interactive 16-bit cartridge card styling, retro badges, star ratings, and detailed modal preview (`PLAY DEMO / INFO`).
- **Cyberpunk Archives // Books (`#books`):**
  - Real-time search bar (filters by title, author, synopsis, genre).
  - Sub-category tabs: **ALL BOOKS**, **ORIGINAL BOOKS**, **FANBOOKS**.
  - Holographic book jacket styling with spine illusion, page counts, and full synopsis reader modal (`READ SYNOPSIS`).

### 3. User Roles & Admin (ADM) Mode
- **Role Switcher / Login:** `🔒 ADM LOGIN` button in the top navigation.
- **Terminal Authentication:** Retro digital keypad with master passcode protection (Default PIN: `1984` or `admin`).
- **Admin Capabilities:**
  - **Direct Card Controls:** When ADM is active, each game and book card displays glowing `[EDIT]` and `[DEL]` buttons.
  - **Item Editor Modal:** Add or edit titles, categories, release dates, platform/pages, tags, external store/play links, and about/synopsis text.
  - **Cover Image Upload & URL:** Supports image URLs as well as direct local file uploads (converted into base64).
  - **Profile Editor:** Edit your name, nickname, age, nationality, role, bio, and avatar.
  - **Full Persistence:** All modifications are saved to `localStorage` (`synthwave_portfolio_master_v1`) and survive page reloads.
  - **Data Backup & Reset:** Export entire dataset as JSON, import JSON backups, or reset to factory defaults.

### 4. Footer & Arcade Contact Channels
- 3D arcade push-button links with neon glows:
  - 📺 **YouTube Channel**
  - 💬 **Discord Server**
  - 📱 **WhatsApp Direct Chat**
  - ✉️ **Email Direct Mailto**
- Interactive terminal transmission form.
- High score marquee (*HIGH SCORE: 999,990*) and *INSERT COIN TO CONTINUE [99]*.

### 5. Web Audio API Sound Synthesizer
- **Interactive UI Audio:** 8-bit blip sounds on hover, arcade select clicks, dual-tone coin insertion chime on ADM unlock, error buzzers, and achievement chimes.
- **Ambient Synthwave BGM (`🎵 BGM [START]`):** Real-time synthesized analog chord progression and arpeggiator directly generated in the browser using the Web Audio API without needing external audio files.

---

## 🚀 How to Run Locally

```bash
# Start local dev server
npm run dev
# Or with any static file server:
npx serve . -p 5173
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
