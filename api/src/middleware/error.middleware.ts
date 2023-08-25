import { ErrorHandlingMiddleware } from "lambda-api";

export class BadRequestError extends Error {
    constructor(message: string | undefined = undefined) {
        super(message);
        this.name = 'Bad Request';
    }
}

export class UnauthorizedError extends Error {
    constructor(message: string | undefined = undefined) {
        super(message);
        this.name = 'Unauthorized';
    }
}

export class ForbiddenError extends Error {
    constructor(message: string | undefined = undefined) {
        super(message);
        this.name = 'Forbidden';
    }
}

export class NotFoundError extends Error {
    constructor(message: string | undefined = undefined) {
        super(message);
        this.name = 'Not Found';
    }
}

export class InternalError extends Error {
    constructor(message: string | undefined = undefined) {
        super(message);
        this.name = 'Internal';
    }
}

export class UnavailableError extends Error {
    constructor(message: string | undefined = undefined) {
        super(message);
        this.name = 'Unavailable';
    }
}

export const ErrorMiddleware = (): ErrorHandlingMiddleware => {
    return async (error, request, response, next) => {
        let code = 500;
        let message = error.message;
        let name = error.name;

        switch(name) {
            case 'Bad Request': code = 400; break;
            case 'Unauthorized': code = 401; break;
            case 'Forbidden': code = 403; break;
            case 'Not Found': code = 404; break;
            case 'Unavailable': code = 503; break;
        }

        console.info('Request from', request.ip+':', '['+name+']', message);
        if (code >= 500) console.error(error);

        return response.error(code, message);
    }
};