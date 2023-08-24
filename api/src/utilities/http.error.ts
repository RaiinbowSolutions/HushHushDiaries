export class HTTPError extends Error {
    code: number = 500;

    constructor(code: number, message: string | undefined = undefined) {
        super(message);
        this.code = code;
        
        switch(code) {
            case 400: this.name = 'Bad Request'; break;
            case 401: this.name = 'Unauthorized'; break;
            case 403: this.name = 'Forbidden'; break;
            case 404: this.name = 'Not Found'; break;
            case 405: this.name = 'Method Not Allowed'; break;
            case 500: this.name = 'Internal Server Error'; break;
        }
    }
}

export const BadRequestError = (message: string | undefined = undefined) => {
    return new HTTPError(400, message);
}

export const UnauthorizedError = (message: string | undefined = undefined) => {
    return new HTTPError(401, message);
}

export const ForbiddenError = (message: string | undefined = undefined) => {
    return new HTTPError(403, message);
}

export const NotFoundError = (message: string | undefined = undefined) => {
    return new HTTPError(404, message);
}

export const MethodNotAllowedError = (message: string | undefined = undefined) => {
    return new HTTPError(405, message);
}

export const InternalServerError = (message: string | undefined = undefined) => {
    return new HTTPError(500, message);
}