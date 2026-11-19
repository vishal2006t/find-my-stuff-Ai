/**
 * Find My Stuff AI - Smart Search & Natural Language Processor
 * Handles intent detection, synonym expansion, semantic scoring, and conversational AI response synthesis.
 * Resilient against special characters, word boundary false positives, and multi-token queries.
 */

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const SMART_SYNONYMS = {
    'passport': ['passport', 'travel document', 'visa', 'id', 'identification', 'permit', 'papers', 'boarding pass', 'international permit'],
    'keys': ['key', 'keys', 'car keys', 'house keys', 'keychain', 'keyfob', 'fob', 'car key', 'door key', 'lock', 'mailbox key', 'bmw'],
    'charger': ['charger', 'cable', 'cord', 'wire', 'adapter', 'power brick', 'usb-c', 'magsafe', 'lightning', 'fast charger', 'power cable'],
    'remote': ['remote', 'tv remote', 'television remote', 'controller', 'clicker', 'samsung remote', 'remote control', 'frame tv'],
    'medicine': ['medicine', 'pill', 'pills', 'tablet', 'tablets', 'first aid', 'prescription', 'allergy', 'medical', 'ointment', 'pharmacy', 'drugs', 'bandaid', 'antiseptic'],
    'drill': ['drill', 'power drill', 'tools', 'screwdriver', 'bits', 'hardware', 'toolbox', 'wrench', 'screw', 'stanley'],
    'tools': ['tool', 'tools', 'drill', 'screwdriver', 'hammer', 'wrench', 'pliers', 'measuring tape', 'hardware', 'toolbox'],
    'headphones': ['headphones', 'earphones', 'headset', 'airpods', 'earbuds', 'sony', 'xm5', 'audio', 'ear plugs', 'noise cancelling'],
    'wallet': ['wallet', 'purse', 'card', 'credit card', 'cards', 'cash', 'money', 'pocketbook', 'rfid'],
    'laptop': ['laptop', 'macbook', 'computer', 'notebook', 'pc', 'chromebook', 'apple'],
    'glasses': ['glasses', 'spectacles', 'sunglasses', 'reading glasses', 'shades', 'eyewear'],
    'watch': ['watch', 'smartwatch', 'apple watch', 'rolex', 'timepiece', 'wrist watch'],
    'documents': ['document', 'documents', 'papers', 'certificate', 'file', 'deed', 'contract', 'insurance', 'receipts'],
    'vault': ['vault', 'safe', 'lockbox', 'valuables', 'gold', 'jewels', 'jewelry']
};

const SEARCH_STOP_WORDS = new Set([
    'where', 'did', 'i', 'keep', 'put', 'leave', 'store', 'placed', 'my', 'the', 'a', 'an',
    'find', 'is', 'are', 'was', 'were', 'what', 'can', 'you', 'tell', 'me', 'location',
    'of', 'for', 'in', 'at', 'on', 'our', 'search', 'get', 'show', 'please', 'know', 'how',
    'have', 'item', 'stuff', 'belonging', 'belongings'
]);

class SmartSearchEngine {
    constructor() {
        this.synonyms = SMART_SYNONYMS;
        this.stopWords = SEARCH_STOP_WORDS;
    }

    tokenize(query) {
        if (!query) return [];
        const cleaned = query.toLowerCase().replace(/[^\w\s-]/g, ' ');
        return cleaned.split(/\s+/).filter(t => t.length > 0 && !this.stopWords.has(t));
    }

