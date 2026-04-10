/**
 * SOVEREIGN MIND VAULT - IndexedDB Persistence Layer
 * Pure Vanilla JS, No Dependencies.
 */

const DB_NAME = 'SovereignMindVault';
const DB_VERSION = 1;
const STORE_NAME = 'UserProtocol';

window.SovereignVault = {
    db: null,

    async init() {
        if (this.db) return this.db;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                reject(event.target.error);
            };
        });
    },

    async get(key) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    },

    async getAll() {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.openCursor();
            const result = {};

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    result[cursor.key] = cursor.value;
                    cursor.continue();
                } else {
                    resolve(result);
                }
            };
            request.onerror = (event) => reject(event.target.error);
        });
    },

    async set(key, value) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(value, key);

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    },

    async delete(key) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    },

    async clear() {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }
};

window.SovereignStore = {
    getKey(k) {
        return `SV_${k}`;
    },
    get(key, defaultVal = null) {
        const val = localStorage.getItem(this.getKey(key));
        return val ? JSON.parse(val) : defaultVal;
    },
    set(key, value) {
        localStorage.setItem(this.getKey(key), JSON.stringify(value));
    },
    initProfile() {
        if (!this.get('profile')) {
            this.set('profile', {
                User_XP: 0,
                Proficiency_Level: 1,
                Current_Streak: 0,
                Compliance_History: []
            });
        }
    },
    getProfile() {
        this.initProfile();
        return this.get('profile');
    },
    addXP(amount) {
        const profile = this.getProfile();
        profile.User_XP += amount;
        const newLevel = Math.floor(profile.User_XP / 500) + 1;
        if (newLevel > profile.Proficiency_Level) profile.Proficiency_Level = newLevel;
        this.set('profile', profile);
        return profile;
    },
    updateStreak(isSuccess) {
        const profile = this.getProfile();
        profile.Current_Streak = isSuccess ? profile.Current_Streak + 1 : 0;
        this.set('profile', profile);
    },
    logCompliance(dayIndex, is100Percent) {
        const profile = this.getProfile();
        if (is100Percent && !profile.Compliance_History.includes(dayIndex)) {
            profile.Compliance_History.push(dayIndex);
        } else if (!is100Percent) {
            profile.Compliance_History = profile.Compliance_History.filter(d => d !== dayIndex);
        }
        this.set('profile', profile);
    }
};
