/**
 * Find My Stuff AI - Built-in Sample Data, Presets, and Vector Illustrations
 * High-resolution SVG item representations and demo dataset for seamless local and backend operation.
 * All SVGs are cleanly URL-encoded so they never break HTML attribute parsing or show broken image icons.
 */

// Helper to create safe, clean SVG Data URIs
function makeSvgDataUri(svgContent) {
    const cleaned = svgContent.replace(/\s+/g, ' ').trim();
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleaned)}`;
}

// Raw SVG Definitions for Presets & Category Fallbacks
const RAW_SVGS = {
    // 1. Passport & Travel Documents
    preset_passport: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="100%" height="100%">
        <defs>
            <linearGradient id="bg_pass" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0b1329"/>
                <stop offset="100%" stop-color="#060913"/>
            </linearGradient>
            <linearGradient id="book_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1e3a8a"/>
                <stop offset="100%" stop-color="#0f172a"/>
            </linearGradient>
            <linearGradient id="gold_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fde047"/>
                <stop offset="100%" stop-color="#ca8a04"/>
            </linearGradient>
        </defs>
        <rect width="400" height="260" fill="url(#bg_pass)"/>
        <!-- Passport Booklet -->
        <g transform="translate(130, 25)">
            <rect x="0" y="0" width="140" height="205" rx="10" fill="url(#book_grad)" stroke="#38bdf8" stroke-width="2"/>
            <rect x="6" y="6" width="128" height="193" rx="6" fill="none" stroke="#fde047" stroke-opacity="0.3" stroke-width="1"/>
            <!-- Crest & Emblem -->
            <circle cx="70" cy="85" r="30" fill="none" stroke="url(#gold_grad)" stroke-width="2.5"/>
            <ellipse cx="70" cy="85" rx="15" ry="30" fill="none" stroke="url(#gold_grad)" stroke-width="1.5"/>
            <line x1="40" y1="85" x2="100" y2="85" stroke="url(#gold_grad)" stroke-width="1.5"/>
            <line x1="45" y1="70" x2="95" y2="70" stroke="url(#gold_grad)" stroke-width="1.2"/>
            <line x1="45" y1="100" x2="95" y2="100" stroke="url(#gold_grad)" stroke-width="1.2"/>
            <!-- Text -->
            <text x="70" y="36" fill="#fde047" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" text-anchor="middle" letter-spacing="3">PASSPORT</text>
            <text x="70" y="160" fill="#fde047" font-family="system-ui, sans-serif" font-size="8" font-weight="600" text-anchor="middle" letter-spacing="2">OFFICIAL DOCUMENT</text>
            <!-- Biometric Chip Symbol -->
            <rect x="61" y="128" width="18" height="12" rx="2" fill="none" stroke="#fde047" stroke-width="1.2"/>
            <circle cx="70" cy="134" r="2.5" fill="#fde047"/>
        </g>
    </svg>`,

    // 2. Car Keys & Keychain
    preset_keys: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="100%" height="100%">
        <defs>
            <linearGradient id="bg_keys" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0b1329"/>
                <stop offset="100%" stop-color="#060913"/>
            </linearGradient>
            <linearGradient id="silver_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#f8fafc"/>
                <stop offset="50%" stop-color="#94a3b8"/>
                <stop offset="100%" stop-color="#475569"/>
            </linearGradient>
            <linearGradient id="fob_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1e293b"/>
                <stop offset="100%" stop-color="#090d16"/>
            </linearGradient>
        </defs>
        <rect width="400" height="260" fill="url(#bg_keys)"/>
        <!-- Ring -->
        <circle cx="160" cy="95" r="32" fill="none" stroke="url(#silver_grad)" stroke-width="6"/>
        <!-- Car Key Fob -->
        <g transform="translate(195, 80) rotate(22)">
            <rect x="0" y="0" width="58" height="105" rx="20" fill="url(#fob_grad)" stroke="#00f0ff" stroke-width="2"/>
            <circle cx="29" cy="32" r="10" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
            <path d="M25 32 L33 32 M29 28 L29 36" stroke="#38bdf8" stroke-width="2"/>
            <circle cx="29" cy="62" r="8" fill="#0f172a" stroke="#94a3b8" stroke-width="1"/>
            <rect x="22" y="82" width="14" height="6" rx="2" fill="#ef4444"/>
        </g>
        <!-- Metallic House Key -->
        <g transform="translate(142, 115) rotate(-18)">
            <circle cx="15" cy="15" r="16" fill="url(#silver_grad)"/>
            <circle cx="15" cy="15" r="6" fill="#090d16"/>
            <rect x="11" y="28" width="8" height="75" fill="url(#silver_grad)"/>
            <polygon points="19,55 26,55 19,65" fill="url(#silver_grad)"/>
            <polygon points="19,75 28,75 19,85" fill="url(#silver_grad)"/>
            <polygon points="19,92 25,92 19,98" fill="url(#silver_grad)"/>
        </g>
    </svg>`,

    // 3. Charger & USB-C Cable
    preset_charger: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="100%" height="100%">
        <defs>
            <linearGradient id="bg_chg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0b1329"/>
                <stop offset="100%" stop-color="#060913"/>
            </linearGradient>
            <linearGradient id="adapter_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="100%" stop-color="#cbd5e1"/>
            </linearGradient>
        </defs>
        <rect width="400" height="260" fill="url(#bg_chg)"/>
        <!-- Power Brick -->
        <g transform="translate(100, 60)">
            <rect x="0" y="0" width="100" height="105" rx="14" fill="url(#adapter_grad)" stroke="#94a3b8" stroke-width="2"/>
            <circle cx="50" cy="52" r="18" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="2 3"/>
            <rect x="40" y="47" width="20" height="10" rx="3" fill="#64748b"/>
            <!-- Wall Prongs -->
            <rect x="-18" y="30" width="18" height="7" rx="2" fill="#94a3b8"/>
            <rect x="-18" y="65" width="18" height="7" rx="2" fill="#94a3b8"/>
        </g>
        <!-- Braided Cyan Cable Curve -->
        <path d="M 200 112 C 255 112, 280 155, 255 195 C 225 235, 145 220, 180 180 C 205 150, 305 170, 305 85" fill="none" stroke="#00f0ff" stroke-width="6" stroke-linecap="round"/>
        <!-- USB-C Tip -->
        <g transform="translate(296, 55)">
            <rect x="4" y="10" width="10" height="20" rx="3" fill="#64748b"/>
            <rect x="6" y="0" width="6" height="10" rx="1.5" fill="#f8fafc"/>
        </g>
    </svg>`,

    // 4. TV Remote Controller
    preset_remote: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="100%" height="100%">
        <defs>
            <linearGradient id="bg_rem" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0b1329"/>
                <stop offset="100%" stop-color="#060913"/>
            </linearGradient>
            <linearGradient id="rem_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1e293b"/>
                <stop offset="100%" stop-color="#090d16"/>
            </linearGradient>
        </defs>
        <rect width="400" height="260" fill="url(#bg_rem)"/>
        <!-- Remote Body -->
        <g transform="translate(155, 20)">
            <rect x="0" y="0" width="90" height="215" rx="18" fill="url(#rem_grad)" stroke="#475569" stroke-width="2"/>
            <!-- Power & Mic -->
            <circle cx="26" cy="26" r="9" fill="#ef4444"/>
            <circle cx="64" cy="26" r="9" fill="#0f172a" stroke="#00f0ff" stroke-width="1.5"/>
            <!-- D-Pad Navigation Wheel -->
            <circle cx="45" cy="78" r="26" fill="#090d16" stroke="#38bdf8" stroke-width="2"/>
            <circle cx="45" cy="78" r="10" fill="#334155"/>
            <!-- Volume / Channel Buttons -->
            <rect x="18" y="118" width="16" height="36" rx="6" fill="#090d16" stroke="#64748b" stroke-width="1"/>
            <rect x="56" y="118" width="16" height="36" rx="6" fill="#090d16" stroke="#64748b" stroke-width="1"/>
            <!-- App Streaming Buttons -->
            <rect x="18" y="165" width="24" height="13" rx="3" fill="#e11d48"/>
            <rect x="48" y="165" width="24" height="13" rx="3" fill="#0284c7"/>
            <rect x="18" y="184" width="24" height="13" rx="3" fill="#eab308"/>
            <rect x="48" y="184" width="24" height="13" rx="3" fill="#10b981"/>
        </g>
    </svg>`,

    // 5. Medicine & First Aid
    preset_medicine: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="100%" height="100%">
        <defs>
            <linearGradient id="bg_med" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0b1329"/>
                <stop offset="100%" stop-color="#060913"/>
            </linearGradient>
            <linearGradient id="bottle_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#f97316"/>
                <stop offset="100%" stop-color="#9a3412"/>
            </linearGradient>
        </defs>
        <rect width="400" height="260" fill="url(#bg_med)"/>
        <!-- Pill Bottle -->
        <g transform="translate(120, 45)">
            <rect x="0" y="24" width="85" height="135" rx="10" fill="url(#bottle_grad)" stroke="#ea580c" stroke-width="2"/>
            <rect x="10" y="6" width="65" height="20" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
            <!-- White Medical Label -->
            <rect x="8" y="48" width="69" height="80" rx="4" fill="#ffffff" fill-opacity="0.95"/>
            <rect x="34" y="62" width="16" height="38" fill="#ef4444"/>
            <rect x="23" y="73" width="38" height="16" fill="#ef4444"/>
            <line x1="18" y1="110" x2="68" y2="110" stroke="#94a3b8" stroke-width="2"/>
        </g>
        <!-- Blister Tablets Pack -->
        <g transform="translate(225, 75) rotate(14)">
            <rect x="0" y="0" width="76" height="105" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
            <circle cx="24" cy="24" r="9" fill="#00f0ff"/>
            <circle cx="52" cy="24" r="9" fill="#00f0ff"/>
            <circle cx="24" cy="52" r="9" fill="#10b981"/>
            <circle cx="52" cy="52" r="9" fill="#10b981"/>
            <circle cx="24" cy="80" r="9" fill="#facc15"/>
            <circle cx="52" cy="80" r="9" fill="#facc15"/>
        </g>
    </svg>`,

    // 6. Hardware & Tools
    preset_tools: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="100%" height="100%">
        <defs>
            <linearGradient id="bg_tool" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0b1329"/>
                <stop offset="100%" stop-color="#060913"/>
            </linearGradient>
            <linearGradient id="drill_body" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#facc15"/>
                <stop offset="100%" stop-color="#ca8a04"/>
            </linearGradient>
        </defs>
        <rect width="400" height="260" fill="url(#bg_tool)"/>
        <!-- Cordless Drill -->
        <g transform="translate(110, 40)">
            <!-- Drill Bit & Chuck -->
            <rect x="175" y="42" width="35" height="14" rx="2" fill="#475569"/>
            <polygon points="210,47 240,49 210,51" fill="#94a3b8"/>
            <!-- Drill Body -->
            <path d="M 25 25 L 175 25 L 175 70 L 115 70 L 100 145 L 55 145 L 65 70 L 25 70 Z" fill="url(#drill_body)" stroke="#a16207" stroke-width="2"/>
            <!-- Battery Base -->
            <rect x="45" y="145" width="65" height="32" rx="6" fill="#090d16" stroke="#334155" stroke-width="2"/>
            <!-- Grip Textures -->
            <line x1="72" y1="90" x2="90" y2="90" stroke="#090d16" stroke-width="3"/>
            <line x1="74" y1="105" x2="92" y2="105" stroke="#090d16" stroke-width="3"/>
            <line x1="76" y1="120" x2="94" y2="120" stroke="#090d16" stroke-width="3"/>
            <!-- Trigger -->
            <rect x="100" y="75" width="12" height="15" rx="3" fill="#ef4444"/>
        </g>
    </svg>`,

    // 7. Headphones & Audio
    preset_headphones: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="100%" height="100%">
        <defs>
            <linearGradient id="bg_audio" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0b1329"/>
                <stop offset="100%" stop-color="#060913"/>
            </linearGradient>
            <linearGradient id="earcup_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1e293b"/>
                <stop offset="100%" stop-color="#090d16"/>
            </linearGradient>
        </defs>
        <rect width="400" height="260" fill="url(#bg_audio)"/>
        <!-- Arc Headband -->
        <path d="M 125 160 A 80 80 0 0 1 275 160" fill="none" stroke="#475569" stroke-width="14" stroke-linecap="round"/>
        <path d="M 130 152 A 75 75 0 0 1 270 152" fill="none" stroke="#00f0ff" stroke-width="4" stroke-linecap="round"/>
        <!-- Left Earcup -->
        <g transform="translate(95, 140)">
            <rect x="0" y="0" width="34" height="60" rx="17" fill="url(#earcup_grad)" stroke="#a855f7" stroke-width="2.5"/>
            <rect x="22" y="5" width="12" height="50" rx="6" fill="#090d16"/>
        </g>
        <!-- Right Earcup -->
        <g transform="translate(271, 140)">
            <rect x="0" y="0" width="34" height="60" rx="17" fill="url(#earcup_grad)" stroke="#a855f7" stroke-width="2.5"/>
            <rect x="0" y="5" width="12" height="50" rx="6" fill="#090d16"/>
        </g>
    </svg>`,

    // 8. Vault & Safe Valuables
    preset_vault: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="100%" height="100%">
        <defs>
            <linearGradient id="bg_safe" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0b1329"/>
                <stop offset="100%" stop-color="#060913"/>
            </linearGradient>
            <linearGradient id="safe_door" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#334155"/>
                <stop offset="100%" stop-color="#0f172a"/>
            </linearGradient>
        </defs>
        <rect width="400" height="260" fill="url(#bg_safe)"/>
        <!-- Safe Box -->
        <g transform="translate(120, 35)">
            <rect x="0" y="0" width="160" height="185" rx="12" fill="url(#safe_door)" stroke="#94a3b8" stroke-width="3"/>
            <!-- Dial -->
            <circle cx="80" cy="90" r="36" fill="#090d16" stroke="#00f0ff" stroke-width="3"/>
            <circle cx="80" cy="90" r="20" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
            <circle cx="80" cy="90" r="5" fill="#00f0ff"/>
            <line x1="80" y1="58" x2="80" y2="66" stroke="#00f0ff" stroke-width="2"/>
            <line x1="80" y1="114" x2="80" y2="122" stroke="#00f0ff" stroke-width="2"/>
            <line x1="48" y1="90" x2="56" y2="90" stroke="#00f0ff" stroke-width="2"/>
            <line x1="104" y1="90" x2="112" y2="90" stroke="#00f0ff" stroke-width="2"/>
            <!-- Bolt Latch -->
            <rect x="128" y="75" width="12" height="28" rx="3" fill="#cbd5e1"/>
            <!-- LEDs -->
            <circle cx="30" cy="28" r="4" fill="#10b981"/>
            <circle cx="45" cy="28" r="4" fill="#ef4444" fill-opacity="0.3"/>
        </g>
    </svg>`,

    // 9. Generic Smart Storage Box
    preset_box: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="100%" height="100%">
        <defs>
            <linearGradient id="bg_box" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0b1329"/>
                <stop offset="100%" stop-color="#060913"/>
            </linearGradient>
            <linearGradient id="box_top" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0284c7"/>
                <stop offset="100%" stop-color="#0369a1"/>
            </linearGradient>
        </defs>
        <rect width="400" height="260" fill="url(#bg_box)"/>
        <!-- 3D Storage Box with Smart Beacon -->
        <g transform="translate(125, 45)">
            <polygon points="10,50 75,15 140,50 75,85" fill="#38bdf8" stroke="#0284c7" stroke-width="2"/>
            <polygon points="10,50 75,85 75,150 10,115" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
            <polygon points="140,50 75,85 75,150 140,115" fill="#0369a1" stroke="#075985" stroke-width="2"/>
            <!-- Pulsing Cyan Smart Home Beacon Sensor -->
            <circle cx="75" cy="70" r="10" fill="#00f0ff" fill-opacity="0.9"/>
            <circle cx="75" cy="70" r="18" fill="none" stroke="#00f0ff" stroke-width="2" stroke-opacity="0.5"/>
            <circle cx="75" cy="70" r="26" fill="none" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="3 3" stroke-opacity="0.3"/>
        </g>
    </svg>`
};

