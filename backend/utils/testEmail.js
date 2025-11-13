const nodemailer = require('nodemailer');

// Test email configuration
const testEmailConfig = async () => {
    try {
        console.log('Testing email configuration...');
        console.log('SMTP_HOST:', process.env.SMTP_HOST);
        console.log('SMTP_PORT:', process.env.SMTP_PORT);
        console.log('SMTP_EMAIL:', process.env.SMTP_EMAIL);
        console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '***hidden***' : 'NOT SET');
        
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });
        
        // Verify connection
        const verified = await transporter.verify();
        console.log('SMTP Connection verified:', verified);
        
        // Send test email
        const testEmail = {
            from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
            to: 'test@example.com', // This will be caught by Mailtrap
            subject: 'Test Email from Flower Shop',
            html: `
                <h1>🌸 Test Email</h1>
                <p>This is a test email to verify Mailtrap configuration.</p>
                <p>If you see this in your Mailtrap inbox, the configuration is working!</p>
                <p>Sent at: ${new Date().toLocaleString()}</p>
            `
        };
        
        const result = await transporter.sendMail(testEmail);
        console.log('Test email sent successfully!');
        console.log('Message ID:', result.messageId);
        
        return { success: true, messageId: result.messageId };
        
    } catch (error) {
        console.error('Email configuration test failed:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { testEmailConfig };
