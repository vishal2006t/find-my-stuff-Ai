# Find My Stuff AI – Smart Home Item Finder 🏠🤖

A complete, modern, innovative, and attractive web application built with **HTML5, CSS3, JavaScript, Python Flask, and SQLite**.

**Find My Stuff AI** acts as an intelligent household memory assistant that helps users remember where they stored their everyday belongings (passports, car keys, laptop chargers, TV remotes, emergency medicine, tools, etc.). Users can retrieve their belongings instantly using natural language text search or voice search.

> **CRITICAL ARCHITECTURAL GUARANTEE:**
> The system strictly retrieves **actual verified saved records**. It never pretends to physically detect live objects through walls or cameras, and it **never fabricates fake locations**.

---

## 🌟 Key Highlights & Innovations

1. **AI Natural Language Smart Search**:
   - Understands natural phrasing: *"Where did I keep my passport?"*, *"Where are my house keys?"*, *"Find my travel document"*, *"Where is my television remote?"*.
   - Built-in **Synonym & Intent Recognition Engine** (e.g. *passport ↔ travel document / visa / id*, *keys ↔ keyfob / keychain*, *charger ↔ cable / adapter / wire / power brick*, *medicine ↔ allergy tablets / pills*).
   - Generates friendly, conversational AI synthesized responses highlighting the exact room and storage spot.
   - Strictly honest: If an item is not recorded, it replies *"No saved location found. Try another search or add this item."*

2. **Web Speech API Voice Search**:
   - One-tap microphone button with real-time speech recognition.
   - Glowing acoustic wave animations and synthesized audio feedback tones (via Web Audio API).

3. **Family / Nominee Access & Privacy**:
   - Share household storage locations with family members (spouse, children, roommates) without sharing master account passwords.
   - Individual nominee permission levels (*View Only* vs *Full Access*).
   - Sensitive items can be flagged as **Private** (hidden from nominees).
   - Includes a **Persona Switcher** to demonstrate the nominee perspective.

4. **Dual Engine (Zero-Configuration Fallback)**:
   - **Backend Mode**: Runs with Python Flask & SQLite with full REST APIs.
   - **Standalone Client Mode**: Automatically falls back to browser `localStorage` if opened directly in a browser or Live Server without starting Python!

5. **Futuristic Smart Home UI/UX**:
   - Dark Obsidian Navy palette (`#060a14`, `#0a1020`, `#0f182f`) with Electric Cyan (`#00f0ff`) and Cyber Purple (`#8b5cf6`) accents.
   - Glassmorphism panels with blur filters and neon borders.
   - Custom SVG illustrations for items and room categories.
   - 100% responsive for desktop, tablets, and smartphones.

---

## 📁 Project Structure

```text
d:\indhu PROJECT\
├── app.py                     # Python Flask backend server (REST APIs, NL search engine)
├── database.py                # SQLite schema setup and realistic demo seed data
├── findmystuff.db             # SQLite database (auto-generated)
├── requirements.txt           # Python dependencies (Flask, Werkzeug)
├── run.bat                    # One-click Windows runner
├── test_backend.py            # Automated API verification test suite
├── index.html                 # Standalone static SPA shell
├── README.md                  # Complete documentation and presentation guide
├── static/
│   ├── css/
│   │   ├── style.css          # Dark navy theme, glassmorphism, responsive grid
│   │   └── animations.css     # Glowing pulses, voice visualizer, radar sweeps
│   └── js/
│       ├── app.js             # Main SPA controller, view routing, CRUD operations
│       ├── api.js             # Unified client (Flask REST + localStorage fallback)
│       ├── smart_search.js    # Natural language parser & synonym scoring engine
│       ├── voice.js           # Web Speech API voice search controller
│       └── sample_data.js     # High-res SVG presets and offline demo seed data
└── templates/
    └── index.html             # Flask template shell
```

---

## 🚀 How to Run in VS Code (Step-by-Step)

### Option 1: Run with Python Flask Backend (Recommended)

1. Open the project folder in **Visual Studio Code**:
   ```bash
   code "d:\indhu PROJECT"
   ```