// Category-Specific Beautiful Fallback Vector SVGs
const CATEGORY_FALLBACK_SVGS = {
    'documents': RAW_SVGS.preset_passport,
    'electronics': RAW_SVGS.preset_charger,
    'keys & wallets': RAW_SVGS.preset_keys,
    'tools': RAW_SVGS.preset_tools,
    'medicine': RAW_SVGS.preset_medicine,
    'valuables': RAW_SVGS.preset_vault,
    'apparel': RAW_SVGS.preset_headphones,
    'miscellaneous': RAW_SVGS.preset_box
};

// Build compiled PRESET_ILLUSTRATIONS map using safe URL encoding
const PRESET_ILLUSTRATIONS = {};
for (const [key, svg] of Object.entries(RAW_SVGS)) {
    PRESET_ILLUSTRATIONS[key] = makeSvgDataUri(svg);
}

// Global Category Fallback Resolver (returns clean data URI)
function getCategoryFallback(category) {
    const catKey = (category || 'miscellaneous').toLowerCase().trim();
    const rawSvg = CATEGORY_FALLBACK_SVGS[catKey] || RAW_SVGS.preset_box;
    return makeSvgDataUri(rawSvg);
}

// Helper function to resolve any image URL safely without EVER breaking
function resolveItemImage(url, category = 'Miscellaneous') {
    if (!url || typeof url !== 'string' || url.trim() === '') {
        return getCategoryFallback(category);
    }

    const trimmed = url.trim();

    // 1. Is it a preset key? (e.g. 'preset_passport')
    if (trimmed.startsWith('preset_')) {
        return PRESET_ILLUSTRATIONS[trimmed] || getCategoryFallback(category);
    }

    // 2. Is it a Base64 data URI? (e.g. user photograph upload)
    if (trimmed.startsWith('data:image/')) {
        // If it's an unencoded SVG data URI with double quotes, fix it
        if (trimmed.startsWith('data:image/svg+xml;utf8,<svg') || trimmed.includes('<svg')) {
            const svgContent = trimmed.replace(/^data:image\/svg\+xml;utf8,/, '');
            return makeSvgDataUri(svgContent);
        }
        return trimmed;
    }

    // 3. Regular HTTP/HTTPS URL or local path
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('./')) {
        return trimmed;
    }

    // Fallback to category illustration
    return getCategoryFallback(category);
}

