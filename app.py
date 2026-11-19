"""
Find My Stuff AI - Flask Backend Server
RESTful API for Smart Home Item Finder with SQLite, Smart NL Search, Family Nominee Access.
Secured against IDOR, XSS, injection, with strict nominee isolation and natural language accuracy.
"""
from flask import Flask, render_template, request, jsonify, session, send_from_directory
import os
import re
import datetime
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db_connection, init_db, seed_sample_data

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = os.environ.get('SECRET_KEY', 'findmystuff-secret-key-2026-secure-token')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max for image uploads
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Ensure DB initialized
init_db()

# Comprehensive Synonyms & Keyword Dictionary for Smart NL Search
SYNONYMS = {
    'passport': ['passport', 'travel document', 'visa', 'id', 'identification', 'permit', 'papers', 'boarding'],
    'keys': ['key', 'keys', 'car keys', 'house keys', 'keychain', 'keyfob', 'fob', 'car key', 'door key', 'lock'],
    'charger': ['charger', 'cable', 'cord', 'wire', 'adapter', 'power brick', 'usb-c', 'magsafe', 'lightning', 'fast charger'],
    'remote': ['remote', 'tv remote', 'television remote', 'controller', 'clicker', 'samsung remote', 'remote control'],
    'medicine': ['medicine', 'pill', 'pills', 'tablet', 'tablets', 'first aid', 'prescription', 'allergy', 'medical', 'ointment', 'pharmacy', 'drugs'],
    'drill': ['drill', 'power drill', 'tools', 'screwdriver', 'bits', 'hardware', 'toolbox', 'wrench', 'screw'],
    'tools': ['tool', 'tools', 'drill', 'screwdriver', 'hammer', 'wrench', 'pliers', 'measuring tape', 'hardware'],
    'headphones': ['headphones', 'earphones', 'headset', 'airpods', 'earbuds', 'sony', 'xm5', 'audio', 'ear plugs'],
    'wallet': ['wallet', 'purse', 'card', 'credit card', 'cards', 'cash', 'money', 'pocketbook'],
    'laptop': ['laptop', 'macbook', 'computer', 'notebook', 'pc', 'chromebook'],
    'glasses': ['glasses', 'spectacles', 'sunglasses', 'reading glasses', 'shades', 'eyewear'],
    'watch': ['watch', 'smartwatch', 'apple watch', 'rolex', 'timepiece', 'wrist watch'],
    'document': ['document', 'documents', 'papers', 'certificate', 'file', 'deed', 'contract', 'insurance'],
    'vault': ['vault', 'safe', 'lockbox', 'valuables', 'gold', 'jewels', 'jewelry']
}

STOP_WORDS = {
    'where', 'did', 'i', 'keep', 'put', 'leave', 'store', 'placed', 'my', 'the', 'a', 'an',
    'find', 'is', 'are', 'was', 'were', 'what', 'can', 'you', 'tell', 'me', 'location',
    'of', 'for', 'in', 'at', 'on', 'our', 'search', 'get', 'show'
}

def clean_query_tokens(query):
    cleaned = re.sub(r'[^\w\s]', ' ', query.lower())
    tokens = [t.strip() for t in cleaned.split() if t.strip() and t.strip() not in STOP_WORDS]
    return tokens

def sanitize_text(text, max_len=500):
    if not text or not isinstance(text, str):
        return ""
    # Strip <script>...</script> and <style>...</style> including their inner content
    clean = re.sub(r'<(script|style)[^>]*>[\s\S]*?<\/\1>', '', text, flags=re.IGNORECASE)
    # Strip any remaining HTML tags
    clean = re.sub(r'<[^>]*>', '', clean).strip()
    return clean[:max_len]

def validate_image_url(url):
    if not url or not isinstance(url, str):
        return "preset_box"
    url = url.strip()
    if url.startswith('preset_'):
        return url
    if url.startswith('data:image/'):
        return url
    if url.startswith('http://') or url.startswith('https://'):
        return url
    return "preset_box"

