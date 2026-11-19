# Find My Stuff AI – Smart Home Item Finder 🏠🤖

A modern, intelligent, and user-friendly web application built with **HTML5, CSS3, JavaScript, Python Flask, and SQLite**.

**Find My Stuff AI** is a smart household memory assistant that helps users remember where they stored their everyday belongings, such as passports, car keys, laptop chargers, television remotes, medicines, and important documents.

Instead of searching the entire house, users can retrieve their saved item locations using natural-language text search or voice search.

> **Important Architectural Guarantee**
>
> The application retrieves actual saved records. It does not claim to physically detect objects through walls or cameras, and it never invents item locations. If an item has not been saved, the application clearly informs the user.

---

## 🌟 Key Features

### 1. AI-Powered Natural Language Search
- Search using everyday questions such as:
  - "Where did I keep my passport?"
  - "Where are my house keys?"
  - "Find my laptop charger."
  - "Where is my TV remote?"
- Built-in synonym and intent recognition.
- Recognizes related words, such as:
  - Passport → Travel document, ID, visa.
  - Keys → Keychain, key fob.
  - Charger → Cable, adapter, wire.
  - Medicine → Tablets, pills.
- Provides conversational responses containing the saved room and storage location.
- Returns an honest message when no matching record exists.

### 2. Voice Search
- Microphone-based voice search using the Web Speech API.
- Real-time speech recognition.
- Voice interaction animations.
- Audio feedback using the Web Audio API.

### 3. Family / Nominee Access
- Share household item locations with family members.
- Separate nominee permissions:
  - View Only
  - Full Access
- Mark sensitive items as Private.
- Private items remain hidden from nominees.
- Persona switcher to demonstrate different user perspectives.

### 4. Dual Storage Engine
The application supports two operating modes:

**Backend Mode**
- Python Flask backend.
- SQLite database.
- REST API integration.
- Persistent item records.

**Standalone Mode**
- Browser localStorage fallback.
- Can run without starting the Flask server.
- Useful for quick demonstrations and offline testing.

### 5. Modern Smart Home Interface
- Dark Obsidian Navy design.
- Electric Cyan and Cyber Purple accents.
- Glassmorphism panels.
- Neon borders and glowing animations.
- Custom SVG item illustrations.
- Responsive layouts for desktop, tablet, and mobile.

### 6. Item Management
- Add new household items.
- Edit saved item details.
- Delete unwanted records.
- Upload item photographs.
- Organize items by room and category.
- Grid and List viewing options.

### 7. Profile and Security
- Profile management interface.
- Family access controls.
- Passkey biometric setup simulator.
- JSON data export for backup.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling and responsive design |
| JavaScript | Frontend functionality |
| Python | Backend programming |
| Flask | REST API and web server |
| SQLite | Local database |
| Web Speech API | Voice recognition |
| Web Audio API | Audio feedback |
| localStorage | Standalone data storage |
| SVG | Item illustrations |

---

## 📁 Project Structure

```text
D:\indhu PROJECT\
│
├── app.py
├── database.py
├── requirements.txt
├── run.bat
├── test_backend.py
├── test_full_audit.py
├── index.html
├── README.md
│
├── static/
│   ├── css/
│   │   ├── style.css
│   │   └── animations.css
│   │
│   └── js/
│       ├── app.js
│       ├── api.js
│       ├── smart_search.js
│       ├── voice.js
│       └── sample_data.js
│
└── templates/
    └── index.html
```

**Important files:**
- `app.py` – Flask backend and REST API.
- `database.py` – SQLite database setup and sample data.
- `requirements.txt` – Python dependencies.
- `run.bat` – Windows application launcher.
- `test_backend.py` – Backend API tests.
- `test_full_audit.py` – Additional project audit tests.
- `index.html` – Standalone application interface.
- `static/css/` – Application styling and animations.
- `static/js/` – Frontend logic, search, and voice functionality.
- `templates/index.html` – Flask application template.

The SQLite database is generated locally when the application initializes.

---

## 🚀 Installation and Setup

### Requirements

- Windows 10 or Windows 11.
- Python 3 installed.
- Visual Studio Code (recommended).
- Google Chrome, Microsoft Edge, or another modern browser.

### Option 1: Run with Flask Backend (Recommended)

**Step 1 – Open the project**

Open Command Prompt and execute:

```cmd
cd /d "D:\indhu PROJECT"
```

**Step 2 – Install dependencies**

```cmd
pip install -r requirements.txt
```

**Step 3 – Start the application**

```cmd
python app.py
```

**Step 4 – Open the application**

Visit:

```text
http://127.0.0.1:5000
```

The application should now be accessible through your browser.

**Alternative:** You can also double-click `run.bat` to start the application on Windows.

### Option 2: Run Without Flask

The application also supports standalone browser mode.

1. Open the project folder in VS Code.
2. Locate `index.html`.
3. Right-click and select **Open with Live Server**.
4. Alternatively, open `index.html` directly in your browser.
5. The frontend can use browser localStorage when the Flask backend is unavailable.

Some browser features, including voice recognition, depend on browser support and permissions.

---

## 👥 Demo Accounts

The project includes the following sample accounts for demonstration:

| Persona | Email | Password | Access |
|---|---|---|---|
| Alex Mercer | `alex@smarthome.ai` | `password123` | Homeowner Master |
| Sarah Mercer | `sarah@smarthome.ai` | `password123` | Family Nominee |

