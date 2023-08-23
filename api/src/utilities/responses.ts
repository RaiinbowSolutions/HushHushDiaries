import { Request, Response } from "lambda-api";

const DefaultPaginationLimit = Number(process.env.DEFAULT_PAGINATION_LIMIT) || 50;

export const CreatePaginationDataResponse = <T>(request: Request, response: Response, data: T[], total: number | bigint) => {
    let queryPage = Number(request.query.page);
    let queryLimit = Number(request.query.limit);

    let page = queryPage != Number.NaN ? queryPage : 1;
    let limit = queryLimit != Number.NaN ? queryLimit : DefaultPaginationLimit;
    let next = '';
    let previus = '';
    let count = data.length;

    if (page > 1) previus = `${request.path}?page=${page}&limit=${limit}`;
    if (total > limit + count) next = `${request.path}?page=${page + 1}&count=${limit}`;

    return response.status(200).json({
        count,
        data,
        next,
        previus
    });
}

export const CreateDataResponse = <T>(request: Request, response: Response, data: T) => {
    return response.status(200).json(data);
}