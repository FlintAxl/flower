const nodemailer = require('nodemailer');

// Create transporter for Mailtrap
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });
};

// Send order status update email
const sendOrderStatusEmail = async (orderData, attachmentPath = null) => {
    try {
        const transporter = createTransporter();
        
        const { order, user } = orderData;
        
        // Create email content based on order status
        let subject = '';
        let htmlContent = '';
        
        if (order.orderStatus === 'Processing') {
            subject = `Order #${order._id} - Order Confirmed & Processing!`;
            htmlContent = createProcessingEmailTemplate(order, user);
        } else if (order.orderStatus === 'Shipped') {
            subject = `Order #${order._id} - Shipped!`;
            htmlContent = createShippedEmailTemplate(order, user);
        } else if (order.orderStatus === 'Delivered') {
            subject = `Order #${order._id} - Delivered!`;
            htmlContent = createDeliveredEmailTemplate(order, user);
        }
        
        const mailOptions = {
            from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
            to: user.email,
            subject: subject,
            html: htmlContent
        };
        
        // Add PDF attachment if provided (for delivered orders)
        if (attachmentPath) {
            mailOptions.attachments = [{
                filename: `receipt-${order._id}.pdf`,
                path: attachmentPath,
                contentType: 'application/pdf'
            }];
        }
        
        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
        
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

// Email template for shipped orders
const createShippedEmailTemplate = (order, user) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .order-info { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📦 Your Order Has Been Shipped!</h1>
            </div>
            <div class="content">
                <p>Hi ${user.name},</p>
                <p>Great news! Your order has been shipped and is on its way to you.</p>
                
                <div class="order-info">
                    <h3>Order Details:</h3>
                    <p><strong>Order ID:</strong> ${order._id}</p>
                    <p><strong>Order Status:</strong> <span style="color: #FF9800;">${order.orderStatus}</span></p>
                    <p><strong>Total Amount:</strong> $${order.totalPrice}</p>
                    <p><strong>Shipping Address:</strong><br>
                       ${order.shippingInfo.address}<br>
                       ${order.shippingInfo.city}, ${order.shippingInfo.postalCode}<br>
                       ${order.shippingInfo.country}
                    </p>
                </div>
                
                <p>You should receive your order soon. We'll notify you once it's delivered!</p>
                <p><strong>Note:</strong> A detailed PDF receipt is attached to this email for your records.</p>
            </div>
            <div class="footer">
                <p>Thank you for shopping with Flower Shop!</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Email template for delivered orders
const createDeliveredEmailTemplate = (order, user) => {
    const orderItemsHtml = order.orderItems.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>$${item.price}</td>
            <td>${item.quantity} Piece(s)</td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .order-info { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background: #f2f2f2; }
            .footer { text-align: center; padding: 20px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Order Delivered Successfully!</h1>
            </div>
            <div class="content">
                <p>Hi ${user.name},</p>
                <p>Your order has been delivered successfully! Please find your receipt attached.</p>
                
                <div class="order-info">
                    <h3>Order Summary:</h3>
                    <p><strong>Order ID:</strong> ${order._id}</p>
                    <p><strong>Order Status:</strong> <span style="color: #4CAF50;">${order.orderStatus}</span></p>
                    <p><strong>Delivered On:</strong> ${new Date().toLocaleDateString()}</p>
                    
                    <h4>Order Items:</h4>
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
                    
                    <p><strong>Total Amount:</strong> $${order.totalPrice}</p>
                </div>
                
                <p>Thank you for your purchase! We hope you enjoy your products.</p>
                <p><strong>Note:</strong> A detailed PDF receipt is attached to this email.</p>
            </div>
            <div class="footer">
                <p>Thank you for shopping with Flower Shop!</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Email template for processing orders
const createProcessingEmailTemplate = (order, user) => {
    const orderItemsHtml = order.orderItems.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>$${item.price}</td>
            <td>${item.quantity} Piece(s)</td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .order-info { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background: #f2f2f2; }
            .footer { text-align: center; padding: 20px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Order Confirmed & Processing!</h1>
            </div>
            <div class="content">
                <p>Hi ${user.name},</p>
                <p>Thank you for your order! We've received your order and it's now being processed.</p>
                
                <div class="order-info">
                    <h3>Order Details:</h3>
                    <p><strong>Order ID:</strong> ${order._id}</p>
                    <p><strong>Order Status:</strong> <span style="color: #2196F3;">${order.orderStatus}</span></p>
                    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><strong>Total Amount:</strong> $${order.totalPrice}</p>
                    <p><strong>Shipping Address:</strong><br>
                       ${order.shippingInfo.address}<br>
                       ${order.shippingInfo.city}, ${order.shippingInfo.postalCode}<br>
                       ${order.shippingInfo.country}
                    </p>
                    
                    <h4>Order Items:</h4>
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
                </div>
                
                <p>We're preparing your order and will notify you once it's shipped!</p>
                <p><strong>Note:</strong> A detailed PDF receipt is attached to this email for your records.</p>
            </div>
            <div class="footer">
                <p>Thank you for shopping with Flower Shop!</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    sendOrderStatusEmail
};