**Homeowner Master:**
- View household items.
- Add, edit, and delete items.
- Manage nominees.
- Access private records.

**Family Nominee:**
- View shared household items.
- Cannot view private owner-only records.

> The login page also provides quick-login options for the Homeowner and Nominee demo personas.

These are demonstration credentials, not production account credentials.

---

## 🏠 Sample Household Records

The application includes sample household records to demonstrate its item-search functionality.

| No. | Item | Room | Saved Location |
|---|---|---|---|
| 1 | Passport and International Driving Permit | Master Bedroom | Top drawer of walnut nightstand, inside dark grey RFID blocker pouch |
| 2 | Car Key Fob and House Keys Bundle | Living Room | Magnetic key holder board next to the entrance coat rack |
| 3 | MacBook Pro 140W USB-C Fast Charger | Home Office | Cable organizer tray beneath the standing desk |
| 4 | Samsung 4K Smart TV Remote Control | Living Room | Left armrest storage pocket of the main sofa |
| 5 | First Aid Kit and Emergency Medicine | Kitchen | Upper wall cabinet above refrigerator |
| 6 | Cordless Power Drill and Screwdriver Set | Garage | Tool chest shelf 3, inside a black tool case |
| 7 | Sony WH-1000XM5 Headphones | Master Bedroom | Bedside charging stand beside the alarm clock |
| 8 | Spare Vault Key and Property Deed Documents | Home Office | Fireproof steel safe inside lower credenza cabinet |

The final record is marked **Private – Owner Only** in the demonstration data.

---

## 🎤 College Project Demonstration

The following five-minute demonstration can be used during a college project presentation.

### 1. Introduction and Login
- Introduce Find My Stuff AI.
- Explain the problem of forgetting where household items are stored.
- Show the modern dashboard.
- Log in using the Homeowner demo account.

### 2. Demonstrate Smart Search
Try the following questions:

```text
Where did I keep my passport?
Where are my house keys?
Where is my laptop charger?
Find my travel document.
```

Show how the application retrieves the saved room and storage location.

Also try:

```text
Where is my spaceship?
```

The application should clearly state that no saved location was found rather than generating a fake answer.

### 3. Add a New Item
1. Select Add New Item.
2. Enter an item name, for example, Rolex Watch.
3. Select the category.
4. Enter the room.
5. Enter the exact storage location.
6. Upload a photograph if required.
7. Save the item.

### 4. Manage Saved Items
Demonstrate:
- Viewing saved items.
- Filtering by room.
- Filtering by category.
- Switching between Grid and List views.
- Editing an item's location.
- Deleting an item.

### 5. Demonstrate Family Access
- Switch to the Nominee perspective.
- Show shared household records.
- Explain View Only and Full Access permissions.
- Demonstrate that private records are hidden from the nominee.

### 6. Profile and Security
- Open the profile and security section.
- Demonstrate the passkey setup simulator.
- Show the JSON export option.

---

## 🧪 Testing

The project includes automated test files for checking backend functionality.

### Run Backend Tests

Open the project terminal:

```cmd
cd /d "D:\indhu PROJECT"
```

Run:

```cmd
python test_backend.py
```

The documented test scenarios include:

- Flask home route returns HTML.
- Items API returns the sample records.
- Passport search retrieves its saved location.
- Keys search retrieves its saved location.
- Missing items return an honest response.
- Family API returns nominee information.
- Statistics API returns item and room counts.

### Additional Audit Tests

```cmd
python test_full_audit.py
```

Use the test output to verify the current project state.

---

## 🔐 Privacy and Security Considerations

- The application uses saved records rather than pretending to physically detect objects.
- Private household items are intended to remain hidden from nominees.
- Nominee access is separated by permission level.
- SQLite provides local database storage.
- JSON export supports data backup.

**Production deployment considerations:**
- Replace demonstration credentials with secure account registration.
- Store passwords using appropriate password hashing.
- Use secure session or token handling.
- Validate uploaded files and restrict file types and sizes.
- Protect private APIs with server-side authorization.
- Use HTTPS in production.
- Keep database files and environment secrets out of public Git repositories.

The passkey interface is described as a simulator; it should not be treated as proof of a production WebAuthn implementation.

---

## 🔮 Future Enhancements

Possible future improvements include:

1. AI-based item recommendation and improved search.
2. Real-time family synchronization.
3. Cloud database integration.
4. RFID-based item tracking.
5. Bluetooth Low Energy (BLE) beacon integration.
6. NFC tag-based item identification.
7. Mobile application support.
8. Advanced voice assistant integration.
9. Secure cloud backup and recovery.
10. More advanced household access management.

These are proposed enhancements and are not claims that the integrations are already implemented.

---

## 📌 Project Information

**Project Name:** Find My Stuff AI – Smart Home Item Finder

**Category:** Smart Home / Web Application

**Frontend:** HTML, CSS, JavaScript

**Backend:** Python Flask

**Database:** SQLite

**Purpose:** Help users remember and retrieve the saved locations of household belongings.

**Project Type:** Academic / Educational Project

---

## 📄 License and Academic Notice

Created for college project demonstration, educational purposes, and smart home research.

The application is designed with an extensible architecture that can support future integration with physical IoT technologies such as RFID, Bluetooth Low Energy beacons, and NFC tags.

---

**Find My Stuff AI – Never Forget Where You Kept It! 🏠🤖**