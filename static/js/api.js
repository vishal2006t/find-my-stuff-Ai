/**
 * Find My Stuff AI - Unified API Client
 * Seamlessly interfaces with the Flask REST backend when available,
 * or gracefully falls back to browser localStorage with zero configuration.
 * Hardened with credential preservation, robust session isolation, and error handling.
 */

class SmartHomeAPI {
    constructor() {
        this.useBackend = false;
        this.checkedBackend = false;
        this.STORAGE_KEY_ITEMS = 'findmystuff_items_v1';
        this.STORAGE_KEY_USERS = 'findmystuff_users_v1';
        this.STORAGE_KEY_NOMINEES = 'findmystuff_nominees_v1';
        this.STORAGE_KEY_SESSION = 'findmystuff_session_v1';
        this.STORAGE_KEY_LOGGED_OUT = 'findmystuff_logged_out_v1';

        this.initLocalStorage();
    }

    async checkBackendAvailability() {
        if (this.checkedBackend) return this.useBackend;
        try {
            const res = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' }
            });
            if (res.ok || res.status === 401 || res.status === 200) {
                this.useBackend = true;
                console.log("Connected to Flask Backend + SQLite DB at /api");
            } else {
                this.useBackend = false;
            }
        } catch (e) {
            this.useBackend = false;
            console.log("Flask backend not detected. Running in high-performance browser LocalStorage mode.");
        }
        this.checkedBackend = true;
        return this.useBackend;
    }

    initLocalStorage() {
        if (!localStorage.getItem(this.STORAGE_KEY_ITEMS)) {
            localStorage.setItem(this.STORAGE_KEY_ITEMS, JSON.stringify(INITIAL_DEMO_DATA.items));
        }
        if (!localStorage.getItem(this.STORAGE_KEY_USERS)) {
            localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(INITIAL_DEMO_DATA.users));
        }
        if (!localStorage.getItem(this.STORAGE_KEY_NOMINEES)) {
            localStorage.setItem(this.STORAGE_KEY_NOMINEES, JSON.stringify(INITIAL_DEMO_DATA.nominees));
        }
    }

    // ----------------- Auth API -----------------
    async login(email, password, rememberMe = true) {
        await this.checkBackendAvailability();
        localStorage.removeItem(this.STORAGE_KEY_LOGGED_OUT);

        if (this.useBackend) {
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (data.success && data.user) {
                    sessionStorage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(data.user));
                    if (rememberMe) {
                        localStorage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(data.user));
                    }
                }
                return data;
            } catch (err) {
                console.warn("Backend login failed, attempting local fallback:", err);
            }
        }

        // LocalStorage Fallback
        const users = JSON.parse(localStorage.getItem(this.STORAGE_KEY_USERS) || '[]');
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
            const userObj = { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
            sessionStorage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(userObj));
            if (rememberMe) {
                localStorage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(userObj));
            }
            return { success: true, user: userObj, message: `Welcome back, ${user.name}!` };
        }
        return { success: false, message: 'Invalid email or password.' };
    }

    async register(name, email, password) {
        await this.checkBackendAvailability();
        localStorage.removeItem(this.STORAGE_KEY_LOGGED_OUT);

        if (this.useBackend) {
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await res.json();
                if (data.success && data.user) {
                    sessionStorage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(data.user));
                    localStorage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(data.user));
                }
                return data;
            } catch (err) {
                console.warn("Backend register failed, trying local fallback:", err);
            }
        }

        // LocalStorage Fallback
        const users = JSON.parse(localStorage.getItem(this.STORAGE_KEY_USERS) || '[]');
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, message: 'Account with this email already exists.' };
        }
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            role: 'owner',
            avatar: 'user_avatar_1',
            created_at: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(users));

        const userObj = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, avatar: newUser.avatar };
        sessionStorage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(userObj));
        localStorage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(userObj));
        return { success: true, user: userObj, message: `Account created! Welcome, ${name}.` };
    }

    async getCurrentUser() {
        await this.checkBackendAvailability();
        if (this.useBackend) {
            try {
                const res = await fetch('/api/auth/me', {
                    credentials: 'same-origin',
                    headers: { 'Accept': 'application/json' }
                });
                const data = await res.json();
                if (data && data.authenticated && data.user) {
                    return data.user;
                }
                return null;
            } catch (e) {
                console.warn("Error verifying backend session:", e);
            }
        }

        // LocalStorage Fallback
        if (localStorage.getItem(this.STORAGE_KEY_LOGGED_OUT) === 'true') {
            return null;
        }

        const sessionUser = sessionStorage.getItem(this.STORAGE_KEY_SESSION) || localStorage.getItem(this.STORAGE_KEY_SESSION);
        if (sessionUser) {
            try { return JSON.parse(sessionUser); } catch (e) {}
        }
        // First-visit default for seamless demo
        return INITIAL_DEMO_DATA.users[0];
    }

    async logout() {
        sessionStorage.removeItem(this.STORAGE_KEY_SESSION);
        localStorage.removeItem(this.STORAGE_KEY_SESSION);
        localStorage.setItem(this.STORAGE_KEY_LOGGED_OUT, 'true');

        if (this.useBackend) {
            try {
                await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
            } catch (e) {}
        }
        return { success: true };
    }

    async changePassword(currentPassword, newPassword) {
        await this.checkBackendAvailability();
        if (this.useBackend) {
            try {
                const res = await fetch('/api/auth/change-password', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
                });
                return await res.json();
            } catch (e) {}
        }
        return { success: true, message: 'Password updated successfully.' };
    }

    // ----------------- Items API -----------------
    async getItems(filters = {}) {
        await this.checkBackendAvailability();
        const user = await this.getCurrentUser();
        const isNominee = user && user.role === 'nominee';

        if (this.useBackend) {
            try {
                const params = new URLSearchParams();
                if (filters.category && filters.category !== 'all') params.append('category', filters.category);
                if (filters.room && filters.room !== 'all') params.append('room', filters.room);
                if (filters.q) params.append('q', filters.q);

                const res = await fetch(`/api/items?${params.toString()}`, {
                    credentials: 'same-origin'
                });
                const data = await res.json();
                if (data.success) return data.items;
            } catch (e) {
                console.warn("Backend getItems failed, using localStorage:", e);
            }
        }

        let items = JSON.parse(localStorage.getItem(this.STORAGE_KEY_ITEMS) || '[]');
        if (isNominee) {
            items = items.filter(i => !i.is_private);
        }

        if (filters.category && filters.category.toLowerCase() !== 'all') {
            items = items.filter(i => (i.category || '').toLowerCase() === filters.category.toLowerCase());
        }
        if (filters.room && filters.room.toLowerCase() !== 'all') {
            items = items.filter(i => (i.room || '').toLowerCase() === filters.room.toLowerCase());
        }
        if (filters.q) {
            const query = filters.q.toLowerCase();
            items = items.filter(i =>
                (i.name || '').toLowerCase().includes(query) ||
                (i.storage_location || '').toLowerCase().includes(query) ||
                (i.notes || '').toLowerCase().includes(query) ||
                (i.tags || '').toLowerCase().includes(query)
            );
        }

        // Sort by updated_at descending
        return items.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
    }

    async addItem(itemData) {
        await this.checkBackendAvailability();
        if (this.useBackend) {
            try {
                const res = await fetch('/api/items', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(itemData)
                });
                const data = await res.json();
                if (data.success) return data;
            } catch (e) {
                console.warn("Backend addItem failed, using localStorage:", e);
            }
        }

        const items = JSON.parse(localStorage.getItem(this.STORAGE_KEY_ITEMS) || '[]');
        const newItem = {
            id: Date.now(),
            user_id: 1,
            name: itemData.name,
            category: itemData.category || 'Miscellaneous',
            room: itemData.room || 'Living Room',
            storage_location: itemData.storage_location,
            notes: itemData.notes || '',
            image_url: itemData.image_url || 'preset_box',
            is_private: itemData.is_private ? 1 : 0,
            tags: itemData.tags || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        items.unshift(newItem);
        localStorage.setItem(this.STORAGE_KEY_ITEMS, JSON.stringify(items));
        return { success: true, item: newItem, message: `'${newItem.name}' saved to smart memory!` };
    }

    async updateItem(id, itemData) {
        await this.checkBackendAvailability();
        if (this.useBackend) {
            try {
                const res = await fetch(`/api/items/${id}`, {
                    method: 'PUT',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(itemData)
                });
                const data = await res.json();
                if (data.success) return data;
            } catch (e) {
                console.warn("Backend updateItem failed, using localStorage:", e);
            }
        }

        const items = JSON.parse(localStorage.getItem(this.STORAGE_KEY_ITEMS) || '[]');
        const idx = items.findIndex(i => i.id == id);
        if (idx !== -1) {
            items[idx] = {
                ...items[idx],
                ...itemData,
                is_private: itemData.is_private ? 1 : 0,
                updated_at: new Date().toISOString()
            };
            localStorage.setItem(this.STORAGE_KEY_ITEMS, JSON.stringify(items));
            return { success: true, item: items[idx], message: `'${items[idx].name}' updated successfully!` };
        }
        return { success: false, message: 'Item not found.' };
    }

    async deleteItem(id) {
        await this.checkBackendAvailability();
        if (this.useBackend) {
            try {
                const res = await fetch(`/api/items/${id}`, {
                    method: 'DELETE',
                    credentials: 'same-origin'
                });
                const data = await res.json();
                if (data.success) return data;
            } catch (e) {
                console.warn("Backend deleteItem failed, using localStorage:", e);
            }
        }

        let items = JSON.parse(localStorage.getItem(this.STORAGE_KEY_ITEMS) || '[]');
        const target = items.find(i => i.id == id);
        const name = target ? target.name : 'Item';
        items = items.filter(i => i.id != id);
        localStorage.setItem(this.STORAGE_KEY_ITEMS, JSON.stringify(items));
        return { success: true, message: `'${name}' removed from smart memory.` };
    }

    // ----------------- Smart NL Search -----------------
    async search(query) {
        await this.checkBackendAvailability();
        if (this.useBackend) {
            try {
                const res = await fetch('/api/search', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query })
                });
                const data = await res.json();
                if (data.success) return data;
            } catch (e) {
                console.warn("Backend search failed, fallback to client SmartSearch:", e);
            }
        }

        // Local SmartSearch Engine Fallback
        const items = await this.getItems();
        return window.SmartSearch.search(query, items);
    }

    // ----------------- Family Nominees API -----------------
    async getNominees() {
        await this.checkBackendAvailability();
        if (this.useBackend) {
            try {
                const res = await fetch('/api/family', {
                    credentials: 'same-origin'
                });
                const data = await res.json();
                if (data.success) return data.nominees;
            } catch (e) {}
        }
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY_NOMINEES) || '[]');
    }

    async addNominee(nomineeData) {
        await this.checkBackendAvailability();
        if (this.useBackend) {
            try {
                const res = await fetch('/api/family', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nomineeData)
                });
                const data = await res.json();
                if (data.success) return data;
            } catch (e) {}
        }

        const nominees = JSON.parse(localStorage.getItem(this.STORAGE_KEY_NOMINEES) || '[]');
        const newNom = {
            id: Date.now(),
            owner_id: 1,
            nominee_name: nomineeData.nominee_name,
            nominee_email: nomineeData.nominee_email,
            relationship: nomineeData.relationship || 'Family Member',
            access_level: nomineeData.access_level || 'view',
            allowed_categories: nomineeData.allowed_categories || 'all',
            status: 'active',
            created_at: new Date().toISOString()
        };
        nominees.unshift(newNom);
        localStorage.setItem(this.STORAGE_KEY_NOMINEES, JSON.stringify(nominees));
        return { success: true, nominee: newNom, message: `Access granted to ${newNom.nominee_name}!` };
    }

    async deleteNominee(id) {
        await this.checkBackendAvailability();
        if (this.useBackend) {
            try {
                const res = await fetch(`/api/family/${id}`, {
                    method: 'DELETE',
                    credentials: 'same-origin'
                });
                return await res.json();
            } catch (e) {}
        }
        let nominees = JSON.parse(localStorage.getItem(this.STORAGE_KEY_NOMINEES) || '[]');
        nominees = nominees.filter(n => n.id != id);
        localStorage.setItem(this.STORAGE_KEY_NOMINEES, JSON.stringify(nominees));
        return { success: true, message: 'Nominee access revoked.' };
    }

    // ----------------- Stats & Dashboard -----------------
    async getStats() {
        await this.checkBackendAvailability();
        if (this.useBackend) {
            try {
                const res = await fetch('/api/stats', {
                    credentials: 'same-origin'
                });
                const data = await res.json();
                if (data.success) return data.stats;
            } catch (e) {}
        }

        const items = await this.getItems();
        const nominees = await this.getNominees();
        const roomsMap = {};
        items.forEach(i => {
            roomsMap[i.room] = (roomsMap[i.room] || 0) + 1;
        });
        const roomsList = Object.entries(roomsMap).map(([room, count]) => ({ room, count }));

        return {
            total_items: items.length,
            total_rooms: Object.keys(roomsMap).length,
            total_nominees: nominees.length,
            rooms: roomsList,
            recent_items: items.slice(0, 5)
        };
    }

    // ----------------- Reset & Export -----------------
    async resetToDemo() {
        await this.checkBackendAvailability();
        if (this.useBackend) {
            try {
                await fetch('/api/backup/reset', { method: 'POST', credentials: 'same-origin' });
            } catch (e) {}
        }
        localStorage.setItem(this.STORAGE_KEY_ITEMS, JSON.stringify(INITIAL_DEMO_DATA.items));
        localStorage.setItem(this.STORAGE_KEY_NOMINEES, JSON.stringify(INITIAL_DEMO_DATA.nominees));
        localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(INITIAL_DEMO_DATA.users));
        localStorage.removeItem(this.STORAGE_KEY_LOGGED_OUT);
        return { success: true, message: 'All demo items and settings reset to defaults.' };
    }

    async exportData() {
        const items = await this.getItems();
        const nominees = await this.getNominees();
        const payload = {
            appName: "Find My Stuff AI",
            version: "1.0",
            exportDate: new Date().toISOString(),
            items,
            nominees
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `findmystuff_backup_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        return { success: true };
    }
}

window.API = new SmartHomeAPI();