# ----------------- Helper Auth Functions -----------------
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return None
    conn = get_db_connection()
    user = conn.execute('SELECT id, name, email, role, avatar FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    if user:
        return dict(user)
    return None

# ----------------- Web UI Route -----------------
@app.route('/')
def index():
    return render_template('index.html')

# ----------------- Auth API -----------------
@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    email = sanitize_text(data.get('email', '')).lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE LOWER(email) = ?', (email,)).fetchone()
    conn.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401

    session['user_id'] = user['id']
    session['user_role'] = user['role']
    session['user_name'] = user['name']

    user_info = {
        'id': user['id'],
        'name': user['name'],
        'email': user['email'],
        'role': user['role'],
        'avatar': user['avatar']
    }
    return jsonify({'success': True, 'user': user_info, 'message': f"Welcome back, {user['name']}!"})

@app.route('/api/auth/register', methods=['POST'])
def api_register():
    data = request.get_json() or {}
    name = sanitize_text(data.get('name', ''), max_len=100)
    email = sanitize_text(data.get('email', '')).lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'Name, email, and password are required.'}), 400

    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters.'}), 400

    conn = get_db_connection()
    existing = conn.execute('SELECT id FROM users WHERE LOWER(email) = ?', (email,)).fetchone()
    if existing:
        conn.close()
        return jsonify({'success': False, 'message': 'Account with this email already exists.'}), 409

    pw_hash = generate_password_hash(password)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO users (name, email, password_hash, role, avatar)
        VALUES (?, ?, ?, 'owner', 'user_avatar_1')
    ''', (name, email, pw_hash))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    session['user_id'] = user_id
    session['user_role'] = 'owner'
    session['user_name'] = name

    return jsonify({
        'success': True,
        'user': {'id': user_id, 'name': name, 'email': email, 'role': 'owner', 'avatar': 'user_avatar_1'},
        'message': f"Account created successfully! Welcome, {name}."
    })

@app.route('/api/auth/me', methods=['GET'])
def api_me():
    user = get_current_user()
    if not user:
        return jsonify({'authenticated': False})
    return jsonify({'authenticated': True, 'user': user})

@app.route('/api/auth/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully.'})

@app.route('/api/auth/change-password', methods=['POST'])
def api_change_password():
    user = get_current_user()
    if not user:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401

    data = request.get_json() or {}
    old_pw = data.get('current_password', '')
    new_pw = data.get('new_password', '')

    if len(new_pw) < 6:
        return jsonify({'success': False, 'message': 'New password must be at least 6 characters.'}), 400

    conn = get_db_connection()
    user_row = conn.execute('SELECT password_hash FROM users WHERE id = ?', (user['id'],)).fetchone()
    if not user_row or not check_password_hash(user_row['password_hash'], old_pw):
        conn.close()
        return jsonify({'success': False, 'message': 'Current password is incorrect.'}), 400

    new_hash = generate_password_hash(new_pw)
    conn.execute('UPDATE users SET password_hash = ? WHERE id = ?', (new_hash, user['id']))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Password changed successfully.'})

# ----------------- Items API -----------------
@app.route('/api/items', methods=['GET'])
def api_get_items():
    user = get_current_user()
    user_id = user['id'] if user else 1
    is_nominee = user and user['role'] == 'nominee'

    category = request.args.get('category', '').strip()
    room = request.args.get('room', '').strip()
    q = request.args.get('q', '').strip().lower()

    conn = get_db_connection()
    query = 'SELECT * FROM items WHERE 1=1'
    params = []

    if is_nominee:
        owner_rows = conn.execute(
            "SELECT owner_id, allowed_categories FROM nominees WHERE LOWER(nominee_email) = ? AND status = 'active'",
            (user['email'].lower(),)
        ).fetchall()
        if not owner_rows:
            conn.close()
            return jsonify({'success': True, 'items': []})

        owner_ids = [r['owner_id'] for r in owner_rows]
        placeholders = ','.join('?' * len(owner_ids))
        query += f' AND user_id IN ({placeholders}) AND is_private = 0'
        params.extend(owner_ids)
    else:
        query += ' AND user_id = ?'
        params.append(user_id)

    if category and category.lower() != 'all':
        query += ' AND LOWER(category) = ?'
        params.append(category.lower())

    if room and room.lower() != 'all':
        query += ' AND LOWER(room) = ?'
        params.append(room.lower())

    if q:
        query += ' AND (LOWER(name) LIKE ? OR LOWER(storage_location) LIKE ? OR LOWER(notes) LIKE ? OR LOWER(tags) LIKE ?)'
        wildcard = f'%{q}%'
        params.extend([wildcard, wildcard, wildcard, wildcard])

    query += ' ORDER BY updated_at DESC'
    items = conn.execute(query, params).fetchall()
    conn.close()

    return jsonify({'success': True, 'items': [dict(it) for it in items]})

@app.route('/api/items', methods=['POST'])
def api_add_item():
    user = get_current_user()
    user_id = user['id'] if user else 1

    data = request.get_json() or {}
    name = sanitize_text(data.get('name', ''))
    category = sanitize_text(data.get('category', 'Miscellaneous'))
    room = sanitize_text(data.get('room', 'Living Room'))
    storage_location = sanitize_text(data.get('storage_location', ''))
    notes = sanitize_text(data.get('notes', ''), max_len=1000)
    image_url = validate_image_url(data.get('image_url', ''))
    is_private = 1 if data.get('is_private') else 0
    tags = sanitize_text(data.get('tags', ''))

    if not name or not storage_location:
        return jsonify({'success': False, 'message': 'Item name and exact storage location are required.'}), 400

    now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO items (user_id, name, category, room, storage_location, notes, image_url, is_private, tags, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, name, category, room, storage_location, notes, image_url, is_private, tags, now, now))
    item_id = cursor.lastrowid
    conn.commit()

    new_item = conn.execute('SELECT * FROM items WHERE id = ?', (item_id,)).fetchone()
    conn.close()

    return jsonify({
        'success': True,
        'item': dict(new_item),
        'message': f"'{name}' successfully saved to smart memory!"
    }), 201

@app.route('/api/items/<int:item_id>', methods=['GET'])
def api_get_item(item_id):
    user = get_current_user()
    user_id = user['id'] if user else 1
    is_nominee = user and user['role'] == 'nominee'

    conn = get_db_connection()
    item = conn.execute('SELECT * FROM items WHERE id = ?', (item_id,)).fetchone()
    if not item:
        conn.close()
        return jsonify({'success': False, 'message': 'Item not found.'}), 404

    # Access control
    if item['user_id'] != user_id:
        if is_nominee and item['is_private'] == 0:
            grant = conn.execute(
                "SELECT id FROM nominees WHERE owner_id = ? AND LOWER(nominee_email) = ? AND status = 'active'",
                (item['user_id'], user['email'].lower())
            ).fetchone()
            if not grant:
                conn.close()
                return jsonify({'success': False, 'message': 'Permission denied.'}), 403
        else:
            conn.close()
            return jsonify({'success': False, 'message': 'Permission denied.'}), 403

    conn.close()
    return jsonify({'success': True, 'item': dict(item)})

@app.route('/api/items/<int:item_id>', methods=['PUT'])
def api_update_item(item_id):
    user = get_current_user()
    user_id = user['id'] if user else 1

    data = request.get_json() or {}
    name = sanitize_text(data.get('name', ''))
    category = sanitize_text(data.get('category', 'Miscellaneous'))
    room = sanitize_text(data.get('room', 'Living Room'))
    storage_location = sanitize_text(data.get('storage_location', ''))
    notes = sanitize_text(data.get('notes', ''), max_len=1000)
    raw_img = data.get('image_url')
    image_url = validate_image_url(raw_img) if raw_img else None
    is_private = 1 if data.get('is_private') else 0
    tags = sanitize_text(data.get('tags', ''))

    if not name or not storage_location:
        return jsonify({'success': False, 'message': 'Item name and storage location are required.'}), 400

    now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    conn = get_db_connection()
    item = conn.execute('SELECT * FROM items WHERE id = ?', (item_id,)).fetchone()
    if not item:
        conn.close()
        return jsonify({'success': False, 'message': 'Item not found.'}), 404

    # Authorization Check (IDOR Protection)
    can_update = False
    if item['user_id'] == user_id:
        can_update = True
    elif user and user['role'] == 'nominee' and item['is_private'] == 0:
        grant = conn.execute(
            "SELECT access_level FROM nominees WHERE owner_id = ? AND LOWER(nominee_email) = ? AND status = 'active'",
            (item['user_id'], user['email'].lower())
        ).fetchone()
        if grant and grant['access_level'] == 'full':
            can_update = True

    if not can_update:
        conn.close()
        return jsonify({'success': False, 'message': 'Permission denied: You do not have permission to edit this item.'}), 403

    final_image = image_url if image_url else item['image_url']

    conn.execute('''
        UPDATE items
        SET name = ?, category = ?, room = ?, storage_location = ?, notes = ?,
            image_url = ?, is_private = ?, tags = ?, updated_at = ?
        WHERE id = ?
    ''', (name, category, room, storage_location, notes, final_image, is_private, tags, now, item_id))
    conn.commit()

    updated = conn.execute('SELECT * FROM items WHERE id = ?', (item_id,)).fetchone()
    conn.close()

    return jsonify({'success': True, 'item': dict(updated), 'message': f"'{name}' updated successfully!"})

@app.route('/api/items/<int:item_id>', methods=['DELETE'])
def api_delete_item(item_id):
    user = get_current_user()
    user_id = user['id'] if user else 1

    conn = get_db_connection()
    item = conn.execute('SELECT * FROM items WHERE id = ?', (item_id,)).fetchone()
    if not item:
        conn.close()
        return jsonify({'success': False, 'message': 'Item not found.'}), 404

    # IDOR Protection: Only the item's owner can delete it
    if item['user_id'] != user_id:
        conn.close()
        return jsonify({'success': False, 'message': 'Permission denied: You cannot delete items belonging to another user.'}), 403

    item_name = item['name']
    conn.execute('DELETE FROM items WHERE id = ?', (item_id,))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': f"'{item_name}' removed from smart memory."})

# ----------------- AI Smart Search API -----------------
@app.route('/api/search', methods=['POST'])
def api_smart_search():
    user = get_current_user()
    user_id = user['id'] if user else 1
    is_nominee = user and user['role'] == 'nominee'

    data = request.get_json() or {}
    raw_query = sanitize_text(data.get('query', ''), max_len=200)

    if not raw_query:
        return jsonify({'success': False, 'message': 'Search query is empty.'}), 400

    tokens = clean_query_tokens(raw_query)

    conn = get_db_connection()
    if is_nominee:
        owner_rows = conn.execute(
            "SELECT owner_id, allowed_categories FROM nominees WHERE LOWER(nominee_email) = ? AND status = 'active'",
            (user['email'].lower(),)
        ).fetchall()
        if not owner_rows:
            items = []
        else:
            owner_ids = [r['owner_id'] for r in owner_rows]
            placeholders = ','.join('?' * len(owner_ids))
            items = conn.execute(
                f"SELECT * FROM items WHERE user_id IN ({placeholders}) AND is_private = 0",
                owner_ids
            ).fetchall()
    else:
        items = conn.execute('SELECT * FROM items WHERE user_id = ?', (user_id,)).fetchall()

    if not tokens:
        tokens = [raw_query.lower()]

    # Map each query token to its set of synonyms/variants
    token_synonym_map = {}
    for token in tokens:
        syns = {token}
        for key, syn_list in SYNONYMS.items():
            if token == key or token in syn_list:
                syns.update(syn_list)
        token_synonym_map[token] = syns

    scored_items = []
    lower_raw = raw_query.lower()

    for item in items:
        name_lower = item['name'].lower()
        room_lower = item['room'].lower()
        loc_lower = item['storage_location'].lower()
        notes_lower = (item['notes'] or '').lower()
        tags_lower = (item['tags'] or '').lower()
        cat_lower = item['category'].lower()
        all_text = f"{name_lower} {tags_lower} {cat_lower} {loc_lower} {room_lower} {notes_lower}"

        score = 0
        matched_tokens = set()

        for token, syn_set in token_synonym_map.items():
            token_matched = False
            for syn in syn_set:
                syn_pattern = r'\b' + re.escape(syn) + r'\b'
                if re.search(syn_pattern, all_text):
                    token_matched = True
                    if re.search(syn_pattern, name_lower):
                        score += 35
                    elif re.search(syn_pattern, tags_lower):
                        score += 25
                    elif re.search(syn_pattern, loc_lower):
                        score += 15
                    elif re.search(syn_pattern, room_lower):
                        score += 12
                    elif re.search(syn_pattern, cat_lower):
                        score += 10
                    elif re.search(syn_pattern, notes_lower):
                        score += 8
            if token_matched:
                matched_tokens.add(token)

        for part in re.split(r'[&,/-]', name_lower):
            part = part.strip()
            if part and len(part) > 2 and (part in lower_raw or lower_raw in part):
                score += 50
                matched_tokens.update(tokens)

        if room_lower in lower_raw and len(room_lower) > 2:
            score += 20
            matched_tokens.add(room_lower)

        coverage = len(matched_tokens) / len(tokens) if tokens else 0
        is_relevant = False

        if len(tokens) == 1:
            is_relevant = (coverage >= 1.0 and score >= 15)
        elif len(tokens) == 2:
            is_relevant = (coverage >= 0.5 and score >= 25)
        else:  # 3 or more tokens
            is_relevant = (coverage >= 0.5 and score >= 40)

        if is_relevant:
            confidence = min(99, int(50 + (score / 150) * 49))
            scored_items.append({'item': dict(item), 'score': score, 'coverage': coverage, 'confidence': confidence})

    scored_items.sort(key=lambda x: (x['coverage'], x['score']), reverse=True)

    matched_title = scored_items[0]['item']['name'] if scored_items else None
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO search_history (user_id, query, result_count, matched_item_name)
        VALUES (?, ?, ?, ?)
    ''', (user_id, raw_query, len(scored_items), matched_title))
    conn.commit()
    conn.close()

    if scored_items:
        top_match = scored_items[0]['item']
        top_confidence = scored_items[0]['confidence']
        results = [x['item'] for x in scored_items]
        ai_response = (
            f"Found it! Your **{top_match['name']}** is stored in the **{top_match['room']}**.\n\n"
            f"📍 **Exact Location:** {top_match['storage_location']}"
        )
        if top_match.get('notes'):
            ai_response += f"\n📝 *Note: {top_match['notes']}*"

        return jsonify({
            'success': True,
            'query': raw_query,
            'count': len(results),
            'confidence': top_confidence,
            'top_match': top_match,
            'results': results,
            'ai_response': ai_response
        })
    else:
        ai_response = f"No saved location found for \"{raw_query}\". Try another search or add this item to your smart memory."
        return jsonify({
            'success': True,
            'query': raw_query,
            'count': 0,
            'top_match': None,
            'results': [],
            'ai_response': ai_response
        })

