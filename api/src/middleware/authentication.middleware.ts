import { Middleware } from "lambda-api";

export type Authentication = {
    id: bigint,
}

export const AuthenticationMiddleware = (): Middleware => {
    return async (request, response, next) => {
        return next();
    }
};