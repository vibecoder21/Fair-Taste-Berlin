const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(cors());

// Load SMTP configuration from environment variables
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_TO = 'info@fair-taste.de'
} = process.env;

let transporter;
if (SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT ? Number(SMTP_PORT) : 587,
    secure: false,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
  });
} else {
  console.warn('SMTP configuration missing, emails will be logged to the console');
  transporter = {
    async sendMail(mailOptions) {
      console.log('--- Email preview ---');
      console.log('To:', EMAIL_TO);
      console.log('Subject:', mailOptions.subject);
      console.log(mailOptions.text);
      console.log('---------------------');
    }
  };
}

app.post('/api/apply', upload.single('foto'), async (req, res) => {
  try {
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

    await transporter.sendMail(mailOptions);
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
