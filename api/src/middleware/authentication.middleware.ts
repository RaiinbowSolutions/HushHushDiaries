import { Middleware } from "lambda-api";

export const AuthenticationMiddleware = (): Middleware => {
    return async (request, response, next) => {
        return next();
    }
};