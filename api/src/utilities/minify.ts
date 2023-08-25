import 'dotenv/config';
import HashIdsContructor from 'hashids';

const Salt = process.env.HASH_ID_SALT || undefined;
const MinLength = Number(process.env.HASH_ID_MIN_LENGTH) || 8;
const Alphabet = process.env.HASH_ID_ALPHABET || undefined;
const HashIds = new HashIdsContructor(Salt, MinLength, Alphabet);

function decode(id: string): bigint {
    return BigInt(HashIds.decode(id)[0]);
}

function encode(id: bigint): string {
    return HashIds.encode(id);
}

function validate(id: string): boolean {
    return HashIds.isValidId(id);
}

export const Minify = {
    decode,
    encode,
    validate,
}