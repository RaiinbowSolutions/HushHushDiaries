import { ErrorHandlingMiddleware, Middleware } from "lambda-api";
import { HTTPError, UnauthorizedError } from "../utilities/http.error";

const IsHTTPError = (error: Error): error is HTTPError => {
    return 'code' in error;
}

export const ErrorMiddleware = (): ErrorHandlingMiddleware => {
    return async (error, request, response, next) => {
        if (IsHTTPError(error)) return response.error(error.code, error.message);
        return response.error(500, error.message);
    }
};