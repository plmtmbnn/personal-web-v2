import { generateSecret, generateURI } from 'otplib';
import qrcode from 'qrcode-terminal';

const secret = generateSecret();
const user = 'Admin';
const service = 'Personal Hub';

const otpauth = generateURI({
    issuer: service,
    label: user,
    secret,
});

console.log('\n=============================================');
console.log('Google Authenticator Setup');
console.log('=============================================');
console.log(`Secret Key: ${secret}`);
console.log('\nScan this QR code with Google Authenticator or similar app:\n');

qrcode.generate(otpauth, { small: true });

console.log('\n=============================================');
console.log('IMPORTANT: Add the following to your .env file:');
console.log(`TOTP_SECRET="${secret}"`);
console.log('=============================================\n');