    search(query, items) {
        const raw = (query || '').trim();
        if (!raw) {
            return {
                query: '',
                count: 0,
                results: [],
                top_match: null,
                ai_response: "Please enter or speak an item name to search."
            };
        }

        const rawLower = raw.toLowerCase();
        let tokens = this.tokenize(raw);
        if (tokens.length === 0) {
            tokens = [rawLower];
        }

        // Build token to synonym mapping
        const tokenSynonymMap = {};
        tokens.forEach(token => {
            const syns = new Set([token]);
            for (const [key, synList] of Object.entries(this.synonyms)) {
                if (token === key || synList.includes(token)) {
                    synList.forEach(s => syns.add(s));
                }
            }
            tokenSynonymMap[token] = syns;
        });

        const scored = [];

        items.forEach(item => {
            let score = 0;
            const matchedTokens = new Set();

            const nameLower = (item.name || '').toLowerCase();
            const roomLower = (item.room || '').toLowerCase();
            const locLower = (item.storage_location || '').toLowerCase();
            const notesLower = (item.notes || '').toLowerCase();
            const tagsLower = (item.tags || '').toLowerCase();
            const catLower = (item.category || '').toLowerCase();
            const allText = `${nameLower} ${tagsLower} ${catLower} ${locLower} ${roomLower} ${notesLower}`;

            // 1. Direct full/phrase matching
            if (nameLower.includes(rawLower) || rawLower.includes(nameLower)) {
                score += 50;
                tokens.forEach(t => matchedTokens.add(t));
            }

            // 2. Multi-word phrase parts
            const nameParts = nameLower.split(/[&,/-]/).map(p => p.trim());
            for (const part of nameParts) {
                if (part.length >= 3 && (rawLower.includes(part) || part.includes(rawLower))) {
                    score += 40;
                    tokens.forEach(t => matchedTokens.add(t));
                }
            }

            // 3. Token & Synonym whole-word boundary matching
            for (const [token, synSet] of Object.entries(tokenSynonymMap)) {
                let tokenMatched = false;
                synSet.forEach(syn => {
                    try {
                        const synPattern = new RegExp(`(^|\\W)${escapeRegExp(syn)}(\\W|$)`, 'i');
                        if (synPattern.test(allText)) {
                            tokenMatched = true;
                            if (synPattern.test(nameLower)) score += 35;
                            else if (synPattern.test(tagsLower)) score += 25;
                            else if (synPattern.test(locLower)) score += 15;
                            else if (synPattern.test(roomLower)) score += 12;
                            else if (synPattern.test(catLower)) score += 10;
                            else if (synPattern.test(notesLower)) score += 8;
                        }
                    } catch (e) {
                        if (allText.includes(syn)) {
                            tokenMatched = true;
                            score += 15;
                        }
                    }
                });
                if (tokenMatched) {
                    matchedTokens.add(token);
                }
            }

            // 4. Room query match (e.g. "What is in the garage?")
            if (rawLower.includes(roomLower) && roomLower.length > 2) {
                score += 20;
                matchedTokens.add(roomLower);
            }

            // Relevance coverage check
            const coverage = tokens.length > 0 ? (matchedTokens.size / tokens.length) : 0;
            let isRelevant = false;

            if (tokens.length === 1) {
                isRelevant = (coverage >= 1.0 && score >= 15);
            } else if (tokens.length === 2) {
                isRelevant = (coverage >= 0.5 && score >= 25);
            } else {
                isRelevant = (coverage >= 0.5 && score >= 40);
            }

            if (isRelevant) {
                const confidence = Math.min(99, Math.round(50 + (score / 150) * 49));
                scored.push({
                    item: item,
                    score: score,
                    coverage: coverage,
                    confidence: confidence
                });
            }
        });

        // Sort descending by coverage then score
        scored.sort((a, b) => (b.coverage - a.coverage) || (b.score - a.score));

        if (scored.length > 0) {
            const top = scored[0].item;
            const topConfidence = scored[0].confidence;
            const results = scored.map(s => ({ ...s.item, matchConfidence: s.confidence }));

            let ai_response = `Found it! Your **${top.name}** is stored in the **${top.room}**.\n\n` +
                              `📍 **Exact Location:** ${top.storage_location}`;

            if (top.notes) {
                ai_response += `\n📝 *Notes: ${top.notes}*`;
            }

            if (scored.length > 1) {
                ai_response += `\n\n*(Also found ${scored.length - 1} other related item${scored.length > 2 ? 's' : ''})*`;
            }

            return {
                query: raw,
                count: scored.length,
                results: results,
                top_match: top,
                confidence: topConfidence,
                ai_response: ai_response
            };
        } else {
            return {
                query: raw,
                count: 0,
                results: [],
                top_match: null,
                confidence: 0,
                ai_response: `No saved location found for "${raw}". Try another search or add this item to your smart memory.`
            };
        }
    }
}

window.SmartSearch = new SmartSearchEngine();
