require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Define Handlers
const handleContact = async (req, res) => {
    const { fullName, email, message } = req.body;

    // Log for debugging
    console.log('[API] Contact Request:', { fullName, email });

    // Validation
    if (!fullName || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required fields: Full Name, Email, and Message'
        });
    }

    const mailOptions = {
        from: `"${fullName}" <${email}>`,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: 'New Message from Website Contact Form',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                    .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { padding: 20px; background: #f9fafb; }
                    .field { margin-bottom: 15px; }
                    .label { font-weight: bold; color: #555; }
                    .value { background: white; padding: 10px; border-radius: 4px; border-left: 3px solid #22c55e; }
                </style>
            </head>
            <body>
                 <div style="max-width:600px;margin:0 auto;border:1px solid #ddd;border-radius:5px;">
                    <div class="header"><h3>📬 New Contact Message</h3></div>
                    <div class="content">
                        <div class="field"><div class="label">Name</div><div class="value">${fullName}</div></div>
                        <div class="field"><div class="label">Email</div><div class="value">${email}</div></div>
                        <div class="field"><div class="label">Message</div><div class="value" style="white-space:pre-wrap;">${message}</div></div>
                    </div>
                 </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('[API] Contact Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message: ' + error.message });
    }
};

const handleQuote = async (req, res) => {
    const { companyName, timeline, budget, services, name, email, industry, companySize, goals, additional_info } = req.body;
    console.log('[API] Quote Request:', { companyName, name });

    // Format arrays
    const servicesDisplay = Array.isArray(services) ? services.join(', ') : (services || 'None');
    const goalsDisplay = Array.isArray(goals) ? goals.join(', ') : (goals || 'None');

    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `Quote Request: ${companyName}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                    .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { padding: 20px; background: #f9fafb; }
                    .section { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
                    .title { font-size: 16px; color: #22c55e; font-weight: bold; margin-bottom: 10px; }
                    .row { margin-bottom: 8px; }
                </style>
            </head>
            <body>
                 <div style="max-width:600px;margin:0 auto;border:1px solid #ddd;border-radius:5px;">
                    <div class="header"><h3>💼 New Quote Request</h3></div>
                    <div class="content">
                        <div class="section">
                            <div class="title">Company Info</div>
                            <div class="row"><strong>Name:</strong> ${companyName}</div>
                            <div class="row"><strong>Industry:</strong> ${industry}</div>
                            <div class="row"><strong>Size:</strong> ${companySize || 'N/A'}</div>
                        </div>
                        <div class="section">
                            <div class="title">Project Details</div>
                            <div class="row"><strong>Goals:</strong> ${goalsDisplay}</div>
                            <div class="row"><strong>Timeline:</strong> ${timeline}</div>
                            <div class="row"><strong>Budget:</strong> ${budget}</div>
                            <div class="row"><strong>Services:</strong> ${servicesDisplay}</div>
                            <div class="row"><strong>Additional Info:</strong></div>
                            <div style="background:white;padding:10px;border-left:3px solid #22c55e;">${additional_info || 'None'}</div>
                        </div>
                         <div class="section" style="border:none;">
                            <div class="title">Contact</div>
                            <div class="row"><strong>Name:</strong> ${name}</div>
                            <div class="row"><strong>Email:</strong> ${email}</div>
                        </div>
                    </div>
                 </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Quote sent successfully!' });
    } catch (error) {
        console.error('[API] Quote Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const handleSubscribe = async (req, res) => {
    res.status(200).json({ success: true, message: 'Subscribed!' });
};

// Router
const router = express.Router();

// Health Check
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));
router.get('/debug', (req, res) => res.json({
    env_check: !!process.env.EMAIL_USER,
    path: req.path,
    url: req.url
}));

// API Routes
router.post('/contact', handleContact);
router.post('/quote', handleQuote);
router.post('/subscribe', handleSubscribe);

// Mount router on ALL paths to ensure Vercel catches it regardless of prefix stripping
// match /api/contact, /contact, etc.
app.use('/api', router);
app.use('/', router);

// 404 Handler
app.use((req, res) => {
    console.log(`[API] 404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ success: false, message: 'API Route not found', path: req.path });
});

module.exports = app;
