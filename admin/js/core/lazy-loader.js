/**
 * Lazy Loading System for Feature Modules
 * Dynamically loads feature modules only when tabs are clicked
 * Massive performance improvement by reducing initial bundle size
 */

// Tab to module mapping
const TAB_MODULES = {
    'dashboard': {
        path: './js/features/dashboard.js',
        export: 'Dashboard',
        renderFn: 'renderDashboard'
    },
    'inventory': {
        path: './js/features/inventory.js',
        export: 'Inventory',
        renderFn: 'renderInventory'
    },
    'preparation': {
        path: './js/features/preparation.js',
        export: 'Preparation',
        renderFn: 'renderPreparation'
    },
    'calendar': {
        path: './js/features/calendar.js',
        export: 'Calendar',
        renderFn: 'renderCalendar'
    },
    'team': {
        path: './js/features/team.js',
        export: 'Team',
        renderFn: 'renderTeam'
    },
    'customers': {
        path: './js/features/customers.js',
        export: 'Customers',
        renderFn: 'renderCustomers'
    },
    'financials': {
        path: './js/features/financials.js',
        export: 'Financials',
        renderFn: 'renderFinancials'
    },
    'videos': {
        path: './js/features/videos.js',
        export: 'Videos',
        renderFn: 'renderVideos'
    },
    'advertisements': {
        path: './js/features/advertisements.js',
        export: 'Advertisements',
        renderFn: 'renderAdvertisements'
    },
    'analytics': {
        path: './js/features/analytics.js',
        export: 'Analytics',
        renderFn: 'renderAnalytics'
    },
    'conversion': {
        path: './js/features/conversion.js',
        export: 'Conversion',
        renderFn: 'renderConversion'
    },
    'settings': {
        path: './js/features/settings.js',
        export: 'Settings',
        renderFn: 'renderSettings'
    }
};

// Track loaded modules
const loadedModules = new Map();
const loadingModules = new Map();

/**
 * Load a feature module dynamically
 * @param {string} tabName - Name of the tab/feature
 * @returns {Promise<Module>} Loaded module
 */
async function loadFeatureModule(tabName) {
    console.log(`📥 Loading ${tabName} module...`);

    // Already loaded
    if (loadedModules.has(tabName)) {
        console.log(`✅ ${tabName} already loaded`);
        return loadedModules.get(tabName);
    }

    // Currently loading
    if (loadingModules.has(tabName)) {
        console.log(`⏳ ${tabName} already loading, waiting...`);
        return loadingModules.get(tabName);
    }

    const config = TAB_MODULES[tabName];
    if (!config) {
        console.warn(`⚠️ No module configured for tab: ${tabName}`);
        return null;
    }

    const startTime = performance.now();

    // Create loading promise
    const promise = import(config.path)
        .then(module => {
            const loadTime = performance.now() - startTime;
            console.log(`✅ ${tabName} loaded in ${loadTime.toFixed(2)}ms`);

            // Store loaded module
            loadedModules.set(tabName, module);
            loadingModules.delete(tabName);

            return module;
        })
        .catch(error => {
            console.error(`❌ Failed to load ${tabName}:`, error);
            loadingModules.delete(tabName);
            throw error;
        });

    loadingModules.set(tabName, promise);
    return promise;
}

/**
 * Setup lazy loading for tab navigation
 * Intercepts tab clicks and loads modules on demand
 */
function setupLazyTabLoading() {
    console.log('⚙️ Setting up lazy tab loading...');

    // Listen for tab clicks
    document.addEventListener('click', async (e) => {
        const tabElement = e.target.closest('[data-tab]');
        if (!tabElement) return;

        const tabName = tabElement.dataset.tab;

        // Check if this tab has a module
        if (!TAB_MODULES[tabName]) {
            console.log(`ℹ️ Tab "${tabName}" uses inline code (no module to load)`);
            return;
        }

        try {
            // Load the module
            const module = await loadFeatureModule(tabName);

            if (!module) {
                console.warn(`⚠️ Module for ${tabName} not found`);
                return;
            }

            // Get the export (Dashboard, Inventory, etc.)
            const featureClass = module[TAB_MODULES[tabName].export];

            if (!featureClass) {
                console.error(`❌ Export "${TAB_MODULES[tabName].export}" not found in ${tabName} module`);
                return;
            }

            // Get the render function
            const renderFn = featureClass[TAB_MODULES[tabName].renderFn];

            if (renderFn && typeof renderFn === 'function') {
                console.log(`🎨 Rendering ${tabName} with module...`);
                // The module's render function will handle rendering
                // This is just to ensure it's available
            } else {
                console.log(`ℹ️ ${tabName} module loaded, using default rendering`);
            }

        } catch (error) {
            console.error(`❌ Error loading ${tabName} module:`, error);
            if (window.OMS && window.OMS.showToast) {
                window.OMS.showToast(`Failed to load ${tabName}`, 'error');
            }
        }
    });

    console.log('✅ Lazy tab loading configured');
}

/**
 * Preload critical modules in background
 * Load commonly used tabs after initial page load
 */
function preloadCriticalTabs() {
    console.log('🔄 Preloading critical tabs...');

    // Wait 2 seconds after page load
    setTimeout(() => {
        // Preload most commonly used tabs
        const criticalTabs = ['dashboard', 'inventory', 'preparation'];

        criticalTabs.forEach(tabName => {
            loadFeatureModule(tabName).catch(() => {
                // Silently fail for preloading
            });
        });
    }, 2000);
}

/**
 * Get module loading statistics
 * @returns {object} Load stats
 */
function getLoadStats() {
    const stats = {
        loadedCount: loadedModules.size,
        totalModules: Object.keys(TAB_MODULES).length,
        loadedModules: Array.from(loadedModules.keys()),
        availableModules: Object.keys(TAB_MODULES)
    };

    console.log('📊 Lazy Loading Stats:', stats);
    return stats;
}

// Make globally available
window.LazyLoader = {
    load: loadFeatureModule,
    setup: setupLazyTabLoading,
    preload: preloadCriticalTabs,
    stats: getLoadStats
};

// Auto-setup when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLazyTabLoading);
} else {
    setupLazyTabLoading();
}

console.log('✅ Lazy loading system initialized');
