import { Middleware } from "lambda-api";
import { Authentication } from "./authentication.middleware";
import { UnauthorizedError } from "./error.middleware";

export const AuthenticatedMiddleware = (): Middleware => {
    return async (request, response, next) => {
        let failed = true;

        if ('authentication' in request) {
            let authentication: Authentication = request.authentication;
            if (authentication.authenticated) failed = false;
        }

        if (failed) throw new UnauthorizedError('Given URI require an authenticated connection');
        return next();
    }
};