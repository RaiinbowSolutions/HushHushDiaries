import { API, RegisterOptions, Request, Response } from "lambda-api";
import { AuthenticatedMiddleware as Authenticated } from "../middleware/authenticated.middleware";
import { CommentService } from "../services/comment.service";
import { Authentication } from "../middleware/authentication.middleware";
import { ValidateMiddleware } from "../middleware/validate.middleware";
import { Pagination } from "../utilities/pagination";
import { Minify } from "../utilities/minify";
import { NotFoundError } from "../middleware/error.middleware";

export const CommentRoute = (api: API, options: RegisterOptions | undefined) => {
    const Prefix = options?.prefix || '';
    const BaseURI = '/comments';

    /**
     * @alias CommentRoute_GetCounts
     */
    api.get(Prefix + BaseURI + '/comments',
        Authenticated(),
        async (request: Request, response: Response) => {
            let counts = await CommentService.counts();

            return response.status(200).json({type: 'comments', counts});
        }
    );

    /**
     * @alias CommentRoute_GetComments
     */
    api.get(Prefix + BaseURI,
        ValidateMiddleware('query', {
            'page': { type: 'number', required: false },
            'limit': { type: 'number', required: false },
        }),
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;
            let {limit, offset} = Pagination.getData(request);
            let total = await CommentService.counts();
            let comments = await CommentService.selects(offset, limit);
            let filtered = await CommentService.filters.comments(authentication.id, comments);

            let pagination = Pagination.create(request, filtered, total);

            return response.status(200).json(pagination);
        }
    );

    /**
     * @alias CommentRoute_GetComment
     */
    api.get(Prefix + BaseURI + '/:[id]',
        ValidateMiddleware('params', { 'id': 'string' }),
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;

            if (!Minify.validate('comments', request.params.id as string)) throw new NotFoundError('Comment not found');
            let id = Minify.decode('comments', request.params.id as string);
            let comment = await CommentService.select(id);
            let filtered = await CommentService.filters.comment(authentication.id, comment);

            return response.status(200).json(filtered);
        }
    );
    
    /**
     * @alias CommentRoute_CreateComment
     */
    
}