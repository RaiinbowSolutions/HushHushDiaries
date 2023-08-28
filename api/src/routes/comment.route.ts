import { API, RegisterOptions, Request, Response } from "lambda-api";
import { AuthenticatedMiddleware as Authenticated } from "../middleware/authenticated.middleware";
import { CommentService } from "../services/comment.service";
import { Authentication } from "../middleware/authentication.middleware";
import { ValidateMiddleware } from "../middleware/validate.middleware";
import { Pagination } from "../utilities/pagination";
import { Minify } from "../utilities/minify";
import { NotFoundError } from "../middleware/error.middleware";
import { LikeService } from "../services/like.service";

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
    api.post(Prefix + BaseURI, 
        ValidateMiddleware('body', {
            'content': 'string'
        }),
        Authenticated(),
        async(request: Request, response: Response) => {
            let content = request.body.content as string;
            let id = Minify.encode('comments', request.insertId as bigint);

            return response.status(201).json({
                created: true, 
                id, 
                path: `${request.path}/${id}`,
            });
        }
    );

    /**
     * @alias CommentRoute_UpdateComment
     */
    api.patch(Prefix + BaseURI + '/:[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('comments', request.params.id as string)) throw new NotFoundError('Comment not found');

            let id = Minify.decode('comments', request.params.id as string);
            let content = request.body.content as string;

            let result = await CommentService.update(id, {
                content,
            });

            return response.status(200).json({
                updated: true, 
                updated_rows: result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias CommentRoute_DeactivateComment
     */
    api.post(Prefix + BaseURI + '/deactivate/:[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('comments', request.params.id as string)) throw new NotFoundError('Comment not found');

            let id = Minify.decode('comments', request.params.id as string);
            let result = await CommentService.markAsDeleted(id);

            return response.status(204).json({
                deactivated: true, 
                deactivated_rows: result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias CommentRoute_DeleteComment
     */
    api.delete(Prefix + BaseURI + '/:[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('comments', request.params.id as string)) throw new NotFoundError('Comment not found');
            
            let id = Minify.decode('comments', request.params.id as string);
            let result = await CommentService.delete(id);

            return response.status(204).json({
                deleted: true, 
                deleted_rows: result.numDeletedRows,
            });
        }
    );

    /**
     * @alias CommentRoute_ApproveComment
     */
    api.post(Prefix + BaseURI + '/approve/:[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('comments', request.params.id as string)) throw new NotFoundError('Comment not found');

            let id = Minify.decode('comments', request.params.id as string);
            let result = await CommentService.markAsApproved(id);

            return response.status(204).json({
                approved: true, 
                approved_rows: result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias CommentRoute_ReviewComment
     */
    api.post(Prefix + BaseURI + '/review/:[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('comments', request.params.id as string)) throw new NotFoundError('Comment not found');

            let id = Minify.decode('comments', request.params.id as string);
            let result = await CommentService.markAsReviewed(id);

            return response.status(204).json({
                reviewed: true, 
                reviewed_rows: result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias CommentRoute_CommentLikeCount
     */
    api.get(Prefix + BaseURI + '/likes/count/:[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('comments', request.params.id as string)) throw new NotFoundError('Comment not found');

            let id = Minify.decode('comments', request.params.id as string);
            let countLikes = await CommentService.countLikes(id);

            return response.status(200).json(countLikes);
        }
    );

    /**
     * @alias CommentRoute_LikeOnComment
     */
    api.post(Prefix + BaseURI + '/likes/:[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;
            if (!Minify.validate('comments', request.params.id as string)) throw new NotFoundError('Comment not found');

            let id = Minify.decode('comments', request.params.id as string);
            let result = await LikeService.insert(authentication.id, 'comment', id);

            return response.status(204).json({
                commentLiked: true, 
            });
        }
    );

    /**
     * @alias CommentRoute_UnlikeOnComment
     */
    api.delete(Prefix + BaseURI + '/likes/:[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('comments', request.params.id as string)) throw new NotFoundError('Comment not found');

            let id = Minify.decode('comments', request.params.id as string);
            let result = await LikeService.delete(id);

            return response.status(204).json({
                commentUnliked: true,
                commentUnliked_rows: result.numDeletedRows, 
            });
        }
    );
}