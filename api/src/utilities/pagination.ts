import 'dotenv/config';
import { Request } from "lambda-api";

const DefaultPaginationLimit = Number(process.env.DEFAULT_PAGINATION_LIMIT) || 50;

function getNumberOrDefault(value: string | undefined, or: number): number {
    let number: number = Number(value);
    if (Number.isNaN(number)) return or;
    else return number;
}

function getPaginationData(request: Request) {
    let page = getNumberOrDefault(request.query.page, 1);
    let limit = getNumberOrDefault(request.query.limit, DefaultPaginationLimit);

    if (page < 1) page = 1;
    if (limit < 1) limit = 1;

    let offset = page - 1 * limit;

    return {
        page,
        limit,
        offset,
    }
}

function createPagination<T>(request: Request, data: T[], total: number | bigint | undefined = undefined) {
    let {page, limit, offset} = getPaginationData(request);
    let length = data.length;
    let next = '';
    let previus = '';

    if (total === undefined) total = limit + length + 1;
    if (offset > 0) previus = `${request.path}?page=${page}&limit=${limit}`;
    if (total > limit + length) next = `${request.path}?page=${page + 1}&count=${limit}`;

    return {
        page,
        length,
        data,
        next,
        previus
    }
}

export const Pagination = {
    getData: getPaginationData,
    create: createPagination,
}