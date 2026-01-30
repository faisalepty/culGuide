// Configuration for culGuide application
const CONFIG = {
    // OpenRouter AI settings (exposed to client). In production, proxy this server-side.
    openrouter: {
        apiKey: undefined,
        readyPromise: null
    },
    // Geolocation settings
    geolocation: {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
    },
    
    // Map settings
    map: {
        defaultZoom: 14,
        maxZoom: 18,
        minZoom: 10
    },
    
    // Cultural data APIs (for future integration)
    apis: {
        // Example endpoints for real cultural data
        foursquare: 'https://api.foursquare.com/v3/places/search',
        googlePlaces: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        openStreetMap: 'https://overpass-api.de/api/interpreter'
    },
    
    // Cultural activity categories
    categories: {
        museum: { color: '#2563eb', icon: 'fas fa-landmark' },
        performance: { color: '#7c3aed', icon: 'fas fa-theater-masks' },
        local: { color: '#f59e0b', icon: 'fas fa-utensils' },
        historical: { color: '#10b981', icon: 'fas fa-monument' },
        workshop: { color: '#ef4444', icon: 'fas fa-tools' },
        gallery: { color: '#8b5cf6', icon: 'fas fa-palette' }
    },
    
    // Search radius for nearby activities (in kilometers)
    searchRadius: 5,
    
    // Maximum number of activities to display
    maxActivities: 20
};

// Attempt to load API key from .env when running in the browser
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

(function initOpenRouterKey(){
    if (typeof window === 'undefined') return; // Node/CommonJS path ignored

    function parseEnv(text) {
        try {
            const lines = text.split(/\r?\n/);
            for (const line of lines) {
                const m = line.match(/^OPEN_ROUTER_API\s*=\s*(.*)\s*$/);
                if (m) return m[1].trim();
            }
        } catch (_) {}
        return undefined;
    }

    async function loadFromEnvFile() {
        if (!location || !(location.protocol === 'http:' || location.protocol === 'https:')) {
            return; // can't fetch .env via file: protocol
        }
        const res = await fetch('.env', { cache: 'no-store' });
        if (!res.ok) return;
        const text = await res.text();
        const key = parseEnv(text);
        if (key) {
            CONFIG.openrouter.apiKey = key;
            window.OPENROUTER_API_KEY = key;
            window.dispatchEvent(new CustomEvent('openrouter:ready'));
        }
    }

    const p = loadFromEnvFile().catch(() => {});
    CONFIG.openrouter.readyPromise = p;
})();

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}