import 'dotenv/config';
import HashIdsContructor from 'hashids';
import { ReferenceType } from './database';

const Salt = process.env.HASH_ID_SALT || undefined;
const MinLength = Number(process.env.HASH_ID_MIN_LENGTH) || 8;
const Alphabet = process.env.HASH_ID_ALPHABET || undefined;

function decode(referenceType: ReferenceType, id: string): bigint {
    let hashIds = new HashIdsContructor(referenceType + Salt, MinLength, Alphabet);
    return BigInt(hashIds.decode(id)[0]);
}

function encode(referenceType: ReferenceType, id: bigint): string {
    let hashIds = new HashIdsContructor(referenceType + Salt, MinLength, Alphabet);
    return hashIds.encode(id);
}

function validate(referenceType: ReferenceType, id: string): boolean {
    let hashIds = new HashIdsContructor(referenceType + Salt, MinLength, Alphabet);
    let decode = hashIds.decode(id)[0];
    if (decode === undefined) return false;
    else return true;
}

export const Minify = {
    decode,
    encode,
    validate,
}