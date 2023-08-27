import 'dotenv/config';

const EmailValidationRegex = process.env.EMAIL_REGEX ? RegExp(process.env.EMAIL_REGEX) : /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

function validateEmail(email: string): boolean {
    return EmailValidationRegex.test(email);
}

export const Validation = {
    email: validateEmail,
}