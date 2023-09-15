import 'dotenv/config';
import Crypto from 'crypto-js';
import CryptoRandomString from 'crypto-random-string';
import { InternalError } from '../middleware/error.middleware';

const HmacSHA256Secret = process.env.HMAC_SHA256_SECRET;

function generateSalt(): string {
    return CryptoRandomString({length: 16});
}

function hashing(password: string, salt: string): string {
    if (HmacSHA256Secret === undefined) throw new InternalError(`Configuration missing [HMAC_SHA256_SECRET]`);
    return Crypto.HmacSHA256(password + salt, HmacSHA256Secret).toString();
}

export const Encryption = {
    hashing,
    generateSalt,
}