# ----------------- Family Nominees API -----------------
@app.route('/api/family', methods=['GET'])
def api_get_nominees():
    user = get_current_user()
    user_id = user['id'] if user else 1

    conn = get_db_connection()
    nominees = conn.execute('SELECT * FROM nominees WHERE owner_id = ? ORDER BY created_at DESC', (user_id,)).fetchall()
    conn.close()
    return jsonify({'success': True, 'nominees': [dict(n) for n in nominees]})

@app.route('/api/family', methods=['POST'])
def api_add_nominee():
    user = get_current_user()
    user_id = user['id'] if user else 1

    data = request.get_json() or {}
    name = sanitize_text(data.get('nominee_name', ''), max_len=100)
    email = sanitize_text(data.get('nominee_email', '')).lower()
    relationship = sanitize_text(data.get('relationship', 'Family Member'), max_len=50)
    access_level = sanitize_text(data.get('access_level', 'view'), max_len=20)
    allowed_categories = sanitize_text(data.get('allowed_categories', 'all'), max_len=200)

    if not name or not email:
        return jsonify({'success': False, 'message': 'Nominee name and email are required.'}), 400

    conn = get_db_connection()
    existing = conn.execute('SELECT id FROM nominees WHERE owner_id = ? AND LOWER(nominee_email) = ?', (user_id, email)).fetchone()
    if existing:
        conn.close()
        return jsonify({'success': False, 'message': 'This email has already been invited as a nominee.'}), 409

    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO nominees (owner_id, nominee_name, nominee_email, relationship, access_level, allowed_categories, status)
        VALUES (?, ?, ?, ?, ?, ?, 'active')
    ''', (user_id, name, email, relationship, access_level, allowed_categories))
    nominee_id = cursor.lastrowid
    conn.commit()

    created = conn.execute('SELECT * FROM nominees WHERE id = ?', (nominee_id,)).fetchone()
    conn.close()

    return jsonify({
        'success': True,
        'nominee': dict(created),
        'message': f"Access invitation granted to {name} ({email})!"
    }), 201

@app.route('/api/family/<int:nominee_id>', methods=['DELETE'])
def api_delete_nominee(nominee_id):
    user = get_current_user()
    user_id = user['id'] if user else 1

    conn = get_db_connection()
    nominee = conn.execute('SELECT * FROM nominees WHERE id = ?', (nominee_id,)).fetchone()
    if not nominee:
        conn.close()
        return jsonify({'success': False, 'message': 'Nominee not found.'}), 404

    # Authorization Check: verify ownership
    if nominee['owner_id'] != user_id:
        conn.close()
        return jsonify({'success': False, 'message': 'Permission denied: Cannot revoke nominee of another household.'}), 403

    nominee_name = nominee['nominee_name']
    conn.execute('DELETE FROM nominees WHERE id = ?', (nominee_id,))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': f"Access revoked for {nominee_name}."})

@app.route('/api/family/<int:nominee_id>', methods=['PUT'])
def api_update_nominee(nominee_id):
    user = get_current_user()
    user_id = user['id'] if user else 1

    conn = get_db_connection()
    nominee = conn.execute('SELECT * FROM nominees WHERE id = ?', (nominee_id,)).fetchone()
    if not nominee:
        conn.close()
        return jsonify({'success': False, 'message': 'Nominee not found.'}), 404

    if nominee['owner_id'] != user_id:
        conn.close()
        return jsonify({'success': False, 'message': 'Permission denied.'}), 403

    data = request.get_json() or {}
    access_level = sanitize_text(data.get('access_level', 'view'), max_len=20)
    status = sanitize_text(data.get('status', 'active'), max_len=20)

    conn.execute('''
        UPDATE nominees
        SET access_level = ?, status = ?
        WHERE id = ?
    ''', (access_level, status, nominee_id))
    conn.commit()
    updated = conn.execute('SELECT * FROM nominees WHERE id = ?', (nominee_id,)).fetchone()
    conn.close()

    return jsonify({'success': True, 'nominee': dict(updated), 'message': 'Nominee permissions updated.'})

# ----------------- Dashboard Stats & Rooms API -----------------
@app.route('/api/stats', methods=['GET'])
def api_get_stats():
    user = get_current_user()
    user_id = user['id'] if user else 1

    conn = get_db_connection()
    total_items = conn.execute('SELECT COUNT(*) FROM items WHERE user_id = ?', (user_id,)).fetchone()[0]
    total_rooms = conn.execute('SELECT COUNT(DISTINCT room) FROM items WHERE user_id = ?', (user_id,)).fetchone()[0]
    total_nominees = conn.execute('SELECT COUNT(*) FROM nominees WHERE owner_id = ?', (user_id,)).fetchone()[0]
    recent_items = conn.execute('SELECT * FROM items WHERE user_id = ? ORDER BY updated_at DESC LIMIT 5', (user_id,)).fetchall()
    rooms_data = conn.execute('SELECT room, COUNT(*) as count FROM items WHERE user_id = ? GROUP BY room', (user_id,)).fetchall()
    conn.close()

    return jsonify({
        'success': True,
        'stats': {
            'total_items': total_items,
            'total_rooms': total_rooms,
            'total_nominees': total_nominees,
            'rooms': [dict(r) for r in rooms_data],
            'recent_items': [dict(i) for i in recent_items]
        }
    })

# ----------------- Backup / Reset API -----------------
@app.route('/api/backup/reset', methods=['POST'])
def api_reset_sample():
    user = get_current_user()
    if not user or user.get('role') != 'owner':
        return jsonify({'success': False, 'message': 'Only authenticated household owners can reset demo data.'}), 403

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM items')
    cursor.execute('DELETE FROM nominees')
    cursor.execute('DELETE FROM search_history')
    cursor.execute('DELETE FROM users')
    seed_sample_data(cursor)
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Database restored to sample smart home demonstration state.'})

@app.route('/api/backup/export', methods=['GET'])
def api_backup_export():
    user = get_current_user()
    if not user:
        return jsonify({'success': False, 'message': 'Authentication required.'}), 401

    user_id = user['id']
    conn = get_db_connection()
    items = conn.execute('SELECT * FROM items WHERE user_id = ?', (user_id,)).fetchall()
    nominees = conn.execute('SELECT * FROM nominees WHERE owner_id = ?', (user_id,)).fetchall()
    conn.close()

    export_payload = {
        'version': '1.0',
        'export_date': datetime.datetime.now().isoformat(),
        'items': [dict(i) for i in items],
        'nominees': [dict(n) for n in nominees]
    }
    return jsonify(export_payload)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"\n=======================================================")
    print(f" FIND MY STUFF AI - SMART HOME ITEM FINDER BACKEND")
    print(f" Server running at: http://127.0.0.1:{port}")
    print(f" Test Demo Login:")
    print(f"   Owner:   alex@smarthome.ai  / password123")
    print(f"   Nominee: sarah@smarthome.ai / password123")
    print(f"=======================================================\n")
    app.run(host='0.0.0.0', port=port, debug=True)
