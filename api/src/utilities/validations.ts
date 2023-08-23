import 'dotenv/config';
import { Request } from "lambda-api";

const DefaultPaginationLimit = Number(process.env.DEFAULT_PAGINATION_LIMIT) || 50;

function validatePagination(request: Request) {
    let queryPage = Number(request.query.page);
    let queryLimit = Number(request.query.limit);

    let page = queryPage != Number.NaN ? queryPage : 1;
    let limit = queryLimit != Number.NaN ? queryLimit : DefaultPaginationLimit;
    let offset = page - 1 * limit;

    return {
        limit,
        offset,
    }
}

function validateId(request: Request) {
    let paramId = request.params.id;

    let id = BigInt(0);

    return id;
}

function validateEmail(request: Request) {
    let paramEmail = request.params.email;

    let email = '';

    return email;
}

export const Validate = {
    pagination: validatePagination,
    id: validateId,
    email: validateEmail,
}