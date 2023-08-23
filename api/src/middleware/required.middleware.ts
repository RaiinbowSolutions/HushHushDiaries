import { Middleware } from "lambda-api";

export const RequiredMiddleware = (): Middleware => {
    return async (request, response, next) => {
        return next();
    }
};