import { Middleware } from "lambda-api";

export const AuthenticatedMiddleware = (): Middleware => {
    return async (request, response, next) => {
        if ('authentication' in request && request.authentication.authenticated == true) return next();
        throw new Error(); // Needs a better error definition
    }
};