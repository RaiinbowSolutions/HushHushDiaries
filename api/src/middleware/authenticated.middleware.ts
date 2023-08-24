import { Middleware } from "lambda-api";
import { UnauthorizedError } from "../utilities/http.error";

export const AuthenticatedMiddleware = (): Middleware => {
    return async (request, response, next) => {
        if ('authentication' in request && request.authentication.authenticated == true) return next();
        throw UnauthorizedError();
    }
};