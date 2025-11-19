// ============================================
// UTILITY FUNCTIONS
// ============================================

const Utils = {
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
            else if (key.startsWith('on')) el.addEventListener(key.slice(2), val);
            else if (key.startsWith('data-')) el.dataset[key.slice(5)] = val;
            else el[key] = val;
        });
        children.forEach(child => {
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
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    validateRequired: (fields) => {
        const errors = [];
        fields.forEach(field => {
            const value = Utils.get(field);
            if (!value) errors.push(field);
        });
        return errors;
    }
};
