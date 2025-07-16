const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Load SMTP configuration from environment variables
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_TO = 'info@fair-taste.de'
} = process.env;

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT ? Number(SMTP_PORT) : 587,
      secure: false,
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
    });
    return transporter;
  }

  console.log('No SMTP configuration found. Emails will be logged to the console.');
  transporter = {
    async sendMail(options) {
      console.log('Mail contents:', options);
      return { messageId: 'console' };
    }
  };
  return transporter;
}

app.post('/api/apply', upload.single('foto'), async (req, res) => {
  try {
    const transport = await getTransporter();
    const data = req.body;
    const attachment = req.file
      ? [{ filename: req.file.originalname, content: req.file.buffer }]
      : [];

    const mailOptions = {
      from: SMTP_USER,
      to: EMAIL_TO,
      subject: data.subject || 'Neue Bewerbung',
      text: data.body || '',
      attachments: attachment
    };

    await transport.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error('Mail error', error);
    res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