2. Open the built-in terminal (`Ctrl + ~` or **Terminal > New Terminal**).
3. (Optional) Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   python app.py
   ```
5. Open your web browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

*Or simply double-click **`run.bat`** on Windows!*

---

### Option 2: Run Standalone (No Python Setup Needed)

Because of the built-in dual-engine architecture:
1. Right-click **`index.html`** in VS Code.
2. Select **Open with Live Server** (or simply double-click `index.html` to open in Chrome/Edge/Firefox).
3. The application will automatically detect that Flask is offline and seamlessly initialize the high-performance local storage engine with pre-seeded demo records!

---

## 🧑‍💻 Pre-Seeded Demo Accounts for College Presentation

| Persona | Email | Password | Role & Permissions |
| :--- | :--- | :--- | :--- |
| **Alex Mercer** | `alex@smarthome.ai` | `password123` | **Homeowner Master** (Can view all 8 items, including private vault keys, manage nominees, add/edit/delete) |
| **Sarah Mercer** | `sarah@smarthome.ai` | `password123` | **Family Nominee** (Can view shared items; private items like vault deed documents are hidden) |

> 💡 **Quick Presentation Shortcut:** On the login page, you can simply click **"Homeowner (Alex)"** or **"Nominee (Sarah)"** for an instant one-click login!

---

## 📦 Pre-Seeded Sample Household Records

The system comes pre-loaded with realistic household items:

1. **Passport & International Driving Permit**
   - *Room:* Master Bedroom
   - *Location:* Top drawer of walnut nightstand, inside dark grey RFID blocker pouch
   - *Category:* Documents
2. **Car Key Fob & House Keys Bundle**
   - *Room:* Living Room
   - *Location:* Magnetic key holder board right next to the entrance coat rack
   - *Category:* Keys & Wallets
3. **MacBook Pro 140W USB-C Fast Charger**
   - *Room:* Home Office
   - *Location:* Cable organizer tray beneath the motorized standing desk
   - *Category:* Electronics
4. **Samsung 4K Smart TV Remote Control**
   - *Room:* Living Room
   - *Location:* Left armrest storage pocket of the main leather recliner sofa
   - *Category:* Electronics
5. **First Aid Kit & Emergency Prescription Medicine**
   - *Room:* Kitchen
   - *Location:* Upper wall cabinet above refrigerator, rightmost clear plastic bin
   - *Category:* Medicine
6. **Cordless Power Drill & Screwdriver Bit Set**
   - *Room:* Garage
   - *Location:* Tool chest shelf 3, heavy-duty black Stanley case with yellow latch
   - *Category:* Tools
7. **Sony WH-1000XM5 Noise Cancelling Headphones**
   - *Room:* Master Bedroom
   - *Location:* Bedside charging stand on right shelf beside alarm clock
   - *Category:* Electronics
8. **Spare Vault Key & Property Deed Documents**
   - *Room:* Home Office
   - *Location:* Fireproof steel safe inside lower credenza cabinet (PIN locked)
   - *Category:* Valuables *(Private - Owner Only)*

---

## 🎤 Suggested College Project Demonstration Script

Follow this 5-minute walkthrough to impress evaluators:

1. **Introduction & Login (Page 1)**:
   - Highlight the dark navy futuristic glassmorphism interface.
   - Click the quick **"Homeowner (Alex)"** button to log in.
2. **AI Smart Search (Page 2 & Page 5)**:
   - Click the microphone icon or type: `"Where did I keep my passport?"`.
   - Observe how the AI processes the query, finds the item, and delivers a natural language conversational summary:
     > *"Found it! Your Passport is stored in the Master Bedroom: Top drawer of walnut nightstand, inside dark grey RFID blocker pouch."*
   - Try synonym queries: `"Where is my travel document?"` or `"Find my laptop wire"`.
   - Try a non-existent item: `"Where is my spaceship?"` — show that the system **honestly states no location found** and never hallucinates.
3. **Add New Item (Page 3)**:
   - Click **"Add New Item"**.
   - Enter *"Rolex Watch"*, category *"Valuables"*, room *"Master Bedroom"*, location *"Top shelf of walk-in closet in black velvet box"*.
   - Click one of the quick preset illustrations or upload a photo, and click **"Save Item"**.
4. **My Saved Items (Page 4)**:
   - Demonstrate the filter toolbar: filter by room (e.g. *Garage*, *Kitchen*) and category.
   - Switch between **Grid** and **List** view.
   - Click **Edit** to modify a location and **Delete** to test removal.
5. **Family / Nominee Access & Privacy (Page 6)**:
   - Explain how household members shouldn't need the master password.
   - Click **"Test Family Nominee View (Sarah's Account)"**.
   - Notice that the *Spare Vault Key & Property Deed Documents* automatically disappears from search and listings because it was marked **Private**.
6. **Profile & Security (Page 7)**:
   - Show the **Passkey Biometric Setup Simulator** (FIDO2 / WebAuthn).
   - Click **"Export JSON"** to demonstrate automatic backup download.

---

## 🧪 Automated Testing

To run the automated test suite verifying all Flask REST endpoints, run:
```bash
python test_backend.py
```
Output:
```
[PASS] Route / returns HTML successfully
[PASS] Route /api/items returns 8 items
[PASS] Search for Passport matched: Master Bedroom -> Top drawer of walnut nightstand, inside dark grey RFID blocker pouch
[PASS] Search for Keys matched: Living Room -> Magnetic key holder board right next to the entrance coat rack
[PASS] Non-existent item returned honest message without fake locations
[PASS] Family API returned 2 nominees
[PASS] Stats API: 8 items, 5 rooms

ALL BACKEND API TESTS PASSED PERFECTLY!
```

---

## 🛡️ License & Academic Project Notice
Created for college project demonstration and smart home research.
All source code is fully documented and structured for easy extension with physical IoT sensors (RFID, Bluetooth LE beacons, NFC tags) in future versions.

