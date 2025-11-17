const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// Generate PDF receipt for orders using pdfkit (no headless browser required)
const generateOrderReceipt = async ({ order, user }) => {
    try {
        if (!order || !user) {
            throw new Error('Missing order or user information for PDF generation');
        }

        const receiptsDir = path.join(__dirname, '../receipts');
        if (!fs.existsSync(receiptsDir)) {
            fs.mkdirSync(receiptsDir, { recursive: true });
        }

        const pdfPath = path.join(receiptsDir, `receipt-${order._id}.pdf`);

        await new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 40, size: 'A4' });
            const stream = fs.createWriteStream(pdfPath);

            doc.pipe(stream);

            // Header
            doc
                .fontSize(24)
                .fillColor('#4CAF50')
                .text('FLOWER SHOP', { align: 'center' });
            doc
                .fontSize(12)
                .fillColor('#555555')
                .text('Order Receipt & Invoice', { align: 'center' });
            doc.moveDown();

            // Order Info
            doc.fillColor('#333333').fontSize(12);
            doc.text(`Order ID: ${order._id}`);
            doc.text(`Order Date: ${formatDate(order.createdAt)}`);
            doc.text(`Order Status: ${order.orderStatus}`);
            if (order.deliveredAt) {
                doc.text(`Delivered On: ${formatDate(order.deliveredAt)}`);
            }
            doc.moveDown();

            // Customer Info
            doc.fontSize(14).fillColor('#4CAF50').text('Customer Information');
            doc.moveDown(0.3);
            doc.fontSize(12).fillColor('#333333');
            doc.text(`Name: ${user.name}`);
            doc.text(`Email: ${user.email}`);
            doc.text(`Phone: ${order.shippingInfo?.phoneNo || 'N/A'}`);
            doc.text('Shipping Address:');
            doc.text(`${order.shippingInfo?.address || ''}`);
            doc.text(`${order.shippingInfo?.city || ''}, ${order.shippingInfo?.postalCode || ''}`);
            doc.text(order.shippingInfo?.country || '');
            doc.moveDown();

            // Items Table
            doc.fontSize(14).fillColor('#4CAF50').text('Order Items');
            doc.moveDown(0.5);
            drawTableHeader(doc);

            const items = order.orderItems || [];
            let y = doc.y + 5;
            doc.fontSize(11).fillColor('#333333');

            items.forEach((item) => {
                const lineHeight = 18;
                doc.text(item.name, 40, y, { width: 180 });
                doc.text(`$${Number(item.price).toFixed(2)}`, 230, y, { width: 70 });
                doc.text(`${item.quantity}`, 310, y, { width: 50 });
                doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 370, y, { width: 80, align: 'right' });
                y += lineHeight;
            });

            doc.moveDown(2);

            // Totals
            const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const taxPrice = Number(order.taxPrice || 0);
            const shippingPrice = Number(order.shippingPrice || 0);
            const totalPrice = Number(order.totalPrice || subtotal + taxPrice + shippingPrice);

            doc.fontSize(12).fillColor('#333333');
            doc.text(`Subtotal: $${subtotal.toFixed(2)}`, { align: 'right' });
            doc.text(`Tax: $${taxPrice.toFixed(2)}`, { align: 'right' });
            doc.text(`Shipping: $${shippingPrice.toFixed(2)}`, { align: 'right' });
            doc.fontSize(14).fillColor('#4CAF50');
            doc.text(`Total: $${totalPrice.toFixed(2)}`, { align: 'right' });
            doc.moveDown();

            doc.fontSize(10).fillColor('#777777').text('Thank you for shopping with Flower Shop! 🌸', { align: 'center' });

            doc.end();

            stream.on('finish', resolve);
            stream.on('error', reject);
        });

        console.log(`PDF receipt generated: ${pdfPath}`);
        return { success: true, pdfPath };
    } catch (error) {
        console.error('Error generating PDF:', error);
        return { success: false, error: error.message };
    }
};

const drawTableHeader = (doc) => {
    const y = doc.y;
    doc
        .fontSize(12)
        .fillColor('#555555')
        .text('Product', 40, y)
        .text('Price', 230, y)
        .text('Qty', 310, y)
        .text('Total', 370, y, { align: 'right' });
    doc.moveTo(40, y + 15).lineTo(550, y + 15).stroke('#dddddd');
};

const formatDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleString();
};

// Clean up old PDF files (optional utility)
const cleanupOldReceipts = async (daysOld = 30) => {
    try {
        const receiptsDir = path.join(__dirname, '../receipts');
        if (!fs.existsSync(receiptsDir)) return;
        
        const files = fs.readdirSync(receiptsDir);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        
        for (const file of files) {
            const filePath = path.join(receiptsDir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.mtime < cutoffDate) {
                fs.unlinkSync(filePath);
                console.log(`Cleaned up old receipt: ${file}`);
            }
        }
    } catch (error) {
        console.error('Error cleaning up receipts:', error);
    }
};

module.exports = {
    generateOrderReceipt,
    cleanupOldReceipts
};
