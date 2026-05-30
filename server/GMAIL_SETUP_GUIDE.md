# 📧 Gmail SMTP Setup Guide for JobPortal

This guide will help you configure Gmail SMTP for sending emails in your JobPortal application.

## 🚀 Quick Setup Steps

### 1. Enable 2-Factor Authentication on Gmail

1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the setup process to enable 2FA

### 2. Generate App Password

1. After enabling 2FA, go back to **Security** settings
2. Under "Signing in to Google", click **App passwords**
3. Select **Mail** as the app
4. Select **Other (Custom name)** as the device
5. Enter "JobPortal" as the custom name
6. Click **Generate**
7. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### 3. Configure Environment Variables

Update your `server/.env` file with the following:

```env
# Email Configuration (Gmail SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-character-app-password"
FROM_EMAIL="your-email@gmail.com"
FROM_NAME="JobPortal Team"
```

**Replace:**
- `your-email@gmail.com` with your actual Gmail address
- `your-16-character-app-password` with the app password from step 2

### 4. Test the Configuration

1. Start your server: `npm run dev`
2. Go to `http://localhost:3001/test-auth`
3. Enter a test email and click "Send Verification Email"
4. Check the server console for success messages

## 🔧 Configuration Details

### SMTP Settings for Gmail:
- **Host:** `smtp.gmail.com`
- **Port:** `587` (TLS) or `465` (SSL)
- **Security:** TLS (recommended)
- **Authentication:** Required

### Environment Variables Explained:

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | Gmail SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | Port for TLS connection | `587` |
| `SMTP_SECURE` | Use SSL (465) or TLS (587) | `false` for TLS |
| `SMTP_USER` | Your Gmail address | `yourname@gmail.com` |
| `SMTP_PASS` | Gmail App Password | `abcd efgh ijkl mnop` |
| `FROM_EMAIL` | Sender email address | `yourname@gmail.com` |
| `FROM_NAME` | Sender display name | `JobPortal Team` |

## 🛠️ Troubleshooting

### Common Issues:

1. **"Invalid login" error:**
   - Make sure 2FA is enabled
   - Use App Password, not your regular Gmail password
   - Remove spaces from the App Password

2. **"Connection timeout" error:**
   - Check your internet connection
   - Verify SMTP settings
   - Try port 465 with `SMTP_SECURE="true"`

3. **"Authentication failed" error:**
   - Double-check your Gmail address
   - Regenerate App Password if needed
   - Ensure no typos in environment variables

### Testing Commands:

```bash
# Test email configuration
curl -X POST http://localhost:5000/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 🔒 Security Best Practices

1. **Never commit your .env file** to version control
2. **Use different App Passwords** for different applications
3. **Regularly rotate App Passwords**
4. **Monitor your Gmail security activity**

## 📱 Production Considerations

For production, consider:

1. **Professional Email Service:**
   - SendGrid
   - Mailgun
   - Amazon SES
   - Postmark

2. **Domain-based Email:**
   - Use `noreply@yourdomain.com`
   - Set up SPF, DKIM, and DMARC records

3. **Rate Limiting:**
   - Gmail has sending limits
   - Implement email queuing for high volume

## ✅ Verification Checklist

- [ ] 2FA enabled on Gmail account
- [ ] App Password generated
- [ ] Environment variables configured
- [ ] Server restarted after .env changes
- [ ] Test email sent successfully
- [ ] Email received in inbox
- [ ] Verification link works
- [ ] Password reset email works

## 🎉 Success!

Once configured, your JobPortal will send beautiful, professional emails for:
- ✅ Email verification
- 🔐 Password reset
- 📧 Future notifications

Your users will receive modern, Gen Z-styled emails that match your platform's aesthetic!
