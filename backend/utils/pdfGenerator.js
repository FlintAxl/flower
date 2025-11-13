const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Generate PDF receipt for delivered orders
const generateOrderReceipt = async (orderData) => {
    try {
        const { order, user } = orderData;
        
        // Create HTML template for PDF
        const htmlTemplate = createReceiptTemplate(order, user);
        
        // Launch puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Set HTML content
        await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
        
        // Create receipts directory if it doesn't exist
        const receiptsDir = path.join(__dirname, '../receipts');
        if (!fs.existsSync(receiptsDir)) {
            fs.mkdirSync(receiptsDir, { recursive: true });
        }
        
        // Generate PDF
        const pdfPath = path.join(receiptsDir, `receipt-${order._id}.pdf`);
        
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });
        
        await browser.close();
        
        console.log(`PDF receipt generated: ${pdfPath}`);
        return { success: true, pdfPath };
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        return { success: false, error: error.message };
    }
};

// Create HTML template for receipt
const createReceiptTemplate = (order, user) => {
    const orderItemsHtml = order.orderItems.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>$${item.price}</td>
            <td>${item.quantity} Piece(s)</td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');
    
    const subtotal = order.orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Order Receipt</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
                line-height: 1.6;
            }
            .receipt-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border: 2px solid #4CAF50;
                border-radius: 10px;
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 2.5em;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .header p {
                margin: 10px 0 0 0;
                font-size: 1.2em;
                opacity: 0.9;
            }
            .content {
                padding: 30px;
            }
            .info-section {
                background: #f8f9fa;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
                border-left: 5px solid #4CAF50;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 5px 0;
                border-bottom: 1px dotted #ddd;
            }
            .info-label {
                font-weight: bold;
                color: #555;
            }
            .info-value {
                color: #333;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                border-radius: 8px;
                overflow: hidden;
            }
            .items-table th {
                background: #4CAF50;
                color: white;
                padding: 15px;
                text-align: left;
                font-weight: bold;
            }
            .items-table td {
                padding: 12px 15px;
                border-bottom: 1px solid #eee;
            }
            .items-table tr:nth-child(even) {
                background: #f9f9f9;
            }
            .items-table tr:hover {
                background: #f0f8f0;
            }
            .total-section {
                background: #e8f5e8;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
                border: 2px solid #4CAF50;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                font-size: 1.1em;
            }
            .grand-total {
                font-size: 1.3em;
                font-weight: bold;
                color: #4CAF50;
                border-top: 2px solid #4CAF50;
                padding-top: 10px;
                margin-top: 10px;
            }
            .status-badge {
                display: inline-block;
                padding: 8px 16px;
                background: #4CAF50;
                color: white;
                border-radius: 20px;
                font-weight: bold;
                text-transform: uppercase;
            }
            .footer {
                text-align: center;
                padding: 20px;
                background: #f8f9fa;
                color: #666;
                font-style: italic;
            }
            .watermark {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 6em;
                color: rgba(76, 175, 80, 0.05);
                z-index: -1;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="watermark">FLOWER SHOP</div>
        <div class="receipt-container">
            <div class="header">
                <h1>🌸 FLOWER SHOP</h1>
                <p>Order Receipt & Invoice</p>
            </div>
            
            <div class="content">
                <div class="info-section">
                    <h3 style="margin-top: 0; color: #4CAF50;">📋 Order Information</h3>
                    <div class="info-row">
                        <span class="info-label">Order ID:</span>
                        <span class="info-value">${order._id}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Order Date:</span>
                        <span class="info-value">${new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Order Status:</span>
                        <span class="status-badge">${order.orderStatus}</span>
                    </div>
                    ${order.deliveredAt ? `
                    <div class="info-row">
                        <span class="info-label">Delivered On:</span>
                        <span class="info-value">${new Date(order.deliveredAt).toLocaleDateString()}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="info-section">
                    <h3 style="margin-top: 0; color: #4CAF50;">👤 Customer Information</h3>
                    <div class="info-row">
                        <span class="info-label">Name:</span>
                        <span class="info-value">${user.name}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Phone:</span>
                        <span class="info-value">${order.shippingInfo.phoneNo}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Address:</span>
                        <span class="info-value">
                            ${order.shippingInfo.address}<br>
                            ${order.shippingInfo.city}, ${order.shippingInfo.postalCode}<br>
                            ${order.shippingInfo.country}
                        </span>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3 style="margin-top: 0; color: #4CAF50;">💳 Payment Information</h3>
                    <div class="info-row">
                        <span class="info-label">Payment Status:</span>
                        <span class="status-badge">PAID</span>
                    </div>
                    ${order.paidAt ? `
                    <div class="info-row">
                        <span class="info-label">Paid On:</span>
                        <span class="info-value">${new Date(order.paidAt).toLocaleDateString()}</span>
                    </div>
                    ` : ''}
                </div>
                
                <h3 style="color: #4CAF50;">🛍️ Order Items</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderItemsHtml}
                    </tbody>
                </table>
                
                <div class="total-section">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>Tax:</span>
                        <span>$${order.taxPrice.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>Shipping:</span>
                        <span>$${order.shippingPrice.toFixed(2)}</span>
                    </div>
                    <div class="total-row grand-total">
                        <span>Grand Total:</span>
                        <span>$${order.totalPrice}</span>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>Thank you for shopping with Flower Shop! 🌸</p>
                <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
        </div>
    </body>
    </html>
    `;
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
