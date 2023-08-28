import { Middleware } from "lambda-api";
import { Authentication } from "./authentication.middleware";
import { UnauthorizedError } from "./error.middleware";

export const AuthenticatedMiddleware = (): Middleware => {
    return async (request, response, next) => {
        let authentication: Authentication = request.authentication;

        if (!authentication.authenticated) throw new UnauthorizedError('Given URI require an authenticated connection');
        if (authentication.banned) throw new UnauthorizedError('This user is banned');
        if (authentication.deleted) throw new UnauthorizedError('This user is deleted');

        return next();
    }
};