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
        } else if (order.orderStatus === 'Cancelled') {
            subject = `Order #${order._id} - Cancelled`;
            htmlContent = createCancelledEmailTemplate(order, user);
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

// Email template for cancelled orders
const createCancelledEmailTemplate = (order, user) => {
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
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .order-info { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background: #f2f2f2; }
            .footer { text-align: center; padding: 20px; color: #666; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>❌ Order Cancelled</h1>
            </div>
            <div class="content">
                <p>Hi ${user.name},</p>
                <p>Your order has been cancelled.</p>
                
                <div class="order-info">
                    <h3>Order Details:</h3>
                    <p><strong>Order ID:</strong> ${order._id}</p>
                    <p><strong>Order Status:</strong> <span style="color: #dc2626;">Cancelled</span></p>
                    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><strong>Total Amount:</strong> $${order.totalPrice}</p>
                    
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
                
                <div class="warning">
                    <strong>⚠️ Important:</strong>
                    <p>If you paid for this order, your refund will be processed according to our refund policy. Please contact our support team if you have any questions.</p>
                </div>
            </div>
            <div class="footer">
                <p>Thank you for your understanding.</p>
                <p>Botany & Co</p>
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

// Send password reset email
const sendEmail = async ({ email, subject, message }) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: subject,
            html: message
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
        
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
};

// Create password reset email template
const createPasswordResetEmailTemplate = (resetUrl, userName) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container { 
                max-width: 600px; 
                margin: 20px auto; 
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header { 
                background: linear-gradient(135deg, #a855f7, #6366f1); 
                color: white; 
                padding: 30px 20px; 
                text-align: center; 
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .content { 
                padding: 30px 20px; 
                background: #ffffff; 
            }
            .button-container {
                text-align: center;
                margin: 30px 0;
            }
            .reset-button {
                display: inline-block;
                padding: 14px 30px;
                background: linear-gradient(135deg, #a855f7, #6366f1);
                color: white;
                text-decoration: none;
                border-radius: 25px;
                font-weight: bold;
                font-size: 16px;
                box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
            }
            .reset-button:hover {
                opacity: 0.9;
            }
            .link-container {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                word-break: break-all;
            }
            .footer { 
                text-align: center; 
                padding: 20px; 
                color: #666; 
                background: #f8f9fa;
                font-size: 12px;
            }
            .warning {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
                <p>Hi ${userName || 'there'},</p>
                <p>We received a request to reset your password for your Botany & Co account. Click the button below to reset your password:</p>
                
                <div class="button-container">
                    <a href="${resetUrl}" class="reset-button">Reset Password</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <div class="link-container">
                    ${resetUrl}
                </div>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>This link will expire in 30 minutes</li>
                        <li>If you didn't request this, please ignore this email</li>
                        <li>Your password will not change until you click the link above</li>
                    </ul>
                </div>
                
                <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
            </div>
            <div class="footer">
                <p>This is an automated message, please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} Botany & Co. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    sendOrderStatusEmail,
    sendEmail,
    createPasswordResetEmailTemplate
};
