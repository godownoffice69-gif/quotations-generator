/* ============================================
   HELPERS - Core Utility Functions
   ============================================ */

/**
 * Utils - Core utility functions for DOM manipulation,
 * date formatting, validation, and device detection
 */
export const Utils = {
    // ========== DOM HELPERS ==========

    /**
     * Get trimmed value from input element
     * @param {string} id - Element ID
     * @param {string} defaultValue - Default value if element not found
     * @returns {string} Trimmed value
     */
    get: (id, defaultValue = '') => {
        const el = document.getElementById(id);
        return el ? (el.value || '').toString().trim() : defaultValue;
    },

    /**
     * Set value to input element
     * @param {string} id - Element ID
     * @param {string} value - Value to set
     */
    set: (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    },

    /**
     * Create DOM element with properties and children
     * @param {string} tag - HTML tag name
     * @param {object} props - Element properties
     * @param {array} children - Child elements or text
     * @returns {HTMLElement} Created element
     */
    elem: (tag, props = {}, children = []) => {
        const el = document.createElement(tag);
        Object.entries(props).forEach(([key, val]) => {
            if (key === 'class') el.className = val;
            else if (key === 'style') Object.assign(el.style, val);
            else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), val);
            else if (key.startsWith('data-')) el.dataset[key.slice(5)] = val;
            else el[key] = val;
        });
        children.filter(child => child != null).forEach(child => {
            el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
        });
        return el;
    },

    // ========== DATE UTILITIES ==========

    /**
     * Format date string to DD/MM/YYYY
     * @param {string} dateStr - Date string (YYYY-MM-DD)
     * @returns {string} Formatted date (DD/MM/YYYY)
     */
    formatDate: (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr + 'T00:00:00');
            return date.toLocaleDateString('en-GB');
        } catch {
            return dateStr;
        }
    },

    /**
     * Convert DD/MM/YYYY to YYYY-MM-DD
     * @param {string} dateStr - Date string (DD/MM/YYYY)
     * @returns {string} Formatted date (YYYY-MM-DD)
     */
    convertDateFormat: (dateStr) => {
        if (!dateStr) return '';
        try {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const month = parts[1].padStart(2, '0');
                const year = parts[2];
                return `${year}-${month}-${day}`;
            }
            return dateStr;
        } catch {
            return dateStr;
        }
    },

    /**
     * Parse YYYY-MM-DD to Date object
     * @param {string} dateStr - Date string (YYYY-MM-DD)
     * @returns {Date} Date object
     */
    getLocalDate: (dateStr) => {
        if (!dateStr) return new Date();
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    },

    /**
     * Convert Date object to YYYY-MM-DD string
     * @param {Date|string} date - Date object or string
     * @returns {string} Date string (YYYY-MM-DD)
     */
    toDateString: (date) => {
        const d = date instanceof Date ? date : new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // ========== ID GENERATION ==========

    /**
     * Generate unique ID
     * @returns {string} Unique ID string
     */
    generateId: () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

    // ========== DEBOUNCE ==========

    /**
     * Debounce function execution
     * @param {function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {function} Debounced function
     */
    debounce: (func, wait) => {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    },

    // ========== VALIDATION ==========

    /**
     * Validate required fields
     * @param {array} fields - Array of field IDs to validate
     * @returns {array} Array of field IDs that are empty
     */
    validateRequired: (fields) => {
        const errors = [];
        fields.forEach(field => {
            const value = Utils.get(field);
            if (!value) errors.push(field);
        });
        return errors;
    },

    // ========== DEVICE DETECTION ==========

    /**
     * Check if current device is mobile
     * @returns {boolean} True if mobile device
     */
    isMobileDevice: () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Get device type string
     * @returns {string} Device type (iPad, iPhone, Android, Desktop)
     */
    getDeviceType: () => {
        const ua = navigator.userAgent;
        if (/iPad/i.test(ua)) return 'iPad';
        if (/iPhone|iPod/i.test(ua)) return 'iPhone';
        if (/Android/i.test(ua)) return 'Android';
        return 'Desktop';
    },

    // ========== CANVAS UTILITIES ==========

    /**
     * Convert canvas.toBlob callback to Promise
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {string} type - Image MIME type
     * @param {number} quality - Image quality (0-1)
     * @returns {Promise<Blob>} Promise resolving to Blob
     */
    canvasToBlobPromise: (canvas, type = 'image/png', quality = 0.95) => {
        return new Promise((resolve, reject) => {
            try {
                canvas.toBlob(blob => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas toBlob returned null - image may be too large for device memory'));
                    }
                }, type, quality);
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Get optimal canvas scale based on device capabilities
     * @param {number} baseScale - Requested base scale
     * @returns {number} Optimal scale for device
     */
    getOptimalCanvasScale: (baseScale) => {
        const isMobile = Utils.isMobileDevice();
        const deviceMemory = navigator.deviceMemory || 4; // Default to 4GB if not available

        if (!isMobile) {
            return baseScale; // Desktop: use requested scale
        }

        // Mobile optimizations based on device memory
        if (deviceMemory <= 2) {
            return Math.min(baseScale, 1); // Low memory: max scale 1
        } else if (deviceMemory <= 4) {
            return Math.min(baseScale, 1.5); // Medium memory: max scale 1.5
        } else {
            return Math.min(baseScale, 2); // Higher memory: max scale 2
        }
    },

    /**
     * Validate canvas dimensions for device
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {object} Validation result {valid: boolean, reason?: string}
     */
    validateCanvasDimensions: (width, height) => {
        const maxDimension = Utils.isMobileDevice() ? 4096 : 32767; // Mobile: 4096, Desktop: 32767
        const maxArea = Utils.isMobileDevice() ? 16777216 : 268435456; // Mobile: 16MP, Desktop: 256MP
        const area = width * height;

        if (width > maxDimension || height > maxDimension) {
            return {
                valid: false,
                reason: `Canvas dimension exceeds maximum (${maxDimension}px) for this device`
            };
        }

        if (area > maxArea) {
            return {
                valid: false,
                reason: `Canvas area (${area}px) exceeds maximum (${maxArea}px) for this device`
            };
        }

        return { valid: true };
    },

    // ========== WEATHER API ==========

    /**
     * Get weather data from OpenWeatherMap API
     * @param {string} city - City name
     * @param {string} apiKey - OpenWeatherMap API key
     * @returns {Promise<object>} Weather data
     */
    getWeather: async (city = 'Delhi', apiKey = '') => {
        try {
            // Check if API key is valid (not empty, not 'demo')
            if (!apiKey || apiKey === 'demo' || apiKey.trim() === '') {
                console.warn('⚠️ Weather API key not configured. Please add your API key in Settings.');
                return {
                    temp: 'N/A',
                    humidity: 'N/A',
                    condition: 'N/A',
                    description: 'Configure API key in Settings'
                };
            }

            // Using OpenWeatherMap free API
            // Get your free API key from: https://openweathermap.org/api
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);

            if (!response.ok) {
                // Fallback to mock data if API fails
                console.error(`Weather API error: ${response.status} ${response.statusText}`);
                return {
                    temp: 'N/A',
                    humidity: 'N/A',
                    condition: 'N/A',
                    description: response.status === 401 ? 'Invalid API key' : 'Weather data unavailable'
                };
            }

            const data = await response.json();
            return {
                temp: Math.round(data.main.temp),
                humidity: data.main.humidity,
                condition: data.weather[0].main,
                description: data.weather[0].description,
                icon: data.weather[0].icon
            };
        } catch (error) {
            console.error('Weather fetch error:', error);
            return {
                temp: 'N/A',
                humidity: 'N/A',
                condition: 'N/A',
                description: 'Weather forecast unavailable'
            };
        }
    },

    /**
     * Get weather forecast for a specific date
     * @param {string} city - City name
     * @param {string} targetDate - Target date (YYYY-MM-DD)
     * @param {string} apiKey - OpenWeatherMap API key
     * @returns {Promise<object>} Weather forecast data
     */
    getWeatherForecast: async (city = 'Delhi', targetDate, apiKey = '') => {
        try {
            if (!apiKey || apiKey === 'demo' || apiKey.trim() === '') {
                console.warn('⚠️ Weather API key not configured.');
                return {
                    temp: 'N/A',
                    humidity: 'N/A',
                    condition: 'N/A',
                    description: 'Configure API key in Settings'
                };
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const target = new Date(targetDate);
            target.setHours(0, 0, 0, 0);

            if (target.getTime() === today.getTime()) {
                return await Utils.getWeather(city, apiKey);
            }

            const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);

            if (!response.ok) {
                console.error(`Weather forecast API error: ${response.status} ${response.statusText}`);
                return {
                    temp: 'N/A',
                    humidity: 'N/A',
                    condition: 'N/A',
                    description: response.status === 401 ? 'Invalid API key' : 'Weather forecast unavailable'
                };
            }

            const data = await response.json();
            const targetTime = new Date(target);
            targetTime.setHours(12, 0, 0, 0);

            let closestForecast = null;
            let minDiff = Infinity;

            data.list.forEach(forecast => {
                const forecastTime = new Date(forecast.dt * 1000);
                const diff = Math.abs(forecastTime - targetTime);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestForecast = forecast;
                }
            });

            if (!closestForecast) {
                return {
                    temp: 'N/A',
                    humidity: 'N/A',
                    condition: 'N/A',
                    description: 'Forecast not available for this date'
                };
            }

            return {
                temp: Math.round(closestForecast.main.temp),
                tempMin: Math.round(closestForecast.main.temp_min),
                tempMax: Math.round(closestForecast.main.temp_max),
                humidity: closestForecast.main.humidity,
                condition: closestForecast.weather[0].main,
                description: closestForecast.weather[0].description,
                icon: closestForecast.weather[0].icon
            };
        } catch (error) {
            console.error('Weather forecast error:', error);
            return {
                temp: 'N/A',
                humidity: 'N/A',
                condition: 'N/A',
                description: 'Weather forecast unavailable'
            };
        }
    },

    /**
     * Get weather emoji icon based on condition
     * @param {string} condition - Weather condition string
     * @returns {string} Weather emoji
     */
    getWeatherEmoji: (condition) => {
        const conditionLower = condition.toLowerCase();
        if (conditionLower.includes('clear') || conditionLower.includes('sun')) return '☀️';
        if (conditionLower.includes('cloud')) return '☁️';
        if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) return '🌧️';
        if (conditionLower.includes('thunder') || conditionLower.includes('storm')) return '⛈️';
        if (conditionLower.includes('snow')) return '❄️';
        if (conditionLower.includes('mist') || conditionLower.includes('fog') || conditionLower.includes('haze')) return '🌫️';
        return '🌤️';
    }
};

// Make Utils available globally for backward compatibility
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}
