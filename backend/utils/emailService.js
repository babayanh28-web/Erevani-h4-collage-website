const nodemailer = require('nodemailer');
const logger = require('./logger');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }
    
    async sendApplicationConfirmation(application) {
        const mailOptions = {
            from: `"Երևանի Հ4 Ուսումնարան" <${process.env.SMTP_USER}>`,
            to: application.email,
            subject: 'Հայտի ընդունում - Երևանի Հ4 Ուսումնարան',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4361ee;">Շնորհակալություն դիմելու համար!</h2>
                    <p>Հարգելի ${application.name},</p>
                    <p>Մենք ստացել ենք Ձեր դիմումը <strong>${application.specialty}</strong> մասնագիտության համար:</p>
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Հայտի տվյալներ:</strong></p>
                        <p>📞 Հեռախոս: ${application.phone}</p>
                        <p>📧 Էլ. փոստ: ${application.email}</p>
                        <p>📅 Ամսաթիվ: ${application.createdAt.toLocaleString('hy-AM')}</p>
                    </div>
                    <p>Մեր աշխատակիցը կկապնվի Ձեզ հետ մոտակա ժամերին:</p>
                    <p>Հարգանքով,<br>Ընդունելության հանձնաժողով</p>
                    <hr style="margin: 30px 0;">
                    <p style="font-size: 12px; color: #64748b;">Երևանի Հ4 Ուսումնարան | Հասցե: Գյուլիքևխյան 20, Երևան | Հեռ: +374 (010) 634-070</p>
                </div>
            `
        };
        
        try {
            await this.transporter.sendMail(mailOptions);
            logger.info(`Confirmation email sent to ${application.email}`);
            return true;
        } catch (error) {
            logger.error('Email sending failed:', error);
            return false;
        }
    }
    
    async sendAdminNotification(application) {
        const mailOptions = {
            from: `"Երևանի Հ4 Ուսումնարան" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: 'Նոր դիմում - Երևանի Հ4 Ուսումնարան',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4361ee;">Նոր դիմում է ստացվել</h2>
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Դիմող:</strong> ${application.name}</p>
                        <p><strong>Մասնագիտություն:</strong> ${application.specialty}</p>
                        <p><strong>Հեռախոս:</strong> ${application.phone}</p>
                        <p><strong>Էլ. փոստ:</strong> ${application.email}</p>
                        <p><strong>IP հասցե:</strong> ${application.ipAddress}</p>
                        <p><strong>Բրաուզեր:</strong> ${application.userAgent}</p>
                    </div>
                    <a href="${process.env.ADMIN_URL || 'http://localhost:3000'}/admin" 
                       style="background: #4361ee; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        Դիտել դիմումը
                    </a>
                </div>
            `
        };
        
        try {
            await this.transporter.sendMail(mailOptions);
            logger.info(`Admin notification sent for application ${application._id}`);
            return true;
        } catch (error) {
            logger.error('Admin notification failed:', error);
            return false;
        }
    }
}

module.exports = new EmailService();