// Initial Demo Dataset for Client Storage (mirrors SQLite seed)
const INITIAL_DEMO_DATA = {
    users: [
        {
            id: 1,
            name: "Alex Mercer",
            email: "alex@smarthome.ai",
            password: "password123",
            role: "owner",
            avatar: "user_avatar_1"
        },
        {
            id: 2,
            name: "Sarah Mercer",
            email: "sarah@smarthome.ai",
            password: "password123",
            role: "nominee",
            avatar: "user_avatar_2"
        }
    ],
    items: [
        {
            id: 1,
            user_id: 1,
            name: "Passport & International Driving Permit",
            category: "Documents",
            room: "Master Bedroom",
            storage_location: "Top drawer of walnut nightstand, inside dark grey RFID blocker pouch",
            notes: "Renewed in 2025. Contains US visa and international driving permit. Essential for overseas travel.",
            image_url: "preset_passport",
            is_private: 0,
            tags: "passport, visa, id, travel document, permit, identity, identification, papers",
            created_at: "2026-11-15 10:30:00",
            updated_at: "2026-11-15 10:30:00"
        },
        {
            id: 2,
            user_id: 1,
            name: "Car Key Fob & House Keys Bundle",
            category: "Keys & Wallets",
            room: "Living Room",
            storage_location: "Magnetic key holder board right next to the entrance coat rack",
            notes: "Includes BMW wireless key fob, front door high-security key, and mailbox key #14.",
            image_url: "preset_keys",
            is_private: 0,
            tags: "keys, car keys, house keys, keyfob, keychain, entrance, fob, door key, car",
            created_at: "2026-11-18 08:15:00",
            updated_at: "2026-11-18 08:15:00"
        },
        {
            id: 3,
            user_id: 1,
            name: "MacBook Pro 140W USB-C Fast Charger",
            category: "Electronics",
            room: "Home Office",
            storage_location: "Cable organizer tray beneath the motorized standing desk",
            notes: "Includes braided 2-meter USB-C cable and MagSafe 3 adapter plug.",
            image_url: "preset_charger",
            is_private: 0,
            tags: "charger, laptop charger, macbook, usb-c, adapter, power brick, wire, cord, cable",
            created_at: "2026-11-17 14:20:00",
            updated_at: "2026-11-17 14:20:00"
        },
        {
            id: 4,
            user_id: 1,
            name: "Samsung 4K Smart TV Remote Control",
            category: "Electronics",
            room: "Living Room",
            storage_location: "Left armrest storage pocket of the main leather recliner sofa",
            notes: "Solar-charging eco remote. Pairs via Bluetooth with the living room frame TV.",
            image_url: "preset_remote",
            is_private: 0,
            tags: "tv remote, remote, television remote, controller, samsung remote, clicker, remote control",
            created_at: "2026-11-19 09:00:00",
            updated_at: "2026-11-19 09:00:00"
        },
        {
            id: 5,
            user_id: 1,
            name: "First Aid Kit & Emergency Prescription Medicine",
            category: "Medicine",
            room: "Kitchen",
            storage_location: "Upper wall cabinet above refrigerator, rightmost clear plastic bin",
            notes: "Contains antiseptic, bandages, allergy relief tablets, and digital thermometer. Expiry 2027.",
            image_url: "preset_medicine",
            is_private: 0,
            tags: "medicine, pills, allergy, first aid, tablets, prescription, medical, bandaids, pharmacy",
            created_at: "2026-11-10 11:00:00",
            updated_at: "2026-11-10 11:00:00"
        },
        {
            id: 6,
            user_id: 1,
            name: "Cordless Power Drill & Screwdriver Bit Set",
            category: "Tools",
            room: "Garage",
            storage_location: "Tool chest shelf 3, heavy-duty black Stanley case with yellow latch",
            notes: "Includes 20V battery pack, charger dock, and 30-piece titanium drill bit set.",
            image_url: "preset_tools",
            is_private: 0,
            tags: "drill, power drill, tools, screwdriver, bits, hardware, stanley, repair, toolbox",
            created_at: "2026-11-05 16:45:00",
            updated_at: "2026-11-05 16:45:00"
        },
        {
            id: 7,
            user_id: 1,
            name: "Sony WH-1000XM5 Noise Cancelling Headphones",
            category: "Electronics",
            room: "Master Bedroom",
            storage_location: "Bedside charging stand on right shelf beside alarm clock",
            notes: "Black carrying case. Connected to iPhone and iPad.",
            image_url: "preset_headphones",
            is_private: 0,
            tags: "headphones, earphones, sony, audio, headsets, music, noise cancelling, xm5",
            created_at: "2026-11-16 19:30:00",
            updated_at: "2026-11-16 19:30:00"
        },
        {
            id: 8,
            user_id: 1,
            name: "Spare Vault Key & Property Deed Documents",
            category: "Valuables",
            room: "Home Office",
            storage_location: "Fireproof steel safe inside lower credenza cabinet (PIN locked)",
            notes: "Extremely sensitive. Contains original property agreement deed and spare safe deposit box brass key.",
            image_url: "preset_vault",
            is_private: 1,
            tags: "vault, deed, property, gold, safe, private, secret, property papers, documents",
            created_at: "2026-11-01 12:00:00",
            updated_at: "2026-11-01 12:00:00"
        }
    ],
    nominees: [
        {
            id: 1,
            owner_id: 1,
            nominee_name: "Sarah Mercer",
            nominee_email: "sarah@smarthome.ai",
            relationship: "Spouse",
            access_level: "full",
            allowed_categories: "all",
            status: "active",
            created_at: "2026-11-01 10:00:00"
        },
        {
            id: 2,
            owner_id: 1,
            nominee_name: "David Mercer",
            nominee_email: "david@smarthome.ai",
            relationship: "Brother",
            access_level: "view",
            allowed_categories: "Electronics,Tools",
            status: "pending",
            created_at: "2026-11-14 15:30:00"
        }
    ]
};
