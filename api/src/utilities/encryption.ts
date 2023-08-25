import 'dotenv/config';
import Crypto from 'crypto-js';
import CryptoRandomString from 'crypto-random-string';

const HmacSHA256Secret = process.env.HMAC_SHA256_SECRET || '823aa5983cb0e574bdf87d2f4477a431e2542c16ec99594d0463d5aa37022b0a';

function generateSalt(): string {
    return CryptoRandomString({length: 16});
}

function hashing(password: string, salt: string): string {
    return Crypto.HmacSHA256(password + salt, HmacSHA256Secret).toString();
}

export const Encryption = {
    hashing,
    generateSalt,
}