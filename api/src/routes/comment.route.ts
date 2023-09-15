import { API, RegisterOptions, Request, Response } from "lambda-api";
import { AuthenticatedMiddleware as Authenticated } from "../middleware/authenticated.middleware";
import { CommentService } from "../services/comment.service";
import { Authentication } from "../middleware/authentication.middleware";
import { ValidateMiddleware } from "../middleware/validate.middleware";
import { Pagination } from "../utilities/pagination";
import { Minify } from "../utilities/minify";
import { NotFoundError } from "../middleware/error.middleware";
import { CreateComment } from "../models/comment.model";
import { RequiredMiddleware, SpecialPermission } from "../middleware/required.middleware";

const AllowOwner = SpecialPermission.AllowOwner;

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

            return response.status(200).json({type: 'comment', counts});
        }
    );

    /**
     * @alias CommentRoute_GetComments
     */
    api.get(Prefix + BaseURI,
        ValidateMiddleware('query', {
            page: { type: 'number', required: false },
            limit: { type: 'number', required: false },
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
    api.get(Prefix + BaseURI + '/:id',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        async (request: Request, response: Response) => {
            if (!Minify.validate('comments', request.params.id as string)) throw new NotFoundError('Comment not found');

            let id = Minify.decode('comments', request.params.id as string);
            let authentication: Authentication = request.authentication;
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
            content: 'string',
            refecence_type: 'string',
            refecence_id: 'string',
        }),
        Authenticated(),
        async(request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;
            let content = request.body.content as string;
            let refecence_type = request.body.content as CreateComment['refecence_type'];
            let refecence_id = Minify.decode(refecence_type === 'blog' ? 'blogs' : 'comments', request.body.content as string);
            let result = await CommentService.insert(authentication.id, content, refecence_type, refecence_id);
            let id = Minify.encode('comments', result.insertId as bigint);

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
    api.patch(Prefix + BaseURI + '/:id',
        ValidateMiddleware('params', { id: 'string' }),
        ValidateMiddleware('body', {
            content: 'string',
        }),
        Authenticated(),
        RequiredMiddleware('comments', AllowOwner, 'update-comment'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('comments', request.params.id as string)) throw new NotFoundError('Comment not found');

            let id = Minify.decode('comments', request.params.id as string);
            let content = request.body.content as string;
            let result = await CommentService.update(id, {
                content,
            });

            return response.status(204).json({
                updated: true, 
                updated_rows: '' + result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias CommentRoute_DeleteComment
     */
    api.delete(Prefix + BaseURI + '/:id',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware(undefined, 'delete-comment'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('comments', request.params.id as string)) throw new NotFoundError('Comment not found');
            
            let id = Minify.decode('comments', request.params.id as string);
            let result = await CommentService.delete(id);

            return response.status(204).json({
                deleted: true, 
                deleted_rows: '' + result.numDeletedRows,
            });
        }
    );

    /**
     * @alias CommentRoute_DeactivateComment
     */
    api.post(Prefix + BaseURI + '/:id/deactivate',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware('comments', AllowOwner, 'deactivate-comment'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('comments', request.params.id as string)) throw new NotFoundError('Comment not found');

            let id = Minify.decode('comments', request.params.id as string);
            let result = await CommentService.markAsDeleted(id);

            return response.status(204).json({
                deactivated: true, 
                deactivated_rows: '' + result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias CommentRoute_ApproveComment
     */
    api.post(Prefix + BaseURI + '/:id/approve',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware(undefined, 'approve-comment'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('comments', request.params.id as string)) throw new NotFoundError('Comment not found');

            let id = Minify.decode('comments', request.params.id as string);
            let result = await CommentService.markAsApproved(id);

            return response.status(204).json({
                approved: true, 
                approved_rows: '' + result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias CommentRoute_ReviewComment
     */
    api.post(Prefix + BaseURI + '/:id/review',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware(undefined, 'review-comment'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('comments', request.params.id as string)) throw new NotFoundError('Comment not found');

            let id = Minify.decode('comments', request.params.id as string);
            let result = await CommentService.markAsReviewed(id);

            return response.status(204).json({
                reviewed: true, 
                reviewed_rows: '' + result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias CommentRoute_LikeCounts
     */
    api.get(Prefix + BaseURI + '/:id/likes/counts',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('comments', request.params.id as string)) throw new NotFoundError('Comment not found');

            let id = Minify.decode('comments', request.params.id as string);
            let counts = await CommentService.likes.counts(id);

            return response.status(200).json({type: 'like', counts});
        }
    );

    /**
     * @alias CommentRoute_AddLike
     */
    api.post(Prefix + BaseURI + '/:id/likes',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('comments', request.params.id as string)) throw new NotFoundError('Comment not found');

            let id = Minify.decode('comments', request.params.id as string);
            let authentication: Authentication = request.authentication;
            let result = await CommentService.likes.add(authentication.id, id);

            return response.status(204).json({
                created: 'insertId' in result, 
            });
        }
    );

    /**
     * @alias CommentRoute_RemoveLike
     */
    api.delete(Prefix + BaseURI + '/:id/likes',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware('comments/likes', AllowOwner, 'remove-comment-like'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('comments', request.params.id as string)) throw new NotFoundError('Comment not found');

            let id = Minify.decode('comments', request.params.id as string);
            let authentication: Authentication = request.authentication;
            let result = await CommentService.likes.remove(authentication.id, id);

            return response.status(204).json({
                removed: result.numUpdatedRows > 0,
            });
        }
    );
}