const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Generate a new 2FA secret for the user
function generateSecret() {
    const secret = speakeasy.generateSecret({ length: 20 });
    return secret;
}

// Reuse the QR code generation logic here
async function generateQRCodeURL(secret) {
    const otpauthUrl = secret.otpauth_url;  // This is the OTP auth URL to generate the QR code
    try {
        // Use QRCode.toDataURL to generate a base64-encoded QR code image
        const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);
        return qrCodeDataURL;
    } catch (error) {
        console.error("Error generating QR code:", error);
        throw error;  // Handle the error appropriately
    }
}

// Verify the 2FA code entered by the user
function verifyToken(secret, token) {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
    });
}

module.exports = { generateSecret, generateQRCodeURL, verifyToken };
