/**
 * Ascon-128 Image Encryption and Decryption App
 * This script handles all client-side encryption/decryption operations
 */

// DOM Elements
const imageUpload = document.getElementById('image-upload');
const originalImage = document.getElementById('original-image');
const resultImage = document.getElementById('result-image');
const secretKeyInput = document.getElementById('secret-key');
const encryptBtn = document.getElementById('encrypt-btn');
const decryptBtn = document.getElementById('decrypt-btn');
const downloadBtn = document.getElementById('download-btn');
const statusMessage = document.getElementById('status-message');

// Global variables
let originalFileData = null;
let resultFileData = null;
let isImageFile = false;

// Event Listeners
imageUpload.addEventListener('change', handleFileUpload);
encryptBtn.addEventListener('click', encryptFile);
decryptBtn.addEventListener('click', decryptFile);
downloadBtn.addEventListener('click', downloadResult);

/**
 * Handle file upload and preview
 */
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        showStatus('Please select a file.', 'error');
        return;
    }

    // Clear the secret key when a new file is uploaded
    secretKeyInput.value = '';
    
    // Reset buttons
    encryptBtn.disabled = true;
    decryptBtn.disabled = true;
    downloadBtn.disabled = true;

    const reader = new FileReader();
    
    // Check if it's an image file
    isImageFile = file.type.startsWith('image/');
    
    reader.onload = function(e) {
        if (isImageFile) {
            // For image files, show preview
            originalImage.src = e.target.result;
            originalImage.onload = function() {
                originalFileData = e.target.result;
                showStatus('Image loaded successfully. Enter a secret key and choose an operation.', 'success');
                encryptBtn.disabled = false;
                decryptBtn.disabled = false;
            };
        } else {
            // For non-image files, just store the data
            originalFileData = e.target.result;
            originalImage.src = ''; // Clear image preview
            showStatus('File loaded successfully. Enter a secret key and choose an operation.', 'success');
            encryptBtn.disabled = false;
            decryptBtn.disabled = false;
        }
    };
    
    // Read as data URL for images, as array buffer for others
    if (isImageFile) {
        reader.readAsDataURL(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

/**
 * Encrypt the uploaded file using Ascon-128
 */
async function encryptFile() {
    if (!originalFileData) {
        showStatus('Please upload a file first.', 'error');
        return;
    }

    const secretKey = secretKeyInput.value;
    if (!secretKey) {
        showStatus('Please enter a secret key.', 'error');
        return;
    }

    try {
        showStatus('Encrypting file...', 'processing');
        encryptBtn.disabled = true;
        decryptBtn.disabled = true;

        // Convert file to byte array
        let fileBytes;
        if (isImageFile && originalFileData.startsWith('data:')) {
            // For image data URLs
            const base64 = originalFileData.split(',')[1];
            const binary = atob(base64);
            fileBytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                fileBytes[i] = binary.charCodeAt(i);
            }
        } else {
            // For array buffers (non-image files)
            fileBytes = new Uint8Array(originalFileData);
        }
        
        // Generate a random nonce (16 bytes for Ascon-128)
        const nonce = new Uint8Array(16);
        window.crypto.getRandomValues(nonce);
        
        // Convert key to byte array (16 bytes for Ascon-128)
        const encoder = new TextEncoder();
        let keyBytes = encoder.encode(secretKey);
        
        // Ensure key is 16 bytes
        if (keyBytes.length < 16) {
            // Pad with zeros if too short
            const paddedKey = new Uint8Array(16);
            paddedKey.set(keyBytes);
            keyBytes = paddedKey;
        } else if (keyBytes.length > 16) {
            // Truncate if too long
            keyBytes = keyBytes.slice(0, 16);
        }
        
        // Encrypt the file data using Ascon-128
        const encryptedData = JsAscon.encrypt(keyBytes, nonce, new Uint8Array(), fileBytes);
        
        // Prepend nonce to encrypted data for decryption
        const nonceAndEncrypted = new Uint8Array(nonce.length + encryptedData.length);
        nonceAndEncrypted.set(nonce, 0);
        nonceAndEncrypted.set(encryptedData, nonce.length);
        
        // Convert to blob and prepare for download
        const encryptedBlob = new Blob([nonceAndEncrypted], { type: 'application/octet-stream' });
        const encryptedUrl = URL.createObjectURL(encryptedBlob);
        
        // Clear image preview since encrypted data isn't a valid image
        resultImage.src = '';
        resultImage.alt = 'Encrypted data';
        resultFileData = encryptedUrl;
        
        downloadBtn.disabled = false;
        showStatus('File encrypted successfully! The encrypted data is scrambled and unreadable.', 'success');
    } catch (error) {
        console.error('Encryption error:', error);
        showStatus(`Encryption failed: ${error.message}`, 'error');
    } finally {
        encryptBtn.disabled = false;
        decryptBtn.disabled = false;
    }
}

/**
 * Decrypt the uploaded file using Ascon-128
 */
async function decryptFile() {
    if (!originalFileData) {
        showStatus('Please upload an encrypted file first.', 'error');
        return;
    }

    const secretKey = secretKeyInput.value;
    if (!secretKey) {
        showStatus('Please enter a secret key.', 'error');
        return;
    }

    try {
        showStatus('Decrypting file...', 'processing');
        encryptBtn.disabled = true;
        decryptBtn.disabled = true;

        // Convert file to byte array
        let fileBytes;
        if (isImageFile && originalFileData.startsWith('data:')) {
            // For image data URLs
            const base64 = originalFileData.split(',')[1];
            const binary = atob(base64);
            fileBytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                fileBytes[i] = binary.charCodeAt(i);
            }
        } else {
            // For array buffers (non-image files)
            fileBytes = new Uint8Array(originalFileData);
        }
        
        // Extract nonce (first 16 bytes) and encrypted data
        if (fileBytes.length < 16) {
            throw new Error('Invalid encrypted data');
        }
        
        const nonce = fileBytes.slice(0, 16);
        const encryptedData = fileBytes.slice(16);
        
        // Convert key to byte array (16 bytes for Ascon-128)
        const encoder = new TextEncoder();
        let keyBytes = encoder.encode(secretKey);
        
        // Ensure key is 16 bytes
        if (keyBytes.length < 16) {
            // Pad with zeros if too short
            const paddedKey = new Uint8Array(16);
            paddedKey.set(keyBytes);
            keyBytes = paddedKey;
        } else if (keyBytes.length > 16) {
            // Truncate if too long
            keyBytes = keyBytes.slice(0, 16);
        }
        
        // Decrypt the file data using Ascon-128
        const decryptedData = JsAscon.decrypt(keyBytes, nonce, new Uint8Array(), encryptedData);
        
        // Try to determine if the decrypted data is an image
        // Check if it starts with common image file signatures
        const isDecryptedImage = isLikelyImage(decryptedData);
        
        if (isDecryptedImage) {
            // Convert to blob and display as image
            const decryptedBlob = new Blob([decryptedData], { type: 'image/png' });
            const decryptedUrl = URL.createObjectURL(decryptedBlob);
            
            resultImage.src = decryptedUrl;
            resultImage.alt = 'Decrypted image';
            resultFileData = decryptedUrl;
        } else {
            // Convert to blob for download as binary file
            const decryptedBlob = new Blob([decryptedData], { type: 'application/octet-stream' });
            const decryptedUrl = URL.createObjectURL(decryptedBlob);
            
            resultImage.src = ''; // Clear image preview
            resultImage.alt = 'Decrypted file';
            resultFileData = decryptedUrl;
        }
        
        downloadBtn.disabled = false;
        showStatus('File decrypted successfully!', 'success');
    } catch (error) {
        console.error('Decryption error:', error);
        showStatus(`Decryption failed: ${error.message}`, 'error');
    } finally {
        encryptBtn.disabled = false;
        decryptBtn.disabled = false;
    }
}

