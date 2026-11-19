from app import app

client = app.test_client()

# Test 1: Web root
res = client.get('/')
assert res.status_code == 200, f'Root status {res.status_code}'
assert b'Find My Stuff' in res.data, 'Missing brand'
print('[PASS] Route / returns HTML successfully')

# Test 2: Items API
res = client.get('/api/items')
assert res.status_code == 200
data = res.get_json()
assert data['success'] and len(data['items']) >= 8
print(f'[PASS] Route /api/items returns {len(data["items"])} items')

# Test 3: Natural language search - Passport
res = client.post('/api/search', json={'query': 'Where did I keep my passport?'})
assert res.status_code == 200
data = res.get_json()
assert data['count'] > 0
assert 'Master Bedroom' in data['ai_response']
print('[PASS] Search for Passport matched: Master Bedroom ->', data['top_match']['storage_location'])

# Test 4: Natural language search - Keys
res = client.post('/api/search', json={'query': 'Where are my house keys?'})
data = res.get_json()
assert data['count'] > 0
assert 'Living Room' in data['ai_response']
print('[PASS] Search for Keys matched: Living Room ->', data['top_match']['storage_location'])

# Test 5: Search for non-existent item (Honest, no fake location)
res = client.post('/api/search', json={'query': 'Where did I leave my spaceship rocket?'})
data = res.get_json()
assert data['count'] == 0
assert 'No saved location found' in data['ai_response']
print('[PASS] Non-existent item returned honest message without fake locations')

# Test 6: Family Nominees API
res = client.get('/api/family')
assert res.status_code == 200
nominees = res.get_json()['nominees']
assert len(nominees) >= 1
print(f'[PASS] Family API returned {len(nominees)} nominees')

# Test 7: Stats API
res = client.get('/api/stats')
assert res.status_code == 200
stats = res.get_json()['stats']
print(f'[PASS] Stats API: {stats["total_items"]} items, {stats["total_rooms"]} rooms')

print('\nALL BACKEND API TESTS PASSED PERFECTLY!')

