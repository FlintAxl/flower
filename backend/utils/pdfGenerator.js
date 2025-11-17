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
            const doc = new PDFDocument({ margin: 30, size: 'A4' });
            const stream = fs.createWriteStream(pdfPath);

            doc.pipe(stream);

            drawWatermark(doc);
            drawHeader(doc);

            drawInfoSection(doc, 'Order Information', [
                { label: 'Order ID', value: order._id },
                { label: 'Order Date', value: formatDate(order.createdAt) },
                { label: 'Status', value: order.orderStatus },
                ...(order.deliveredAt ? [{ label: 'Delivered On', value: formatDate(order.deliveredAt) }] : [])
            ]);

            drawInfoSection(doc, 'Customer Information', [
                { label: 'Name', value: user.name },
                { label: 'Email', value: user.email },
                { label: 'Phone', value: order.shippingInfo?.phoneNo || 'N/A' },
                {
                    label: 'Address',
                    value: `${order.shippingInfo?.address || ''}, ${order.shippingInfo?.city || ''} ${order.shippingInfo?.postalCode || ''}, ${order.shippingInfo?.country || ''}`
                }
            ]);

            drawInfoSection(doc, 'Payment Details', [
                { label: 'Method', value: (order.paymentMethod || 'card').toUpperCase() },
                { label: 'Payment Status', value: order.paymentInfo?.status || (order.paymentMethod === 'cod' ? 'Pending' : 'Paid') },
                ...(order.paidAt ? [{ label: 'Paid On', value: formatDate(order.paidAt) }] : [])
            ]);

            drawItemsTable(doc, order.orderItems || []);
            drawTotals(doc, order);

            doc.moveDown(2);
            doc.fontSize(10)
                .fillColor('#666666')
                .text('Thank you for shopping with Botany & Co!', { align: 'center' });

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

const drawWatermark = (doc) => {
    doc.save();
    doc.rotate(-45, { origin: [300, 400] });
    doc.fillColor('#4CAF50');
    doc.fillOpacity(0.05);
    doc.fontSize(80).text('FLOWER SHOP', -100, 350, {
        width: 800,
        align: 'center'
    });
    doc.fillOpacity(1);
    doc.restore();
};

const drawHeader = (doc) => {
    const gradient = doc.linearGradient(30, 30, 580, 130)
        .stop(0, '#7c3aed')
        .stop(1, '#ec4899');

    doc.save();
    doc.rect(30, 30, 550, 100).fill(gradient);
    doc.fillColor('#ffffff').fontSize(28).text('Botany & Co', 30, 50, {
        width: 550,
        align: 'center'
    });
    doc.fontSize(14).text('Order Receipt & Invoice', { align: 'center' });
    doc.restore();

    doc.moveDown(3.5);
};

const drawInfoSection = (doc, title, rows) => {
    const startY = doc.y;
    const lineHeight = 18;
    const height = rows.length * lineHeight + 40;

    doc.save();
    doc.roundedRect(35, startY - 5, 540, height, 12)
        .fillAndStroke('#f7f5ff', '#e1def8');

    doc.fillColor('#7c3aed').fontSize(14).text(title, 50, startY + 10);

    doc.fontSize(11).fillColor('#333333');
    let currentY = startY + 32;
    rows.forEach((row, index) => {
        doc.text(row.label, 50, currentY);
        doc.text(row.value, 320, currentY, { width: 240, align: 'right' });
        currentY += lineHeight;
        if (index !== rows.length - 1) {
            doc.moveTo(50, currentY - 4).lineTo(555, currentY - 4).stroke('#e3e0f8');
        }
    });
    doc.restore();
    doc.moveDown(rows.length * 0.25 + 1.1);
};

const drawItemsTable = (doc, items) => {
    doc.fontSize(14).fillColor('#7c3aed').text('Order Items');
    doc.moveDown(0.3);

    const startY = doc.y;
    doc.save();
    doc.roundedRect(35, startY - 10, 540, items.length * 22 + 50, 10)
        .fillAndStroke('#ffffff', '#ececec');

    doc.fillColor('#ffffff')
        .rect(35, startY - 10, 540, 28)
        .fill('#7c3aed');

    doc.fillColor('#ffffff')
        .fontSize(12)
        .text('Product', 50, startY - 2)
        .text('Price', 260, startY - 2)
        .text('Qty', 350, startY - 2)
        .text('Total', 430, startY - 2, { align: 'right', width: 130 });

    doc.fontSize(11).fillColor('#333333');
    let currentY = startY + 20;
    items.forEach(item => {
        doc.text(item.name, 50, currentY, { width: 200 });
        doc.text(`$${Number(item.price).toFixed(2)}`, 260, currentY);
        doc.text(`${item.quantity}`, 350, currentY);
        doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 430, currentY, { align: 'right', width: 130 });
        currentY += 20;
        doc.moveTo(50, currentY - 5).lineTo(555, currentY - 5).stroke('#efefef');
    });

    doc.restore();
    doc.moveDown(items.length * 0.2 + 2);
};

const drawTotals = (doc, order) => {
    const items = order.orderItems || [];
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxPrice = Number(order.taxPrice || 0);
    const shippingPrice = Number(order.shippingPrice || 0);
    const totalPrice = Number(order.totalPrice || subtotal + taxPrice + shippingPrice);

    const startY = doc.y;
    doc.save();
    doc.roundedRect(300, startY, 275, 120, 12).fill('#fef3c7');
    doc.fillColor('#b45309').fontSize(12);
    doc.text('Subtotal', 320, startY + 15);
    doc.text('Tax', 320, startY + 35);
    doc.text('Shipping', 320, startY + 55);
    doc.fontSize(13).fillColor('#92400e').text('Grand Total', 320, startY + 80);

    doc.fillColor('#111827').fontSize(12);
    doc.text(`$${subtotal.toFixed(2)}`, 500, startY + 15, { align: 'right' });
    doc.text(`$${taxPrice.toFixed(2)}`, 500, startY + 35, { align: 'right' });
    doc.text(`$${shippingPrice.toFixed(2)}`, 500, startY + 55, { align: 'right' });
    doc.fontSize(16).fillColor('#b45309');
    doc.text(`$${totalPrice.toFixed(2)}`, 500, startY + 78, { align: 'right' });
    doc.restore();

    doc.moveDown(4);
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
