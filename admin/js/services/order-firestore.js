/* ============================================
   ORDER FIRESTORE SERVICE - Firestore CRUD operations
   ============================================ */

/**
 * Order Firestore Service Module
 *
 * Handles:
 * - Firestore order queries (find by ID, doc ID)
 * - Order creation in Firestore
 * - Order updates in Firestore
 * - Order deletion in Firestore
 * - Batch operations
 *
 * @exports OrderFirestore
 */

export const OrderFirestore = {
    /**
     * Find existing order by order ID or doc ID
     * @param {Object} db - Firestore database instance
     * @param {string} orderId - Order ID to search for
     * @param {string} docId - Document ID to search for (optional)
     * @returns {Promise<Object>} Firestore snapshot
     */
    async findExistingOrder(db, orderId, docId) {
        if (docId) {
            // Search by document ID
            const doc = await db.collection('orders').doc(docId).get();
            return doc.exists ? { empty: false, docs: [doc] } : { empty: true };
        } else if (orderId) {
            // Search by order ID
            return await db.collection('orders')
                .where('orderId', '==', orderId)
                .get();
        } else {
            // No ID to search
            return { empty: true };
        }
    },

    /**
     * Create new order in Firestore
     * @param {Object} db - Firestore database instance
     * @param {string} docId - Document ID (can be custom or auto-generated)
     * @param {Object} orderData - Order data to save
     * @returns {Promise<string>} Created document ID
     */
    async createOrder(db, docId, orderData) {
        if (docId) {
            // Use custom document ID
            await db.collection('orders').doc(docId).set(orderData);
            console.log('✅ Created order with custom doc ID:', docId);
            return docId;
        } else {
            // Auto-generate document ID
            const docRef = await db.collection('orders').add(orderData);
            console.log('✅ Created order with auto-generated doc ID:', docRef.id);
            return docRef.id;
        }
    },

    /**
     * Update existing order in Firestore
     * @param {Object} db - Firestore database instance
     * @param {string} docId - Document ID to update
     * @param {Object} orderData - Updated order data
     * @returns {Promise<void>}
     */
    async updateOrder(db, docId, orderData) {
        await db.collection('orders').doc(docId).update(orderData);
        console.log('✅ Updated order:', docId);
    },

    /**
     * Delete order from Firestore
     * @param {Object} db - Firestore database instance
     * @param {string} docId - Document ID to delete
     * @returns {Promise<void>}
     */
    async deleteOrder(db, docId) {
        await db.collection('orders').doc(docId).delete();
        console.log('🗑️ Deleted order:', docId);
    },

    /**
     * Replace order (delete old, create new) - used for status upgrades
     * @param {Object} db - Firestore database instance
     * @param {string} oldDocId - Old document ID to delete
     * @param {string} newDocId - New document ID to create
     * @param {Object} orderData - Order data for new document
     * @returns {Promise<string>} New document ID
     */
    async replaceOrder(db, oldDocId, newDocId, orderData) {
        // Delete old document
        await this.deleteOrder(db, oldDocId);

        // Create new document
        await db.collection('orders').doc(newDocId).set(orderData);
        console.log('🔄 Replaced order:', oldDocId, '→', newDocId);

        return newDocId;
    },

    /**
     * Get all orders from Firestore
     * @param {Object} db - Firestore database instance
     * @returns {Promise<Array>} Array of order objects
     */
    async getAllOrders(db) {
        const snapshot = await db.collection('orders').get();
        const orders = [];

        snapshot.forEach(doc => {
            orders.push({
                docId: doc.id,
                ...doc.data()
            });
        });

        return orders;
    },

    /**
     * Get orders by status
     * @param {Object} db - Firestore database instance
     * @param {string} status - Order status to filter by
     * @returns {Promise<Array>} Array of matching orders
     */
    async getOrdersByStatus(db, status) {
        const snapshot = await db.collection('orders')
            .where('status', '==', status.toLowerCase())
            .get();

        const orders = [];
        snapshot.forEach(doc => {
            orders.push({
                docId: doc.id,
                ...doc.data()
            });
        });

        return orders;
    },

    /**
     * Get orders by date range
     * @param {Object} db - Firestore database instance
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     * @returns {Promise<Array>} Array of matching orders
     */
    async getOrdersByDateRange(db, startDate, endDate) {
        const snapshot = await db.collection('orders')
            .where('date', '>=', startDate)
            .where('date', '<=', endDate)
            .get();

        const orders = [];
        snapshot.forEach(doc => {
            orders.push({
                docId: doc.id,
                ...doc.data()
            });
        });

        return orders;
    },

    /**
     * Batch delete multiple orders
     * @param {Object} db - Firestore database instance
     * @param {Array<string>} docIds - Array of document IDs to delete
     * @returns {Promise<number>} Number of orders deleted
     */
    async batchDeleteOrders(db, docIds) {
        const batch = db.batch();
        let count = 0;

        docIds.forEach(docId => {
            const docRef = db.collection('orders').doc(docId);
            batch.delete(docRef);
            count++;
        });

        await batch.commit();
        console.log(`🗑️ Batch deleted ${count} orders`);

        return count;
    },

    /**
     * Check if order ID already exists in Firestore
     * @param {Object} db - Firestore database instance
     * @param {string} orderId - Order ID to check
     * @returns {Promise<boolean>} True if ID exists
     */
    async orderIdExists(db, orderId) {
        if (!orderId || !orderId.trim()) return false;

        const snapshot = await db.collection('orders')
            .where('orderId', '==', orderId)
            .limit(1)
            .get();

        return !snapshot.empty;
    }
};

// Make globally available for backward compatibility
if (typeof window !== 'undefined') {
    window.OrderFirestore = OrderFirestore;
}
