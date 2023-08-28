import { API, RegisterOptions, Request, Response } from "lambda-api";
import { AuthenticatedMiddleware as Authenticated } from '../middleware/authenticated.middleware';
import { BlogService } from "../services/blog.service";
import { Authentication } from "../middleware/authentication.middleware";
import { ValidateMiddleware } from "../middleware/validate.middleware";
import { Pagination } from "../utilities/pagination";
import { Minify } from "../utilities/minify";
import { NotFoundError } from "../middleware/error.middleware";

export const BlogRoute = (api: API, options: RegisterOptions | undefined) => {
    const Prefix = options?.prefix || '';
    const BaseURI = '/blogs';

    /**
     * @alias BlogRoute_GetCounts
     */
    api.get(Prefix + BaseURI + '/counts', 
        Authenticated(), 
        async (request: Request, response: Response) => {
            let counts = await BlogService.counts();
            return response.status(200).json({type: 'blog', counts});
        }
    );

    /**
     * @alias BlogRoute_GetBlogs
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
            let total = await BlogService.counts();
            let blogs = await BlogService.selects(offset, limit);
            let filtered = await BlogService.filters.blogs(authentication.id, blogs);
            let pagination = Pagination.create(request, filtered, total);

            return response.status(200).json(pagination);
        }
    );

    /**
     * @alias BlogRoute_GetBlog
     */
    api.get(Prefix + BaseURI + '/:[id]',
        ValidateMiddleware('params', { 'id': 'string' }),
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;

            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');
            let id = Minify.decode('blogs', request.params.id as string);
            let blog = await BlogService.select(id);
            let filtered = await BlogService.filters.blog(authentication.id, blog);

            return response.status(200).json(filtered);
        }
    );

    /**
     * @alias BlogRoute_CreateBlog
     */
    api.post(Prefix + BaseURI, 
        ValidateMiddleware('body', {
            'title': 'string',
            'content': 'string',
        }),
        Authenticated(),
        async(request: Request, response: Response) => {
            let title = request.body.title as string; 
            let content = request.body.content as string; 
            let id = Minify.encode('blogs', request.insertId as bigint);

            return response.status(201).json({
                created: true, 
                id, 
                path: `${request.path}/${id}`,
            });
        }
    );

    /**
     * @alias BlogRoute_UpdateBlog
     */
    api.post(Prefix + BaseURI + '/:[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');

            let id = Minify.decode('blogs', request.params.id as string);
            let title = request.body.title as string;
            let content = request.body.content as string;

            let result = await BlogService.update(id, {
                title, 
                content,
            });

            return response.status(200).json({
                updated: true, 
                updated_rows: result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias BlogRoute_DeactivateBlog
     */
    api.post(Prefix + BaseURI + '/deactivate/:[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');

            let id = Minify.decode('blogs', request.params.id as string);
            let result = await BlogService.markAsDeleted(id);

            return response.status(204).json({
                deactivated: true, 
                deactivated_rows: result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias BlogRoute_DeleteBlog
     */
    api.delete(Prefix + BaseURI + '/:[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');

            let id = Minify.decode('blogs', request.params.id as string);
            let result = await BlogService.delete(id);

            return response.status(204).json({
                deleted: true, 
                deleted_rows: result.numDeletedRows,
            });
        }
    );

    /**
     * @alias BlogRoute_ApproveBlog
     */
    api.post(Prefix + BaseURI + '/approve/:[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');

            let id = Minify.decode('blogs', request.params.id as string);
            let result = await BlogService.markAsApproved(id);

            return response.status(204).json({
                approved: true, 
                approved_rows: result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias BlogRoute_PublishBlog
     */
    api.post(Prefix + BaseURI + '/publish/:[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');

            let id = Minify.decode('blogs', request.params.id as string);
            let result = await BlogService.markAsPublished(id);

            return response.status(204).json({
                published: true, 
                published_rows: result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias BlogRoute_UnpublishBlog
     */
    api.post(Prefix + BaseURI + '/publish/:[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');

            let id = Minify.decode('blogs', request.params.id as string);
            let result = await BlogService.markAsPublished(id);

            return response.status(204).json({
                unpublished: true, 
                unpublished_rows: result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias BlogRoute_LikeCountOnBlog
     */
    api.get(Prefix + BaseURI + '/likes/count/:[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');

            let id = Minify.decode('blogs', request.params.id as string);
            let countLikes = await BlogService.countLikes(id);

            return response.status(200).json({
                countLikes: true,
            });
        }
    );

    /**
     * @alias BlogRoute_LikeOnBlog
     */
    api.get(Prefix + BaseURI + '/likes/count/:[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');
            
            let id = Minify.decode('blogs', request.params.id as string);
        }
    );

    /**
     * @alias BlogRoute_UnlikeOnBlog
     */
    api.delete(Prefix + BaseURI + '/likes/count/:[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');
         
            let id = Minify.decode('blogs', request.params.id as string);
        }
    );

    /**
     * @alias BlogRoute_OwnedListOverBlogs
     */
    api.get(Prefix + BaseURI,
        ValidateMiddleware('query', {
            'page': {type: 'number', required: false},
            'limit': {type: 'number', required: false},
        }),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');
            let id = Minify.decode('blogs', request.params.id as string);

            let authentication: Authentication = request.authentication;
            let {limit, offset} = Pagination.getData(request);
            
        }
    );
}