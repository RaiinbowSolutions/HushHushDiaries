import { Middleware } from "lambda-api";

export const AuthorizationMiddleware = (): Middleware => {
    return async (request, response, next) => {
        return next();
    }
};