/**
 * Check if byte array is likely an image based on file signatures
 */
function isLikelyImage(bytes) {
    // Check for PNG signature
    if (bytes.length > 8 &&
        bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 &&
        bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A) {
        return true;
    }
    
    // Check for JPEG signature
    if (bytes.length > 2 && bytes[0] === 0xFF && bytes[1] === 0xD8) {
        return true;
    }
    
    // Check for GIF signature
    if (bytes.length > 6 &&
        bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 &&
        bytes[3] === 0x38 && (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61) {
        return true;
    }
    
    return false;
}

/**
 * Download the result file
 */
function downloadResult() {
    if (!resultFileData) {
        showStatus('No result to download.', 'error');
        return;
    }

    const link = document.createElement('a');
    link.href = resultFileData;
    link.download = isImageFile ? 'encrypted-image.bin' : 'encrypted-file.bin';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Show status message
 */
function showStatus(message, type = '') {
    statusMessage.textContent = message;
    statusMessage.className = 'status';
    
    if (type === 'success') {
        statusMessage.classList.add('success');
    } else if (type === 'error') {
        statusMessage.classList.add('error');
    } else if (type === 'processing') {
        // No additional class for processing
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    showStatus('Upload a file and enter a secret key to begin.');
    encryptBtn.disabled = true;
    decryptBtn.disabled = true;
    downloadBtn.disabled = true;
});