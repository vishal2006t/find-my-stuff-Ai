"""
Find My Stuff AI - Database Module & Initial Seed Data
SQLite schema and management for users, items, family nominees, and search history.
Enforces foreign key integrity, indexing, and realistic smart home demo datasets.
"""
import sqlite3
import os
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

DB_PATH = os.path.join(os.path.dirname(__file__), 'findmystuff.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'owner',
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Items Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        room TEXT NOT NULL,
        storage_location TEXT NOT NULL,
        notes TEXT,
        image_url TEXT,
        is_private INTEGER DEFAULT 0,
        tags TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
    ''')

    # Family Nominees Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS nominees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER NOT NULL,
        nominee_name TEXT NOT NULL,
        nominee_email TEXT NOT NULL,
        relationship TEXT NOT NULL,
        access_level TEXT DEFAULT 'view',
        allowed_categories TEXT DEFAULT 'all',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
    )
    ''')

    # Search History Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS search_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        query TEXT NOT NULL,
        result_count INTEGER DEFAULT 0,
        matched_item_name TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
    ''')

    # Performance Indices
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_items_room ON items(room);')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_nominees_owner ON nominees(owner_id);')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_nominees_email ON nominees(nominee_email);')

    conn.commit()

    # Seed initial demo accounts and items if database is fresh
    cursor.execute('SELECT COUNT(*) FROM users')
    if cursor.fetchone()[0] == 0:
        seed_sample_data(cursor)
        conn.commit()

    conn.close()

def seed_sample_data(cursor):
    # 1. Primary Owner: Alex Mercer
    owner_pw = generate_password_hash('password123')
    cursor.execute('''
        INSERT INTO users (name, email, password_hash, role, avatar)
        VALUES (?, ?, ?, 'owner', ?)
    ''', ('Alex Mercer', 'alex@smarthome.ai', owner_pw, 'user_avatar_1'))
    owner_id = cursor.lastrowid

    # 2. Nominee User: Sarah Mercer
    nominee_pw = generate_password_hash('password123')
    cursor.execute('''
        INSERT INTO users (name, email, password_hash, role, avatar)
        VALUES (?, ?, ?, 'nominee', ?)
    ''', ('Sarah Mercer', 'sarah@smarthome.ai', nominee_pw, 'user_avatar_2'))
    nominee_user_id = cursor.lastrowid

    # Add Nominee record linking Sarah to Alex
    cursor.execute('''
        INSERT INTO nominees (owner_id, nominee_name, nominee_email, relationship, access_level, allowed_categories, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (owner_id, 'Sarah Mercer', 'sarah@smarthome.ai', 'Spouse', 'full', 'all', 'active'))

    cursor.execute('''
        INSERT INTO nominees (owner_id, nominee_name, nominee_email, relationship, access_level, allowed_categories, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (owner_id, 'David Mercer', 'david@smarthome.ai', 'Brother', 'view', 'Electronics,Tools', 'pending'))

    # 3. Seed Realistic Smart Home Items
    sample_items = [
        (
            owner_id,
            "Passport & International Driving Permit",
            "Documents",
            "Master Bedroom",
            "Top drawer of walnut nightstand, inside dark grey RFID blocker pouch",
            "Renewed in 2025. Contains US visa and international driving permit. Essential for overseas travel.",
            "preset_passport",
            0,
            "passport, visa, id, travel document, permit, identity, identification, papers",
            "2026-11-15 10:30:00",
            "2026-11-15 10:30:00"
        ),
        (
            owner_id,
            "Car Key Fob & House Keys Bundle",
            "Keys & Wallets",
            "Living Room",
            "Magnetic key holder board right next to the entrance coat rack",
            "Includes BMW wireless key fob, front door high-security key, and mailbox key #14.",
            "preset_keys",
            0,
            "keys, car keys, house keys, keyfob, keychain, entrance, fob, door key, car",
            "2026-11-18 08:15:00",
            "2026-11-18 08:15:00"
        ),
        (
            owner_id,
            "MacBook Pro 140W USB-C Fast Charger",
            "Electronics",
            "Home Office",
            "Cable organizer tray beneath the motorized standing desk",
            "Includes braided 2-meter USB-C cable and MagSafe 3 adapter plug.",
            "preset_charger",
            0,
            "charger, laptop charger, macbook, usb-c, adapter, power brick, wire, cord, cable",
            "2026-11-17 14:20:00",
            "2026-11-17 14:20:00"
        ),
        (
            owner_id,
            "Samsung 4K Smart TV Remote Control",
            "Electronics",
            "Living Room",
            "Left armrest storage pocket of the main leather recliner sofa",
            "Solar-charging eco remote. Pairs via Bluetooth with the living room frame TV.",
            "preset_remote",
            0,
            "tv remote, remote, television remote, controller, samsung remote, clicker, remote control",
            "2026-11-19 09:00:00",
            "2026-11-19 09:00:00"
        ),
        (
            owner_id,
            "First Aid Kit & Emergency Prescription Medicine",
            "Medicine",
            "Kitchen",
            "Upper wall cabinet above refrigerator, rightmost clear plastic bin",
            "Contains antiseptic, bandages, allergy relief tablets, and digital thermometer. Expiry 2027.",
            "preset_medicine",
            0,
            "medicine, pills, allergy, first aid, tablets, prescription, medical, bandaids, pharmacy",
            "2026-11-10 11:00:00",
            "2026-11-10 11:00:00"
        ),
        (
            owner_id,
            "Cordless Power Drill & Screwdriver Bit Set",
            "Tools",
            "Garage",
            "Tool chest shelf 3, heavy-duty black Stanley case with yellow latch",
            "Includes 20V battery pack, charger dock, and 30-piece titanium drill bit set.",
            "preset_tools",
            0,
            "drill, power drill, tools, screwdriver, bits, hardware, stanley, repair, toolbox",
            "2026-11-05 16:45:00",
            "2026-11-05 16:45:00"
        ),
        (
            owner_id,
            "Sony WH-1000XM5 Noise Cancelling Headphones",
            "Electronics",
            "Master Bedroom",
            "Bedside charging stand on right shelf beside alarm clock",
            "Black carrying case. Connected to iPhone and iPad.",
            "preset_headphones",
            0,
            "headphones, earphones, sony, audio, headsets, music, noise cancelling, xm5",
            "2026-11-16 19:30:00",
            "2026-11-16 19:30:00"
        ),
        (
            owner_id,
            "Spare Vault Key & Property Deed Documents",
            "Valuables",
            "Home Office",
            "Fireproof steel safe inside lower credenza cabinet (PIN locked)",
            "Extremely sensitive. Contains original property agreement deed and spare safe deposit box brass key.",
            "preset_vault",
            1,
            "vault, deed, property, gold, safe, private, secret, property papers, documents",
            "2026-11-01 12:00:00",
            "2026-11-01 12:00:00"
        )
    ]

    for item in sample_items:
        cursor.execute('''
            INSERT INTO items (user_id, name, category, room, storage_location, notes, image_url, is_private, tags, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', item)

if __name__ == '__main__':
    print("Initializing Find My Stuff AI database with indices and FK support...")
    init_db()
    print("Database initialized successfully at:", DB_PATH)
