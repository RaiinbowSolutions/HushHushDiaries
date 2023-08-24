import 'dotenv/config';
import { Request } from "lambda-api";
import HashIdsContructor from 'hashids';

const Salt = process.env.HASH_ID_SALT || undefined;
const MinLength = Number(process.env.HASH_ID_MIN_LENGTH) || 8;
const Alphabet = process.env.HASH_ID_ALPHABET || undefined;
const HashIds = new HashIdsContructor(Salt, MinLength, Alphabet);
const DefaultPaginationLimit = Number(process.env.DEFAULT_PAGINATION_LIMIT) || 50;
const EmailValidationRegex = process.env.EMAIL_REGEX ? RegExp(process.env.EMAIL_REGEX) : /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

function validatePagination(request: Request) {
    let queryPage = Number(request.query.page);
    let queryLimit = Number(request.query.limit);

    let page = queryPage != Number.NaN ? queryPage : 1;
    let limit = queryLimit != Number.NaN ? queryLimit : DefaultPaginationLimit;
    let offset = page - 1 * limit;

    return {
        limit,
        offset,
    }
}

function validateId(request: Request) {
    let id = request.params.id || '';
    let valid = HashIds.isValidId(id);

    if (!valid) throw new Error(); // Needs a better error definition
    return HashIds.decode(id)[0] as bigint;
}

function validateEmail(request: Request) {
    let email = request.params.email || '';
    let valid = EmailValidationRegex.test(email);
    
    if (!valid) throw new Error(); // Needs a better error definition
    return email;
}

export const Validation = {
    pagination: validatePagination,
    id: validateId,
    email: validateEmail,
}