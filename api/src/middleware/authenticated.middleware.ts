import { Middleware } from "lambda-api";

export const AuthenticatedMiddleware = (): Middleware => {
    return async (request, response, next) => {
        return next();
    }
};