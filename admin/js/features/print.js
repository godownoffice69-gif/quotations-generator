/* ============================================
   PRINT/PDF - Order image generation, PDF export, printing
   ============================================ */

/**
 * Print/PDF Feature Module
 *
 * Provides:
 * - Single order image/PDF generation
 * - Multi-order batch PDF generation
 * - Paper format handling (A4, Legal, Letter, etc.)
 * - Mobile-optimized rendering
 * - Download functionality
 *
 * @exports Print
 */

import { Utils } from '../utils/helpers.js';

export const Print = {
    /**
     * Download order as image
     * @param {Object} oms - Reference to OMS
     * @param {string} orderId - Order ID or docId
     */
    downloadOrderImage(oms, orderId) {
        // Search by docId first (always unique), then orderId as fallback
        const order = oms.data.orders.find(o => o.docId === orderId || o.orderId === orderId);
        if (!order) {
            oms.showToast('Order not found', 'error');
            return;
        }
        this.generateSingleOrderImage(oms, order);
    },

    /**
     * Get paper dimensions based on settings
     * @param {Object} oms - Reference to OMS
     * @returns {Object} Width and height in pixels
     */
    getPaperDimensions(oms) {
        const format = oms.data.settings.paperFormat || 'A4';
        const orientation = oms.data.settings.paperOrientation || 'portrait';

        // Paper sizes in mm, converted to pixels at 300 DPI (1mm = 11.811px)
        const sizes = {
            'A4': { width: 210, height: 297 },
            'Legal': { width: 216, height: 356 },
            'Letter': { width: 216, height: 279 },
            'A3': { width: 297, height: 420 },
            'A5': { width: 148, height: 210 },
            'Tabloid': { width: 279, height: 432 }
        };

        const size = sizes[format] || sizes['A4'];
        const mmToPx = 11.811;

        if (orientation === 'landscape') {
            return {
                width: Math.round(size.height * mmToPx),
                height: Math.round(size.width * mmToPx)
            };
        }

        return {
            width: Math.round(size.width * mmToPx),
            height: Math.round(size.height * mmToPx)
        };
    },

    /**
     * Update loading message
     * @param {HTMLElement} loading - Loading element
     * @param {string} message - New message
     */
    updateLoadingMessage(loading, message) {
        if (loading && loading.querySelector) {
            const msgEl = loading.querySelector('p');
            if (msgEl) msgEl.textContent = message;
        }
    },

    /**
     * Generate single order image/PDF
     * @param {Object} oms - Reference to OMS
     * @param {Object} order - Order data
     */
    async generateSingleOrderImage(oms, order) {
        const isMobile = Utils.isMobileDevice();
        const deviceType = Utils.getDeviceType();
        const loading = oms.showLoading(isMobile ? 'Generating image (mobile mode)...' : 'Generating image...');

        try {
            const template = document.getElementById('printTemplate');
            const colors = oms.data.settings.printColors;
            const fontSize = oms.data.settings.printFontSize || 26;
            const bgColor = oms.data.settings.printBgColor || '#ffffff';
            const textColor = oms.data.settings.printTextColor || '#000000';

            // Get paper dimensions based on settings
            const paperDimensions = this.getPaperDimensions(oms);

            // Mobile optimization: Validate canvas dimensions
            const baseScale = oms.data.settings.imageQuality || 2;
            const optimizedScale = Utils.getOptimalCanvasScale(baseScale);

            const canvasWidth = Math.round(paperDimensions.width * optimizedScale);
            const canvasHeight = Math.round(paperDimensions.height * optimizedScale);

            const validation = Utils.validateCanvasDimensions(canvasWidth, canvasHeight);
            if (!validation.valid) {
                oms.hideLoading(loading);
                oms.showToast(`⚠️ ${validation.reason}. Please reduce image quality in settings.`, 'error');
                console.error('Canvas validation failed:', validation.reason);
                return;
            }

            if (isMobile && optimizedScale < baseScale) {
                console.log(`📱 Mobile device detected (${deviceType}): Quality auto-reduced from ${baseScale} to ${optimizedScale}`);
            }

            // Apply left margin from settings
            const leftMarginMm = oms.data.settings.tableSettings?.leftMargin || 50;
            const leftMarginPx = Math.round(leftMarginMm * 11.811);
            template.style.paddingLeft = leftMarginPx + 'px';
            template.style.width = paperDimensions.width + 'px';
            template.style.paddingRight = '80px';

            template.innerHTML = oms.buildOrderHTML(order, fontSize, colors, false, bgColor, textColor);
            template.style.display = 'block';

            // Wait for DOM to settle
            await new Promise(r => setTimeout(r, isMobile ? 500 : 300));

            // Create canvas
            let canvas;
            try {
                canvas = await html2canvas(template, {
                    scale: optimizedScale,
                    backgroundColor: bgColor,
                    width: paperDimensions.width,
                    logging: false,
                    useCORS: true,
                    allowTaint: false,
                    removeContainer: true,
                    imageTimeout: isMobile ? 30000 : 15000
                });
            } catch (canvasError) {
                console.error('html2canvas failed:', canvasError);
                if (isMobile && optimizedScale > 1) {
                    console.log('⚠️ Retrying with scale 1 for mobile...');
                    this.updateLoadingMessage(loading, 'Retrying with lower quality...');
                    canvas = await html2canvas(template, {
                        scale: 1,
                        backgroundColor: bgColor,
                        width: paperDimensions.width,
                        logging: false,
                        useCORS: true,
                        allowTaint: false,
                        removeContainer: true,
                        imageTimeout: 30000
                    });
                } else {
                    throw canvasError;
                }
            }

            template.style.display = 'none';

            // Create blob
            this.updateLoadingMessage(loading, 'Creating download file...');
            let blob;
            try {
                blob = await Utils.canvasToBlobPromise(canvas, 'image/png', 0.95);
            } catch (blobError) {
                console.error('PNG blob creation failed:', blobError);
                if (isMobile) {
                    console.log('⚠️ Retrying with JPEG...');
                    this.updateLoadingMessage(loading, 'Trying alternative format...');
                    blob = await Utils.canvasToBlobPromise(canvas, 'image/jpeg', 0.85);
                } else {
                    throw blobError;
                }
            }

            const blobSizeMB = (blob.size / 1024 / 1024).toFixed(2);
            console.log(`📊 Image size: ${blobSizeMB} MB`);

            if (blob.size > 50 * 1024 * 1024 && isMobile) {
                oms.hideLoading(loading);
                oms.showToast('⚠️ Image too large for mobile. Reduce quality in settings.', 'error');
                return;
            }

            // Download
            try {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const fileExt = blob.type.includes('jpeg') ? 'jpg' : 'png';
                link.download = `Order_${order.orderId}.${fileExt}`;

                if (isMobile) {
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    link.click();
                }

                setTimeout(() => URL.revokeObjectURL(url), isMobile ? 1000 : 100);
                oms.hideLoading(loading);
                oms.showToast(`✅ Image downloaded! (${blobSizeMB} MB)`);
            } catch (downloadError) {
                console.error('Download failed:', downloadError);
                oms.hideLoading(loading);
                oms.showToast('❌ Download failed: ' + downloadError.message, 'error');
            }
        } catch (error) {
            oms.hideLoading(loading);
            console.error('Image generation error:', error);
            if (isMobile) {
                oms.showToast(`❌ Failed on ${deviceType}: ${error.message}`, 'error');
            } else {
                oms.showToast('❌ Error: ' + error.message, 'error');
            }
        }
    },

    /**
     * Generate multi-order PDF (delegated to OMS for now due to complexity)
     * @param {Object} oms - Reference to OMS
     * @param {Array} orders - Array of orders
     * @param {string} date - Date for the orders
     */
    async generateMultiOrderImage(oms, orders, date) {
        // This function is very large and complex (~600 lines)
        // For now, we delegate to the original implementation in index.html
        // TODO: Extract full implementation in future refactoring
        console.log('📝 Multi-order PDF generation - using OMS implementation');

        // If original implementation exists, call it
        if (typeof oms._originalGenerateMultiOrderImage === 'function') {
            return oms._originalGenerateMultiOrderImage(orders, date);
        }
    }
};

// Make globally available for backward compatibility
if (typeof window !== 'undefined') {
    window.Print = Print;
}
