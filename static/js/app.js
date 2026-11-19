/**
 * Find My Stuff AI - Main Application Controller
 * Handles page navigation, UI events, smart search rendering,
 * item CRUD workflows, nominee management, and authentication states.
 * Fully optimized image handling with client-side scaling and resilient fallbacks.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // ---------------- App State ----------------
    const state = {
        currentUser: null,
        items: [],
        nominees: [],
        stats: null,
        activeView: 'view-home',
        searchQuery: '',
        filterCategory: 'all',
        filterRoom: 'all',
        filterText: '',
        viewMode: 'grid', // 'grid' | 'list'
        activeEditingItemId: null,
        selectedPresetImage: 'preset_box',
        uploadedImageBase64: null,
        editUploadedImageBase64: null
    };

    // ---------------- DOM Element References ----------------
    const views = document.querySelectorAll('.view-section');
    const navButtons = document.querySelectorAll('[data-view-target]');
    const userBadgeBtn = document.getElementById('userBadgeBtn');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userRoleDisplay = document.getElementById('userRoleDisplay');
    const userAvatarText = document.getElementById('userAvatarText');

    // Hero Search Elements
    const heroSearchInput = document.getElementById('heroSearchInput');
    const heroSearchBtn = document.getElementById('heroSearchBtn');
    const heroVoiceBtn = document.getElementById('heroVoiceBtn');
    const voiceStatusBar = document.getElementById('voiceStatusBar');
    const voiceStatusText = document.getElementById('voiceStatusText');
    const promptPills = document.querySelectorAll('.prompt-pill');

    // Auth Elements
    const authTabLogin = document.getElementById('authTabLogin');
    const authTabRegister = document.getElementById('authTabRegister');
    const formLogin = document.getElementById('formLogin');
    const formRegister = document.getElementById('formRegister');
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    const toggleLoginPwBtn = document.getElementById('toggleLoginPwBtn');
    const demoLoginAlexBtn = document.getElementById('demoLoginAlexBtn');
    const demoLoginSarahBtn = document.getElementById('demoLoginSarahBtn');

    // Add Item Elements
    const formAddItem = document.getElementById('formAddItem');
    const addItemPhotoInput = document.getElementById('addItemPhotoInput');
    const photoUploadBox = document.getElementById('photoUploadBox');
    const photoPreviewImg = document.getElementById('photoPreviewImg');
    const photoPreviewControls = document.getElementById('photoPreviewControls');
    const btnRemovePhoto = document.getElementById('btnRemovePhoto');
    const photoUploadPrompt = document.getElementById('photoUploadPrompt');
    const presetChips = document.querySelectorAll('.preset-chip-btn');
    const roomSelect = document.getElementById('itemRoomSelect');
    const customRoomWrapper = document.getElementById('customRoomWrapper');
    const customRoomInput = document.getElementById('itemCustomRoomInput');

    // Saved Items Elements
    const itemsContainer = document.getElementById('itemsContainer');
    const itemsFilterCategory = document.getElementById('itemsFilterCategory');
    const itemsFilterRoom = document.getElementById('itemsFilterRoom');
    const itemsFilterSearch = document.getElementById('itemsFilterSearch');
    const viewGridBtn = document.getElementById('viewGridBtn');
    const viewListBtn = document.getElementById('viewListBtn');
    const totalItemsBadge = document.getElementById('totalItemsBadge');

    // AI Results Elements
    const aiSpeechBubble = document.getElementById('aiSpeechBubble');
    const aiMatchSpotlight = document.getElementById('aiMatchSpotlight');
    const aiOtherMatchesGrid = document.getElementById('aiOtherMatchesGrid');
    const emptyResultsBox = document.getElementById('emptyResultsBox');
    const searchedQueryLabel = document.getElementById('searchedQueryLabel');

    // Family / Nominee Elements
    const formAddNominee = document.getElementById('formAddNominee');
    const nomineesListContainer = document.getElementById('nomineesListContainer');
    const nomineePersonaTestBtn = document.getElementById('nomineePersonaTestBtn');

    // Profile Elements
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileRole = document.getElementById('profileRole');
    const profileAvatar = document.getElementById('profileAvatar');
    const formChangePassword = document.getElementById('formChangePassword');
    const btnPasskeySetup = document.getElementById('btnPasskeySetup');
    const btnExportData = document.getElementById('btnExportData');
    const btnResetDemo = document.getElementById('btnResetDemo');
    const btnLogout = document.getElementById('btnLogout');

    // Modals
    const editItemModal = document.getElementById('editItemModal');
    const formEditItem = document.getElementById('formEditItem');
    const editItemPhotoPreview = document.getElementById('editItemPhotoPreview');
    const editItemPhotoInput = document.getElementById('editItemPhotoInput');
    const btnChangeEditPhoto = document.getElementById('btnChangeEditPhoto');
    const editItemImageUrl = document.getElementById('editItemImageUrl');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const passkeyModal = document.getElementById('passkeyModal');
    const closePasskeyModalBtn = document.getElementById('closePasskeyModalBtn');

    // Theme Switcher Elements
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeToggleLabel = document.getElementById('themeToggleLabel');

    let itemPendingDeletionId = null;

    // ---------------- Theme Management ----------------
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('findmystuff_theme', theme);
        if (themeToggleLabel) {
            themeToggleLabel.textContent = theme === 'light' ? 'Light' : 'Dark';
        }
        if (themeToggleBtn) {
            themeToggleBtn.setAttribute('aria-checked', theme === 'light' ? 'true' : 'false');
            themeToggleBtn.setAttribute('title', `Active: ${theme === 'light' ? 'Light Mode (☀️)' : 'Dark Mode (🌙)'} – Click to switch`);
        }
    }

    // Apply saved theme or default to Dark mode
    const currentSavedTheme = localStorage.getItem('findmystuff_theme') || 'dark';
    applyTheme(currentSavedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(nextTheme);
            showToast(`${nextTheme === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'} activated.`);
        });
    }

    // ---------------- Image Processing Helper ----------------
    // Auto-scales large camera uploads on a Canvas to ~900px JPEG (~80-120KB)
    // Ensures instant upload, zero localStorage overflow, and permanent persistence across page reloads.
    function compressAndScaleImage(file, maxDimension = 900, quality = 0.85) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
                reject(new Error("Please select an image file."));
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = Math.round((height * maxDimension) / width);
                            width = maxDimension;
                        } else {
                            width = Math.round((width * maxDimension) / height);
                            height = maxDimension;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                };
                img.onerror = () => reject(new Error("Failed to decode image."));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error("Failed to read file."));
            reader.readAsDataURL(file);
        });
    }

    // ---------------- Navigation & View Switching ----------------
    function showView(viewId) {
        views.forEach(v => {
            v.classList.remove('active');
            if (v.id === viewId) v.classList.add('active');
        });

        // Update nav active states
        navButtons.forEach(btn => {
            if (btn.getAttribute('data-view-target') === viewId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        state.activeView = viewId;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Trigger view-specific refreshes
        if (viewId === 'view-home') {
            loadDashboardStats();
        } else if (viewId === 'view-items') {
            renderSavedItems();
        } else if (viewId === 'view-family') {
            renderNomineesList();
        } else if (viewId === 'view-profile') {
            renderProfileData();
        }
    }

    // Bind navigation buttons
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = btn.getAttribute('data-view-target');
            if (target) showView(target);
        });
    });

    document.querySelectorAll('.logo-home-trigger').forEach(el => {
        el.addEventListener('click', () => showView('view-home'));
    });

    // ---------------- Notification System ----------------
    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast-item ${type === 'error' ? 'toast-error' : ''}`;

        let iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        if (type === 'error') {
            iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
        }

        toast.innerHTML = `${iconSvg} <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Bind user badge click to Profile or Auth
    if (userBadgeBtn) {
        userBadgeBtn.addEventListener('click', () => {
            if (state.currentUser) {
                showView('view-profile');
            } else {
                showView('view-auth');
            }
        });
    }

    // ---------------- User State & Authentication ----------------
    async function updateAuthUI() {
        state.currentUser = await window.API.getCurrentUser();
        if (state.currentUser) {
            userNameDisplay.textContent = state.currentUser.name;
            userRoleDisplay.textContent = state.currentUser.role === 'nominee' ? 'Nominee Access' : 'Homeowner';
            userAvatarText.textContent = state.currentUser.name.charAt(0).toUpperCase();

            // Hide/Show nominee restricted controls
            if (state.currentUser.role === 'nominee') {
                document.querySelectorAll('.owner-only').forEach(el => el.style.display = 'none');
            } else {
                document.querySelectorAll('.owner-only').forEach(el => el.style.display = '');
            }
        } else {
            userNameDisplay.textContent = 'Sign In';
            userRoleDisplay.textContent = 'Guest';
            userAvatarText.textContent = '?';
            document.querySelectorAll('.owner-only').forEach(el => el.style.display = 'none');
        }
    }

    // Login Form Submit
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginEmailInput.value.trim();
            const password = loginPasswordInput.value;
            const res = await window.API.login(email, password);
            if (res.success) {
                showToast(res.message);
                await updateAuthUI();
                await loadItems();
                showView('view-home');
            } else {
                showToast(res.message, 'error');
            }
        });
    }

    // Register Form Submit
    if (formRegister) {
        formRegister.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const res = await window.API.register(name, email, password);
            if (res.success) {
                showToast(res.message);
                await updateAuthUI();
                await loadItems();
                showView('view-home');
            } else {
                showToast(res.message, 'error');
            }
        });
    }

    // Quick Demo Account Logins
    if (demoLoginAlexBtn) {
        demoLoginAlexBtn.addEventListener('click', async () => {
            const res = await window.API.login('alex@smarthome.ai', 'password123');
            if (res.success) {
                showToast("Logged in as Homeowner: Alex Mercer");
                await updateAuthUI();
                await loadItems();
                showView('view-home');
            }
        });
    }

    if (demoLoginSarahBtn) {
        demoLoginSarahBtn.addEventListener('click', async () => {
            const res = await window.API.login('sarah@smarthome.ai', 'password123');
            if (res.success) {
                showToast("Logged in as Nominee: Sarah Mercer (Restricted items hidden)");
                await updateAuthUI();
                await loadItems();
                showView('view-home');
            }
        });
    }

    // Auth Tabs Toggle
    if (authTabLogin && authTabRegister) {
        authTabLogin.addEventListener('click', () => {
            authTabLogin.classList.add('active');
            authTabRegister.classList.remove('active');
            formLogin.style.display = 'block';
            formRegister.style.display = 'none';
        });
        authTabRegister.addEventListener('click', () => {
            authTabRegister.classList.add('active');
            authTabLogin.classList.remove('active');
            formRegister.style.display = 'block';
            formLogin.style.display = 'none';
        });
    }

    // Toggle Password Visibility
    if (toggleLoginPwBtn) {
        toggleLoginPwBtn.addEventListener('click', () => {
            const isPw = loginPasswordInput.type === 'password';
            loginPasswordInput.type = isPw ? 'text' : 'password';
        });
    }

    // Logout
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            await window.API.logout();
            await updateAuthUI();
            showToast("Logged out successfully.");
            showView('view-auth');
        });
    }

    // ---------------- AI Smart Search Execution ----------------
    async function executeSearch(query) {
        if (!query || !query.trim()) {
            showToast("Please enter an item name to search.", "error");
            return;
        }

        state.searchQuery = query.trim();
        searchedQueryLabel.textContent = `"${state.searchQuery}"`;

        // Switch to AI Search Results view
        showView('view-search-results');

        // Show thinking animation state
        aiSpeechBubble.innerHTML = `<span class="voice-visualizer"><span></span><span></span><span></span><span></span><span></span></span> Analyzing household memory records...`;
        aiMatchSpotlight.innerHTML = '';
        aiOtherMatchesGrid.innerHTML = '';
        emptyResultsBox.style.display = 'none';

        const result = await window.API.search(state.searchQuery);

        if (result && result.count > 0 && result.top_match) {
            emptyResultsBox.style.display = 'none';

            // Format conversational AI response
            const formattedSpeech = result.ai_response
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n\n/g, '<br><br>')
                .replace(/\n/g, '<br>');

            aiSpeechBubble.innerHTML = `<p>${formattedSpeech}</p>`;

            // Render Match Spotlight Card
            const top = result.top_match;
            const imgSrc = resolveItemImage(top.image_url, top.category);

            aiMatchSpotlight.innerHTML = `
                <div class="match-spotlight-card glass-panel animate-fade-in">
                    <div class="spotlight-media">
                        <img src="${imgSrc}" alt="${top.name}" data-category="${top.category}" onerror="this.onerror=null; this.src=getCategoryFallback(this.dataset.category);">
                    </div>
                    <div class="spotlight-info">
                        <span class="confidence-indicator">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ${result.confidence || 98}% Verified Match
                        </span>
                        <h2 style="font-size: 1.45rem; font-weight: 800; margin-bottom: 8px;">${top.name}</h2>
                        <span class="item-room-tag">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                            ${top.room}
                        </span>
                        <div class="item-location-highlight" style="margin: 12px 0;">
                            <span class="location-label">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                Exact Stored Location
                            </span>
                            <div class="location-text">${top.storage_location}</div>
                        </div>
                        ${top.notes ? `<p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 14px;"><strong>Note:</strong> ${top.notes}</p>` : ''}
                        <div style="display: flex; gap: 10px; margin-top: 8px;">
                            <button class="action-btn-edit" onclick="window.editItemById(${top.id})">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                Edit Record
                            </button>
                            <button class="btn-primary" style="padding: 7px 18px; font-size: 0.85rem;" onclick="window.locateItemPulse(${top.id})">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                Pin in Saved Items
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // If there are additional matches
            if (result.results && result.results.length > 1) {
                const secondary = result.results.slice(1);
                aiOtherMatchesGrid.innerHTML = `<h3 style="grid-column: 1 / -1; font-size: 1.15rem; font-weight: 700; color: var(--text-muted); margin-bottom: 12px;">Other Potentially Related Belongings</h3>`;
                secondary.forEach(item => {
                    const card = createItemCardElement(item);
                    aiOtherMatchesGrid.appendChild(card);
                });
            }
        } else {
            // Honest Empty State
            aiSpeechBubble.innerHTML = `<p>${result.ai_response}</p>`;
            aiMatchSpotlight.innerHTML = '';
            emptyResultsBox.style.display = 'block';
        }
    }

    // Search bar submit button
    if (heroSearchBtn) {
        heroSearchBtn.addEventListener('click', () => {
            executeSearch(heroSearchInput.value);
        });
    }

    if (heroSearchInput) {
        heroSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                executeSearch(heroSearchInput.value);
            }
        });
    }

    // Quick Prompt Pills
    promptPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const query = pill.getAttribute('data-query') || pill.textContent.trim().replace(/^[^a-zA-Z0-9]+/, '');
            heroSearchInput.value = query;
            executeSearch(query);
        });
    });

    // ---------------- Voice Search Integration ----------------
    if (heroVoiceBtn) {
        heroVoiceBtn.addEventListener('click', () => {
            window.VoiceSearch.startListening(
                (transcript) => {
                    heroSearchInput.value = transcript;
                    executeSearch(transcript);
                },
                (isListening, statusText) => {
                    if (isListening) {
                        heroVoiceBtn.classList.add('animate-voice-listening');
                        voiceStatusBar.classList.add('active');
                        voiceStatusText.textContent = statusText;
                    } else {
                        heroVoiceBtn.classList.remove('animate-voice-listening');
                        setTimeout(() => voiceStatusBar.classList.remove('active'), 2500);
                    }
                },
                (errorMessage) => {
                    showToast(errorMessage, 'error');
                }
            );
        });
    }

    // ---------------- Add New Item Flow ----------------
    // Preset selection
    presetChips.forEach(chip => {
        chip.addEventListener('click', () => {
            presetChips.forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            const presetKey = chip.getAttribute('data-preset');
            state.selectedPresetImage = presetKey;
            state.uploadedImageBase64 = null;

            photoPreviewImg.src = resolveItemImage(presetKey);
            photoPreviewImg.style.display = 'block';
            if (photoPreviewControls) photoPreviewControls.style.display = 'block';
            photoUploadPrompt.style.display = 'none';
        });
    });

    // Custom Room dropdown trigger
    if (roomSelect) {
        roomSelect.addEventListener('change', () => {
            if (roomSelect.value === 'custom') {
                customRoomWrapper.style.display = 'block';
                customRoomInput.focus();
            } else {
                customRoomWrapper.style.display = 'none';
            }
        });
    }

    // Handle Uploaded File with automatic Canvas compression
    async function handleFileSelected(file) {
        if (!file) return;
        try {
            const compressedBase64 = await compressAndScaleImage(file);
            state.uploadedImageBase64 = compressedBase64;
            state.selectedPresetImage = null;

            photoPreviewImg.src = compressedBase64;
            photoPreviewImg.style.display = 'block';
            if (photoPreviewControls) photoPreviewControls.style.display = 'block';
            photoUploadPrompt.style.display = 'none';
            presetChips.forEach(c => c.classList.remove('selected'));
            showToast("Photograph attached & optimized!", "info");
        } catch (err) {
            showToast(err.message || "Could not process image.", "error");
        }
    }

    if (addItemPhotoInput) {
        addItemPhotoInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleFileSelected(e.target.files[0]);
            }
        });
    }

    // Drag and Drop support
    if (photoUploadBox) {
        photoUploadBox.addEventListener('click', (e) => {
            if (e.target.closest('#btnRemovePhoto')) return;
            addItemPhotoInput.click();
        });

        photoUploadBox.addEventListener('dragover', (e) => {
            e.preventDefault();
            photoUploadBox.classList.add('dragover');
        });

        photoUploadBox.addEventListener('dragleave', () => {
            photoUploadBox.classList.remove('dragover');
        });

        photoUploadBox.addEventListener('drop', (e) => {
            e.preventDefault();
            photoUploadBox.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelected(e.dataTransfer.files[0]);
            }
        });
    }

    // Remove photo reset button
    if (btnRemovePhoto) {
        btnRemovePhoto.addEventListener('click', (e) => {
            e.stopPropagation();
            state.uploadedImageBase64 = null;
            state.selectedPresetImage = 'preset_box';
            photoPreviewImg.src = '';
            photoPreviewImg.style.display = 'none';
            photoPreviewControls.style.display = 'none';
            photoUploadPrompt.style.display = 'block';
            addItemPhotoInput.value = '';
            presetChips.forEach(c => c.classList.remove('selected'));
            showToast("Photo removed. Default category icon will be used.");
        });
    }

    // Add Item Form Submit
    if (formAddItem) {
        formAddItem.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('itemName').value.trim();
            const category = document.getElementById('itemCategory').value;
            let room = roomSelect.value;
            if (room === 'custom') {
                room = customRoomInput.value.trim() || 'Living Room';
            }
            const storage_location = document.getElementById('itemLocation').value.trim();
            const notes = document.getElementById('itemNotes').value.trim();
            const tags = document.getElementById('itemTags').value.trim();
            const is_private = document.getElementById('itemIsPrivate').checked;

            const finalImage = state.uploadedImageBase64 || state.selectedPresetImage || 'preset_box';

            if (!name || !storage_location) {
                showToast("Please provide item name and exact storage location.", "error");
                return;
            }

            const itemPayload = {
                name,
                category,
                room,
                storage_location,
                notes,
                tags,
                is_private,
                image_url: finalImage
            };

            const res = await window.API.addItem(itemPayload);
            if (res.success) {
                showToast(res.message);
                formAddItem.reset();
                photoPreviewImg.style.display = 'none';
                if (photoPreviewControls) photoPreviewControls.style.display = 'none';
                photoUploadPrompt.style.display = 'block';
                state.uploadedImageBase64 = null;
                state.selectedPresetImage = 'preset_box';
                await loadItems();
                showView('view-items');
            } else {
                showToast(res.message || "Failed to save item.", "error");
            }
        });
    }

    // ---------------- Saved Items List & Filters ----------------
    async function loadItems() {
        state.items = await window.API.getItems({
            category: state.filterCategory,
            room: state.filterRoom,
            q: state.filterText
        });
        if (totalItemsBadge) {
            totalItemsBadge.textContent = `${state.items.length} Items`;
        }
    }

    function renderSavedItems() {
        if (!itemsContainer) return;
        itemsContainer.innerHTML = '';

        if (state.items.length === 0) {
            itemsContainer.innerHTML = `
                <div class="empty-results-box glass-panel" style="grid-column: 1 / -1; padding: 60px 20px;">
                    <div class="empty-results-icon">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                    </div>
                    <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 6px;">No Saved Items Found</h3>
                    <p style="color: var(--text-muted); max-width: 440px; margin: 0 auto 22px auto;">You haven't recorded any items matching this search or filter yet.</p>
                    <button class="btn-primary" onclick="document.querySelector('[data-view-target=\\'view-add\\']').click()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Add New Item Now
                    </button>
                </div>
            `;
            return;
        }

        state.items.forEach(item => {
            const card = createItemCardElement(item);
            itemsContainer.appendChild(card);
        });
    }

    function createItemCardElement(item) {
        const card = document.createElement('div');
        card.className = 'item-card animate-fade-in';
        card.setAttribute('data-id', item.id);

        const imgSrc = resolveItemImage(item.image_url, item.category);
        const privacyBadge = item.is_private
            ? `<span class="badge-pill badge-privacy-private">Private</span>`
            : `<span class="badge-pill badge-privacy-shared">Family Shared</span>`;

        // Format relative date
        const dateStr = item.updated_at ? new Date(item.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';

        card.innerHTML = `
            <div class="item-card-media">
                <img src="${imgSrc}" alt="${item.name}" class="item-card-image" loading="lazy" data-category="${item.category}" onerror="this.onerror=null; this.src=getCategoryFallback(this.dataset.category);">
                <div class="item-card-badges">
                    <span class="badge-pill badge-category">${item.category}</span>
                    ${privacyBadge}
                </div>
            </div>
            <div class="item-card-body">
                <h3 class="item-card-title">${item.name}</h3>
                <span class="item-room-tag">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                    ${item.room}
                </span>
                <div class="item-location-highlight">
                    <span class="location-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        Exact Stored Location
                    </span>
                    <div class="location-text">${item.storage_location}</div>
                </div>
                ${item.notes ? `<div class="item-card-notes">${item.notes}</div>` : ''}
                <div class="item-card-footer">
                    <span class="item-updated-date">Saved ${dateStr}</span>
                    <div class="item-actions">
                        <button class="action-btn-edit" title="Edit Item" onclick="window.editItemById(${item.id})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            Edit
                        </button>
                        <button class="action-btn-delete" title="Delete Item" onclick="window.confirmDeleteItem(${item.id})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
        return card;
    }

    // Filter controls
    if (itemsFilterCategory) {
        itemsFilterCategory.addEventListener('change', async () => {
            state.filterCategory = itemsFilterCategory.value;
            await loadItems();
            renderSavedItems();
        });
    }

    if (itemsFilterRoom) {
        itemsFilterRoom.addEventListener('change', async () => {
            state.filterRoom = itemsFilterRoom.value;
            await loadItems();
            renderSavedItems();
        });
    }

    if (itemsFilterSearch) {
        itemsFilterSearch.addEventListener('input', async (e) => {
            state.filterText = e.target.value;
            await loadItems();
            renderSavedItems();
        });
    }

    // Grid vs List view toggle
    if (viewGridBtn && viewListBtn) {
        viewGridBtn.addEventListener('click', () => {
            viewGridBtn.classList.add('active');
            viewListBtn.classList.remove('active');
            itemsContainer.classList.remove('list-view-mode');
        });
        viewListBtn.addEventListener('click', () => {
            viewListBtn.classList.add('active');
            viewGridBtn.classList.remove('active');
            itemsContainer.classList.add('list-view-mode');
        });
    }

    // Global helper for editing
    window.editItemById = (id) => {
        const item = state.items.find(i => i.id == id);
        if (!item) return;

        state.activeEditingItemId = id;
        state.editUploadedImageBase64 = null;

        document.getElementById('editItemId').value = item.id;
        document.getElementById('editItemName').value = item.name;
        document.getElementById('editItemCategory').value = item.category;
        document.getElementById('editItemRoom').value = item.room;
        document.getElementById('editItemLocation').value = item.storage_location;
        document.getElementById('editItemNotes').value = item.notes || '';
        document.getElementById('editItemTags').value = item.tags || '';
        document.getElementById('editItemIsPrivate').checked = item.is_private === 1;

        if (editItemImageUrl) editItemImageUrl.value = item.image_url || '';
        if (editItemPhotoPreview) {
            editItemPhotoPreview.src = resolveItemImage(item.image_url, item.category);
            editItemPhotoPreview.setAttribute('data-category', item.category);
            editItemPhotoPreview.onerror = function() {
                this.onerror = null;
                this.src = getCategoryFallback(item.category);
            };
        }

        editItemModal.classList.add('active');
    };

    // Change photo button inside Edit Modal
    if (btnChangeEditPhoto && editItemPhotoInput) {
        btnChangeEditPhoto.addEventListener('click', () => {
            editItemPhotoInput.click();
        });

        editItemPhotoInput.addEventListener('change', async (e) => {
            if (e.target.files && e.target.files[0]) {
                try {
                    const compressed = await compressAndScaleImage(e.target.files[0]);
                    state.editUploadedImageBase64 = compressed;
                    if (editItemPhotoPreview) editItemPhotoPreview.src = compressed;
                    showToast("New photograph selected for item!", "info");
                } catch (err) {
                    showToast(err.message || "Failed to process image.", "error");
                }
            }
        });
    }

    if (formEditItem) {
        formEditItem.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = state.activeEditingItemId;
            const updated = {
                name: document.getElementById('editItemName').value.trim(),
                category: document.getElementById('editItemCategory').value,
                room: document.getElementById('editItemRoom').value.trim(),
                storage_location: document.getElementById('editItemLocation').value.trim(),
                notes: document.getElementById('editItemNotes').value.trim(),
                tags: document.getElementById('editItemTags').value.trim(),
                is_private: document.getElementById('editItemIsPrivate').checked
            };

            // If a new photo was uploaded in edit modal
            if (state.editUploadedImageBase64) {
                updated.image_url = state.editUploadedImageBase64;
            }

            const res = await window.API.updateItem(id, updated);
            if (res.success) {
                showToast(res.message);
                editItemModal.classList.remove('active');
                state.editUploadedImageBase64 = null;
                await loadItems();
                renderSavedItems();
            } else {
                showToast(res.message, 'error');
            }
        });
    }

    // Global helper for deleting
    window.confirmDeleteItem = (id) => {
        itemPendingDeletionId = id;
        deleteConfirmModal.classList.add('active');
    };

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            if (itemPendingDeletionId) {
                const res = await window.API.deleteItem(itemPendingDeletionId);
                showToast(res.message);
                deleteConfirmModal.classList.remove('active');
                itemPendingDeletionId = null;
                await loadItems();
                renderSavedItems();
            }
        });
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => {
            deleteConfirmModal.classList.remove('active');
            itemPendingDeletionId = null;
        });
    }

    window.locateItemPulse = (id) => {
        showToast("Locating item in room memory...", "info");
        showView('view-items');
        setTimeout(() => {
            const card = document.querySelector(`.item-card[data-id="${id}"]`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.style.borderColor = '#00f0ff';
                card.style.boxShadow = '0 0 35px rgba(0, 240, 255, 0.8)';
                setTimeout(() => {
                    card.style.borderColor = '';
                    card.style.boxShadow = '';
                }, 2800);
            }
        }, 300);
    };

    // Close Modals on Overlay or close button click
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        });
    });

    // ---------------- Dashboard Stats & Room Grid ----------------
    async function loadDashboardStats() {
        const stats = await window.API.getStats();
        if (!stats) return;

        const statTotal = document.getElementById('statTotalItems');
        const statRooms = document.getElementById('statTotalRooms');
        const statNominees = document.getElementById('statTotalNominees');
        const statLast = document.getElementById('statLastAdded');

        if (statTotal) statTotal.textContent = stats.total_items;
        if (statRooms) statRooms.textContent = stats.total_rooms;
        if (statNominees) statNominees.textContent = stats.total_nominees;
        if (statLast && stats.recent_items && stats.recent_items.length > 0) {
            statLast.textContent = stats.recent_items[0].name.slice(0, 16) + '...';
        }

        // Render Room Cards
        const roomsGrid = document.getElementById('dashboardRoomsGrid');
        if (roomsGrid) {
            roomsGrid.innerHTML = '';
            const roomIcons = {
                'Living Room': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"></path><path d="M9 22V12h6v10"></path><path d="M2 10.6L12 2l10 8.6"></path></svg>`,
                'Master Bedroom': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg>`,
                'Home Office': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
                'Kitchen': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`,
                'Garage': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18"></path><path d="M3 15h18"></path><path d="M9 3v18"></path></svg>`,
                'Attic': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 22 22 22"></polygon></svg>`
            };

            const defaultRooms = ['Living Room', 'Master Bedroom', 'Home Office', 'Kitchen', 'Garage'];
            const roomCounts = {};
            if (stats.rooms) {
                stats.rooms.forEach(r => roomCounts[r.room] = r.count);
            }

            defaultRooms.forEach(roomName => {
                const count = roomCounts[roomName] || 0;
                const iconSvg = roomIcons[roomName] || roomIcons['Living Room'];
                const card = document.createElement('div');
                card.className = 'room-card glass-panel';
                card.innerHTML = `
                    <div class="room-card-icon">${iconSvg}</div>
                    <div class="room-card-name">${roomName}</div>
                    <div class="room-card-count">${count} Item${count === 1 ? '' : 's'}</div>
                `;
                card.addEventListener('click', () => {
                    state.filterRoom = roomName;
                    if (itemsFilterRoom) itemsFilterRoom.value = roomName;
                    showView('view-items');
                });
                roomsGrid.appendChild(card);
            });
        }

        // Render Recent Belongings
        const recentGrid = document.getElementById('dashboardRecentGrid');
        if (recentGrid && stats.recent_items) {
            recentGrid.innerHTML = '';
            stats.recent_items.slice(0, 3).forEach(item => {
                const card = createItemCardElement(item);
                recentGrid.appendChild(card);
            });
        }
    }

    // ---------------- Family Nominee Management ----------------
    async function renderNomineesList() {
        if (!nomineesListContainer) return;
        state.nominees = await window.API.getNominees();

        nomineesListContainer.innerHTML = '';
        if (state.nominees.length === 0) {
            nomineesListContainer.innerHTML = `<p style="color: var(--text-muted); padding: 20px 0;">No family nominees invited yet.</p>`;
            return;
        }

        state.nominees.forEach(nom => {
            const row = document.createElement('div');
            row.className = 'nominee-item-card';
            row.innerHTML = `
                <div class="nominee-meta">
                    <h4>${nom.nominee_name} (${nom.relationship})</h4>
                    <p>${nom.nominee_email}</p>
                    <div class="nominee-badges">
                        <span class="badge-pill" style="background: rgba(0, 240, 255, 0.16); color: var(--accent-cyan);">${nom.access_level === 'full' ? 'Full Access' : 'View Only'}</span>
                        <span class="badge-pill" style="background: rgba(16, 185, 129, 0.16); color: var(--accent-emerald);">${nom.status}</span>
                    </div>
                </div>
                <div>
                    <button class="action-btn-delete" style="padding: 6px 14px; font-size: 0.82rem;" onclick="window.revokeNomineeAccess(${nom.id})">
                        Revoke Access
                    </button>
                </div>
            `;
            nomineesListContainer.appendChild(row);
        });
    }

    // Add Nominee Form
    if (formAddNominee) {
        formAddNominee.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nomineeData = {
                nominee_name: document.getElementById('nomineeName').value.trim(),
                nominee_email: document.getElementById('nomineeEmail').value.trim(),
                relationship: document.getElementById('nomineeRelation').value,
                access_level: document.getElementById('nomineeAccess').value
            };

            const res = await window.API.addNominee(nomineeData);
            if (res.success) {
                showToast(res.message);
                formAddNominee.reset();
                renderNomineesList();
            } else {
                showToast(res.message || "Failed to add nominee.", "error");
            }
        });
    }

    window.revokeNomineeAccess = async (id) => {
        const res = await window.API.deleteNominee(id);
        if (res.success) {
            showToast(res.message);
            renderNomineesList();
        }
    };

    if (nomineePersonaTestBtn) {
        nomineePersonaTestBtn.addEventListener('click', async () => {
            // Switch to Sarah's session
            const res = await window.API.login('sarah@smarthome.ai', 'password123');
            if (res.success) {
                showToast("Simulating Family Nominee (Sarah). Private items are shielded.");
                await updateAuthUI();
                await loadItems();
                showView('view-items');
            }
        });
    }

    // ---------------- Profile & Security ----------------
    function renderProfileData() {
        if (!state.currentUser) return;
        if (profileName) profileName.textContent = state.currentUser.name;
        if (profileEmail) profileEmail.textContent = state.currentUser.email;
        if (profileRole) profileRole.textContent = state.currentUser.role === 'nominee' ? 'Family Nominee Member' : 'Smart Home Administrator';
        if (profileAvatar) profileAvatar.textContent = state.currentUser.name.charAt(0).toUpperCase();
    }

    if (formChangePassword) {
        formChangePassword.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currPw = document.getElementById('currentPassword').value;
            const newPw = document.getElementById('newPassword').value;
            const confirmPw = document.getElementById('confirmPassword').value;

            if (newPw !== confirmPw) {
                showToast("New passwords do not match.", "error");
                return;
            }

            const res = await window.API.changePassword(currPw, newPw);
            if (res.success) {
                showToast(res.message);
                formChangePassword.reset();
            } else {
                showToast(res.message, "error");
            }
        });
    }

    // Passkey setup simulation
    if (btnPasskeySetup) {
        btnPasskeySetup.addEventListener('click', () => {
            passkeyModal.classList.add('active');
        });
    }

    if (closePasskeyModalBtn) {
        closePasskeyModalBtn.addEventListener('click', () => {
            passkeyModal.classList.remove('active');
            showToast("Passkey registered for instant biometric login!");
        });
    }

    // Backup Export
    if (btnExportData) {
        btnExportData.addEventListener('click', async () => {
            await window.API.exportData();
            showToast("Household memory records downloaded as JSON backup!");
        });
    }

    // Reset Demo Data
    if (btnResetDemo) {
        btnResetDemo.addEventListener('click', async () => {
            if (confirm("Reset all items and family nominees to clean demo state?")) {
                await window.API.resetToDemo();
                showToast("Reset complete! Loaded initial realistic belongings.");
                await loadItems();
                showView('view-home');
            }
        });
    }

    // ---------------- Initialize Application ----------------
    await updateAuthUI();
    await loadItems();
    await loadDashboardStats();
    if (!state.currentUser) {
        showView('view-auth');
    } else {
        showView('view-home');
    }
});
