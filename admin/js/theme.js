// ============================================
// THEME MANAGER
// ============================================

const ThemeManager = {
    init: () => {
        // Load saved theme from localStorage or default to 'light'
        const savedTheme = localStorage.getItem('admin-theme') || 'light';
        ThemeManager.setTheme(savedTheme);
    },

    setTheme: (theme) => {
        // Set the theme attribute on the HTML element
        document.documentElement.setAttribute('data-theme', theme);

        // Update the icon
        const icon = document.getElementById('themeIcon');
        if (icon) {
            icon.textContent = theme === 'dark' ? '🌙' : '☀️';
        }

        // Save to localStorage
        localStorage.setItem('admin-theme', theme);
    },

    toggleTheme: () => {
        // Get current theme
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

        // Toggle to opposite theme
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        // Apply new theme
        ThemeManager.setTheme(newTheme);
    },

    getTheme: () => {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
};
