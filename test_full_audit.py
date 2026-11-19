"""
Find My Stuff AI - Comprehensive QA Audit & Test Suite
Tests authentication, authorization, IDOR, input validation, CRUD, smart search, and nominee isolation.
"""
import unittest
import json
import os
import sqlite3
from app import app
from database import init_db, get_db_connection

class TestFindMyStuffAudit(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        init_db()

    def test_01_public_routes(self):
        """Web root should return 200 OK with application shell"""
        res = self.client.get('/')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'Find My Stuff', res.data)

    def test_02_auth_workflow(self):
        """Test registration, duplicate email rejection, login, and logout"""
        # Register new user
        test_email = f"test_{os.urandom(4).hex()}@smarthome.ai"
        res = self.client.post('/api/auth/register', json={
            'name': 'Tester QA',
            'email': test_email,
            'password': 'password123'
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])

        # Duplicate register should fail with 409
        res_dup = self.client.post('/api/auth/register', json={
            'name': 'Tester QA',
            'email': test_email,
            'password': 'password123'
        })
        self.assertEqual(res_dup.status_code, 409)

        # Login
        res_login = self.client.post('/api/auth/login', json={
            'email': test_email,
            'password': 'password123'
        })
        self.assertEqual(res_login.status_code, 200)

        # Session me
        res_me = self.client.get('/api/auth/me')
        self.assertEqual(res_me.status_code, 200)
        self.assertTrue(res_me.get_json()['authenticated'])

        # Logout
        res_logout = self.client.post('/api/auth/logout')
        self.assertEqual(res_logout.status_code, 200)

        # Session me after logout
        res_me_after = self.client.get('/api/auth/me')
        self.assertFalse(res_me_after.get_json()['authenticated'])

    def test_03_smart_search_natural_language(self):
        """Test natural language queries for real items and ensure no hallucination on missing items"""
        # Query 1: Passport
        res = self.client.post('/api/search', json={'query': 'Where did I keep my passport?'})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertGreater(data['count'], 0)
        self.assertIn('Master Bedroom', data['ai_response'])

        # Query 2: House keys
        res = self.client.post('/api/search', json={'query': 'Where are my house keys?'})
        data = res.get_json()
        self.assertGreater(data['count'], 0)
        self.assertIn('Living Room', data['ai_response'])

        # Query 3: TV remote
        res = self.client.post('/api/search', json={'query': 'Where is my television remote?'})
        data = res.get_json()
        self.assertGreater(data['count'], 0)
        self.assertIn('Living Room', data['ai_response'])

        # Query 4: Non-existent item (Strict: Never hallucinate)
        res = self.client.post('/api/search', json={'query': 'Where did I leave my interstellar rocket ship?'})
        data = res.get_json()
        self.assertEqual(data['count'], 0)
        self.assertIn('No saved location found', data['ai_response'])

    def test_04_nominee_privacy_isolation(self):
        """Family Nominee (Sarah) must NOT see private items (e.g. Vault Key)"""
        # Login as Nominee Sarah
        res_login = self.client.post('/api/auth/login', json={
            'email': 'sarah@smarthome.ai',
            'password': 'password123'
        })
        self.assertEqual(res_login.status_code, 200)

        # Get items as nominee
        res_items = self.client.get('/api/items')
        data = res_items.get_json()
        self.assertTrue(data['success'])
        items = data['items']

        # Ensure no private item is present
        for item in items:
            self.assertEqual(item['is_private'], 0, f"Nominee saw private item: {item['name']}")

        # Search for vault/safe as nominee should yield 0 results
        res_search = self.client.post('/api/search', json={'query': 'vault key property deed'})
        search_data = res_search.get_json()
        self.assertEqual(search_data['count'], 0, "Nominee was able to search and retrieve a private vault key!")

    def test_05_idor_protection(self):
        """User A should not be able to delete or modify User B's items"""
        # Login as User A (Alex) and create an item
        self.client.post('/api/auth/login', json={'email': 'alex@smarthome.ai', 'password': 'password123'})
        res_add = self.client.post('/api/items', json={
            'name': 'Alex Private Secret Diary',
            'category': 'Documents',
            'room': 'Home Office',
            'storage_location': 'Locked drawer',
            'is_private': 1
        })
        item_id = res_add.get_json()['item']['id']

        # Register and login as User B
        email_b = f"userb_{os.urandom(4).hex()}@smarthome.ai"
        self.client.post('/api/auth/register', json={
            'name': 'User B Attacker',
            'email': email_b,
            'password': 'password123'
        })

        # User B attempts to delete Alex's item
        res_del = self.client.delete(f'/api/items/{item_id}')
        # Should be forbidden (403 or 404), NOT 200 success!
        self.assertIn(res_del.status_code, [403, 404], f"IDOR Vulnerability: User B deleted User A's item! Status: {res_del.status_code}")

        # User B attempts to edit Alex's item
        res_edit = self.client.put(f'/api/items/{item_id}', json={
            'name': 'Hacked Item',
            'storage_location': 'Hacked'
        })
        self.assertIn(res_edit.status_code, [403, 404], f"IDOR Vulnerability: User B edited User A's item! Status: {res_edit.status_code}")

    def test_06_nominee_idor_protection(self):
        """User B cannot revoke or update User A's family nominees"""
        # Alex logs in and adds a nominee
        self.client.post('/api/auth/login', json={'email': 'alex@smarthome.ai', 'password': 'password123'})
        res_nom = self.client.post('/api/family', json={
            'nominee_name': 'Cousin Jane',
            'nominee_email': f'jane_{os.urandom(3).hex()}@smarthome.ai',
            'relationship': 'Cousin',
            'access_level': 'view'
        })
        nominee_id = res_nom.get_json()['nominee']['id']

        # User B attacker logs in
        attacker_email = f"attacker_{os.urandom(3).hex()}@smarthome.ai"
        self.client.post('/api/auth/register', json={
            'name': 'Attacker Bob',
            'email': attacker_email,
            'password': 'password123'
        })

        # User B attempts to delete Alex's nominee
        res_del = self.client.delete(f'/api/family/{nominee_id}')
        self.assertEqual(res_del.status_code, 403, "IDOR: Attacker deleted owner's nominee!")

        # User B attempts to update Alex's nominee permissions
        res_put = self.client.put(f'/api/family/{nominee_id}', json={'access_level': 'full'})
        self.assertEqual(res_put.status_code, 403, "IDOR: Attacker updated owner's nominee!")

    def test_07_backup_endpoint_security(self):
        """Reset and Export endpoints must reject unauthenticated and unauthorized callers"""
        # Unauthenticated logout
        self.client.post('/api/auth/logout')

        # Attempt unauthenticated reset
        res_reset = self.client.post('/api/backup/reset')
        self.assertEqual(res_reset.status_code, 403, "Unauthorized caller was able to reset database!")

        # Attempt unauthenticated export
        res_export = self.client.get('/api/backup/export')
        self.assertEqual(res_export.status_code, 401, "Unauthenticated caller was able to export household data!")

    def test_08_xss_and_input_sanitization(self):
        """Item creation must strip dangerous script tags and reject javascript: image URLs"""
        self.client.post('/api/auth/login', json={'email': 'alex@smarthome.ai', 'password': 'password123'})

        res_add = self.client.post('/api/items', json={
            'name': '<script>alert("XSS")</script>Smart Thermostat',
            'category': 'Electronics',
            'room': 'Hallway',
            'storage_location': '<b>Wall mount</b>',
            'notes': '<img src=x onerror=alert(1)>Emergency contact info',
            'image_url': 'javascript:alert(1)'
        })
        self.assertEqual(res_add.status_code, 201)
        item = res_add.get_json()['item']

        # Verify XSS payload is sanitized
        self.assertNotIn('<script>', item['name'])
        self.assertEqual(item['name'], 'Smart Thermostat')
        self.assertNotIn('<b>', item['storage_location'])
        self.assertNotIn('<img', item['notes'])
        # Verify javascript: URL is rejected and replaced with safe preset
        self.assertEqual(item['image_url'], 'preset_box')

    def test_09_password_change_security(self):
        """Password change requires valid current password and enforces minimum length"""
        test_email = f"user_pw_{os.urandom(3).hex()}@smarthome.ai"
        self.client.post('/api/auth/register', json={
            'name': 'Password Tester',
            'email': test_email,
            'password': 'initialPassword123'
        })

        # Wrong old password should fail
        res_wrong = self.client.post('/api/auth/change-password', json={
            'current_password': 'wrongPassword',
            'new_password': 'brandNewPassword123'
        })
        self.assertEqual(res_wrong.status_code, 400)

        # Short new password should fail
        res_short = self.client.post('/api/auth/change-password', json={
            'current_password': 'initialPassword123',
            'new_password': '123'
        })
        self.assertEqual(res_short.status_code, 400)

        # Valid password change should succeed
        res_ok = self.client.post('/api/auth/change-password', json={
            'current_password': 'initialPassword123',
            'new_password': 'brandNewPassword123'
        })
        self.assertEqual(res_ok.status_code, 200)

    def test_10_smart_search_synonym_variations(self):
        """Test varied conversational queries for different household categories"""
        # Alex searches for charger
        self.client.post('/api/auth/login', json={'email': 'alex@smarthome.ai', 'password': 'password123'})

        # Query: USB-C Fast Charger
        res1 = self.client.post('/api/search', json={'query': 'Where did I keep my charger?'})
        self.assertEqual(res1.status_code, 200)
        data1 = res1.get_json()
        self.assertGreater(data1['count'], 0)
        self.assertIn('Home Office', data1['ai_response'])
        self.assertIn('MacBook', data1['top_match']['name'])

        # Query: Power drill in tools
        res2 = self.client.post('/api/search', json={'query': 'Find my power drill'})
        data2 = res2.get_json()
        self.assertGreater(data2['count'], 0)
        self.assertIn('Garage', data2['ai_response'])
        self.assertIn('Drill', data2['top_match']['name'])

        # Query: First aid kit in medicine
        res3 = self.client.post('/api/search', json={'query': 'Where is the first aid medicine?'})
        data3 = res3.get_json()
        self.assertGreater(data3['count'], 0)
        self.assertIn('Kitchen', data3['ai_response'])
        self.assertIn('First Aid', data3['top_match']['name'])

if __name__ == '__main__':
    unittest.main()
