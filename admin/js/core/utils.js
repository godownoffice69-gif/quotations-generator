/**
 * Utility Functions
 * Collection of helper functions for DOM manipulation, date handling, and more
 *
 * @exports Utils
 */

export const Utils = {
    get: (id, defaultValue = '') => {
        const el = document.getElementById(id);
        return el ? (el.value || '').toString().trim() : defaultValue;
    },

    set: (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    },

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

    formatDate: (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr + 'T00:00:00');
            return date.toLocaleDateString('en-GB');
        } catch {
            return dateStr;
        }
    },

    convertDateFormat: (dateStr) => {
        if (!dateStr) return '';
        try {
            // Convert DD/MM/YYYY to YYYY-MM-DD
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

    getLocalDate: (dateStr) => {
        if (!dateStr) return new Date();
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    },

    toDateString: (date) => {
        const d = date instanceof Date ? date : new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    generateId: () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

    debounce: (func, wait) => {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    },

    validateRequired: (fields) => {
        const errors = [];
        fields.forEach(field => {
            const value = Utils.get(field);
            if (!value) errors.push(field);
        });
        return errors;
    },

    // Mobile device detection
    isMobileDevice: () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // Get device type for logging
    getDeviceType: () => {
        const ua = navigator.userAgent;
        if (/iPad/i.test(ua)) return 'iPad';
        if (/iPhone|iPod/i.test(ua)) return 'iPhone';
        if (/Android/i.test(ua)) return 'Android';
        return 'Desktop';
    },

    // Convert canvas.toBlob callback to Promise
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

    // Get optimal canvas scale for device
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

    // Validate canvas dimensions for device
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

    // Weather API integration
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
            console.error('Weather API error:', error);
            return {
                temp: 'N/A',
                humidity: 'N/A',
                condition: 'N/A',
                description: 'Weather data unavailable'
            };
        }
    },

    // Get weather by coordinates
    getWeatherByCoords: async (lat, lon, apiKey = '') => {
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

            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);

            if (!response.ok) {
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
                icon: data.weather[0].icon,
                city: data.name
            };
        } catch (error) {
            console.error('Weather API error:', error);
            return {
                temp: 'N/A',
                humidity: 'N/A',
                condition: 'N/A',
                description: 'Weather data unavailable'
            };
        }
    },

    // Get weather forecast for a specific date
    getWeatherForecast: async (city = 'Delhi', targetDate, apiKey = '') => {
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

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const target = new Date(targetDate);
            target.setHours(0, 0, 0, 0);

            // If target date is today, use current weather API
            if (target.getTime() === today.getTime()) {
                return await Utils.getWeather(city, apiKey);
            }

            // For future dates (up to 5 days), use forecast API
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

            // Find forecast closest to noon on target date
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

    // Get weather icon emoji
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

// Make globally available for backward compatibility
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}

export default Utils;
