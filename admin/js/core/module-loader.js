/**
 * Module Loader - Dynamic Import System
 * Handles lazy loading of feature modules on demand
 *
 * Features:
 * - Prevents duplicate loading
 * - Tracks loading state
 * - Provides loading feedback
 * - Handles errors gracefully
 *
 * @exports ModuleLoader
 */

export const ModuleLoader = {
    loaded: new Set(),
    loading: new Map(),
    loadTimes: new Map(),

    /**
     * Load a module dynamically
     * @param {string} modulePath - Path to module (e.g., './features/orders.js')
     * @param {boolean} showLoading - Show loading indicator
     * @returns {Promise<Module>} Loaded module
     */
    async load(modulePath, showLoading = false) {
        // Already loaded - return immediately
        if (this.loaded.has(modulePath)) {
            console.log(`✅ Module already loaded: ${modulePath}`);
            return Promise.resolve();
        }

        // Currently loading - return existing promise
        if (this.loading.has(modulePath)) {
            console.log(`⏳ Module already loading: ${modulePath}`);
            return this.loading.get(modulePath);
        }

        const startTime = performance.now();

        // Show loading indicator
        let loadingEl;
        if (showLoading && typeof window !== 'undefined') {
            loadingEl = document.createElement('div');
            loadingEl.className = 'module-loading';
            loadingEl.innerHTML = `
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 1.5rem 2rem;
                    border-radius: 8px;
                    z-index: 10000;
                    font-size: 1rem;
                ">
                    ⏳ Loading module...
                </div>
            `;
            document.body.appendChild(loadingEl);
        }

        // Create loading promise
        const promise = import(modulePath)
            .then(module => {
                const loadTime = performance.now() - startTime;

                this.loaded.add(modulePath);
                this.loading.delete(modulePath);
                this.loadTimes.set(modulePath, loadTime);

                console.log(`✅ Module loaded in ${loadTime.toFixed(2)}ms: ${modulePath}`);

                // Remove loading indicator
                if (loadingEl) {
                    document.body.removeChild(loadingEl);
                }

                return module;
            })
            .catch(error => {
                this.loading.delete(modulePath);

                console.error(`❌ Failed to load module: ${modulePath}`, error);

                // Remove loading indicator
                if (loadingEl) {
                    document.body.removeChild(loadingEl);
                }

                // Show error to user
                if (typeof window !== 'undefined' && window.OMS && window.OMS.showToast) {
                    window.OMS.showToast(`Failed to load module: ${error.message}`, 'error');
                }

                throw error;
            });

        this.loading.set(modulePath, promise);
        return promise;
    },

    /**
     * Load multiple modules in parallel
     * @param {string[]} modulePaths - Array of module paths
     * @returns {Promise<Module[]>} Array of loaded modules
     */
    async loadMultiple(modulePaths) {
        console.log(`📦 Loading ${modulePaths.length} modules in parallel...`);
        const promises = modulePaths.map(path => this.load(path));
        return Promise.all(promises);
    },

    /**
     * Preload a module without waiting
     * @param {string} modulePath - Path to module
     */
    preload(modulePath) {
        if (!this.loaded.has(modulePath) && !this.loading.has(modulePath)) {
            console.log(`🔄 Preloading module: ${modulePath}`);
            this.load(modulePath).catch(() => {
                // Silently fail for preloading
            });
        }
    },

    /**
     * Check if a module is loaded
     * @param {string} modulePath - Path to module
     * @returns {boolean} True if loaded
     */
    isLoaded(modulePath) {
        return this.loaded.has(modulePath);
    },

    /**
     * Get load time for a module
     * @param {string} modulePath - Path to module
     * @returns {number|null} Load time in ms, or null if not loaded
     */
    getLoadTime(modulePath) {
        return this.loadTimes.get(modulePath) || null;
    },

    /**
     * Get performance stats
     * @returns {object} Performance statistics
     */
    getStats() {
        const stats = {
            totalModules: this.loaded.size,
            totalLoadTime: 0,
            averageLoadTime: 0,
            modules: []
        };

        this.loadTimes.forEach((time, path) => {
            stats.totalLoadTime += time;
            stats.modules.push({ path, loadTime: time });
        });

        stats.averageLoadTime = stats.totalModules > 0
            ? stats.totalLoadTime / stats.totalModules
            : 0;

        stats.modules.sort((a, b) => b.loadTime - a.loadTime);

        return stats;
    },

    /**
     * Clear all loaded modules (for testing)
     */
    clear() {
        this.loaded.clear();
        this.loading.clear();
        this.loadTimes.clear();
        console.log('🗑️ Module loader cleared');
    },

    /**
     * Log performance summary
     */
    logPerformance() {
        const stats = this.getStats();
        console.log('📊 Module Load Performance:');
        console.log(`   Total Modules: ${stats.totalModules}`);
        console.log(`   Total Load Time: ${stats.totalLoadTime.toFixed(2)}ms`);
        console.log(`   Average Load Time: ${stats.averageLoadTime.toFixed(2)}ms`);
        console.log('   Slowest Modules:');
        stats.modules.slice(0, 5).forEach((mod, i) => {
            console.log(`   ${i + 1}. ${mod.path}: ${mod.loadTime.toFixed(2)}ms`);
        });
    }
};

// Make globally available
if (typeof window !== 'undefined') {
    window.ModuleLoader = ModuleLoader;
}

export default ModuleLoader;
