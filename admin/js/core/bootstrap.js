/**
 * Bootstrap - Application Initialization
 * Sets up Firebase, Utils, and lazy loading system
 *
 * @exports initializeApp
 */

import { initializeFirebase } from './firebase.js';
import { Utils } from './utils.js';
import { ModuleLoader } from './module-loader.js';

/**
 * Initialize the application
 * @returns {Promise<object>} Initialization result with firebase instances
 */
export async function initializeApp() {
    console.log('🚀 Initializing FirepowerSFX Admin Panel...');
    console.log('📦 Loading core modules...');

    const startTime = performance.now();

    // Initialize Firebase
    const { auth, db } = initializeFirebase();

    if (!auth || !db) {
        console.error('❌ Firebase initialization failed');
        return { success: false, error: 'Firebase initialization failed' };
    }

    // Make Utils globally available (already done in utils.js, but double-check)
    if (!window.Utils) {
        window.Utils = Utils;
    }

    // Make ModuleLoader globally available
    if (!window.ModuleLoader) {
        window.ModuleLoader = ModuleLoader;
    }

    const initTime = performance.now() - startTime;
    console.log(`✅ Core modules initialized in ${initTime.toFixed(2)}ms`);

    return {
        success: true,
        auth,
        db,
        Utils,
        ModuleLoader,
        initTime
    };
}

/**
 * Setup lazy loading for tab navigation
 * Loads feature modules only when tabs are clicked
 */
export function setupLazyLoading() {
    console.log('⚙️ Setting up lazy loading for tabs...');

    // Map tab names to module paths
    const tabModuleMap = {
        'dashboard': './js/features/dashboard.js',
        'inventory': './js/features/inventory.js',
        'calendar': './js/features/calendar.js',
        'team': './js/features/team.js',
        'customers': './js/features/customers.js',
        'preparation': './js/features/preparation.js',
        'financials': './js/features/financials.js',
        'videos': './js/features/videos.js',
        'advertisements': './js/features/advertisements.js',
        'analytics': './js/features/analytics.js',
        'conversion': './js/features/conversion.js',
        'settings': './js/features/settings.js'
    };

    // Listen for tab clicks
    document.addEventListener('click', async (e) => {
        const tabElement = e.target.closest('[data-tab]');

        if (tabElement) {
            const tabName = tabElement.dataset.tab;
            const modulePath = tabModuleMap[tabName];

            if (modulePath && !ModuleLoader.isLoaded(modulePath)) {
                console.log(`📥 Loading ${tabName} module...`);

                try {
                    await ModuleLoader.load(modulePath, true);
                    console.log(`✅ ${tabName} module loaded successfully`);
                } catch (error) {
                    console.error(`❌ Failed to load ${tabName} module:`, error);
                }
            }
        }
    });

    console.log('✅ Lazy loading configured for tabs');
}

/**
 * Preload critical modules for faster navigation
 * Load these in the background after initial page load
 */
export function preloadCriticalModules() {
    console.log('🔄 Preloading critical modules in background...');

    // Wait 2 seconds after page load, then preload common modules
    setTimeout(() => {
        ModuleLoader.preload('./js/features/dashboard.js');
        ModuleLoader.preload('./js/features/inventory.js');
        ModuleLoader.preload('./js/features/calendar.js');
    }, 2000);
}

// Export for backward compatibility
export default {
    initializeApp,
    setupLazyLoading,
    preloadCriticalModules
};
