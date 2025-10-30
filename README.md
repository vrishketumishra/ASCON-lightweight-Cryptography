# Ascon-128 Image Encryption and Decryption App

A web-based application for encrypting and decrypting images using the Ascon-128 lightweight cryptography algorithm. All cryptographic operations happen client-side in JavaScript, ensuring your data never leaves your browser.

## Features

- **Client-Side Encryption**: All cryptographic operations are performed in your browser
- **Ascon-128**: Uses the NIST-standardized lightweight cryptography algorithm
- **Nonce Management**: Automatically generates and manages nonces for security
- **Secure Key Handling**: Processes secret keys securely without storing them
- **Responsive UI**: Works on desktop and mobile devices
- **Single-Page Application**: No page reloads required
- **GitHub Pages Ready**: Can be hosted directly on GitHub Pages

## How It Works

1. **Upload an Image**: Choose any image file from your device
2. **Enter a Secret Key**: Provide a password for encryption/decryption (16 characters recommended)
3. **Encrypt**: Scrambles the image data using Ascon-128, making it unreadable
4. **Decrypt**: Restores the original image using the same secret key
5. **Download**: Save the encrypted or decrypted result to your device

## Technical Details

- **Encryption Algorithm**: Ascon-128 (NIST Lightweight Cryptography Standard)
- **Nonce Management**: 16-byte random nonce prepended to ciphertext
- **Key Derivation**: Secret key is processed to fit the 16-byte requirement
- **Data Handling**: All operations happen in memory, no data is stored or transmitted

## Security Notes

- The encrypted output is not a valid image file and will appear as scrambled data
- For best security, use a 16-character secret key
- Nonces are randomly generated for each encryption operation
- The same key and nonce combination should never be reused

## Browser Requirements

- Modern browser with JavaScript enabled
- Web Crypto API support (all modern browsers)
- No additional plugins or extensions required

## Hosting

This application can be hosted on any static web server, including:
- GitHub Pages
- Netlify
- Vercel
- Any web hosting service

## Files

- `index.html` - Main HTML structure
- `styles.css` - Simplified styling and layout
- `script.js` - Client-side encryption/decryption logic
- `README.md` - This file

## Libraries Used

- [js-ascon](https://github.com/brainfoolong/js-ascon) - JavaScript implementation of Ascon

## Usage

1. Open `index.html` in a web browser
2. Upload an image file
3. Enter a secret key
4. Click "Encrypt Image" to encrypt or "Decrypt Image" to decrypt
5. Download the result using the "Download Result" button

## Live Link

https://vrishketumishra.github.io/ASCON-lightweight-Cryptography/

