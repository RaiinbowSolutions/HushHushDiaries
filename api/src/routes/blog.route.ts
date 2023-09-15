import { API, RegisterOptions, Request, Response } from "lambda-api";
import { AuthenticatedMiddleware as Authenticated } from '../middleware/authenticated.middleware';
import { BlogService } from "../services/blog.service";
import { Authentication } from "../middleware/authentication.middleware";
import { ValidateMiddleware } from "../middleware/validate.middleware";
import { Pagination } from "../utilities/pagination";
import { Minify } from "../utilities/minify";
import { NotFoundError } from "../middleware/error.middleware";
import { RequiredMiddleware, SpecialPermission } from "../middleware/required.middleware";

const AllowOwner = SpecialPermission.AllowOwner;

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
            page: { type: 'number', required: false },
            limit: { type: 'number', required: false },
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
    api.get(Prefix + BaseURI + '/:id',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        async (request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');

            let authentication: Authentication = request.authentication;
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
            title: 'string',
            keywords: { type: 'string', required: false },
            description: { type: 'string', required: false },
            content: 'string',
            category_id: 'string',
            author_id: 'string',
        }),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('categories', request.params.category_id as string)) throw new NotFoundError(`Given 'category_id' is not an valid category`);
            if (!Minify.validate('users', request.params.author_id as string)) throw new NotFoundError(`Given 'author_id' is not an valid user`);

            let title = request.body.title as string;
            let keywords = request.body.keywords as string | undefined;
            let description = request.body.description as string | undefined;
            let content = request.body.content as string; 
            let category_id = Minify.decode('categories', request.body.category_id as string);
            let author_id = Minify.decode('users', request.body.author_id as string);
            let result = await BlogService.insert(author_id, title, content, category_id, keywords, description);
            let id = Minify.encode('blogs', result.insertId as bigint);

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
    api.post(Prefix + BaseURI + '/:id',
        ValidateMiddleware('params', { id: 'string' }),
        ValidateMiddleware('body', {
            title: { type: 'string', required: false },
            keywords: { type: 'string', required: false },
            description: { type: 'string', required: false },
            content: { type: 'string', required: false },
            category_id: { type: 'string', required: false },
            author_id: { type: 'string', required: false },
        }),
        Authenticated(),
        RequiredMiddleware('blogs', AllowOwner, 'update-blog'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');

            let id = Minify.decode('blogs', request.params.id as string);
            let title = request.body.title as string | undefined;
            let keywords = request.body.keywords as string | undefined;
            let description = request.body.description as string | undefined;
            let content = request.body.content as string | undefined; 
            let category_id = request.body.category_id ? Minify.decode('categories', request.body.category_id as string) : undefined;
            let author_id = request.body.author_id ? Minify.decode('users', request.body.author_id as string) : undefined;
            let result = await BlogService.update(id, {
                title, 
                keywords,
                description,
                content,
                category_id,
                author_id,
            });

            return response.status(204).json({
                updated: true, 
                updated_rows: '' + result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias BlogRoute_DeleteBlog
     */
    api.delete(Prefix + BaseURI + '/:id',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware(undefined, 'delete-blog'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');

            let id = Minify.decode('blogs', request.params.id as string);
            let result = await BlogService.delete(id);

            return response.status(204).json({
                deleted: true, 
                deleted_rows: '' + result.numDeletedRows,
            });
        }
    );

    /**
     * @alias BlogRoute_DeactivateBlog
     */
    api.post(Prefix + BaseURI + '/:id/deactivate',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware('blogs', AllowOwner, 'deactivate-blog'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');

            let id = Minify.decode('blogs', request.params.id as string);
            let result = await BlogService.markAsDeleted(id);

            return response.status(204).json({
                deactivated: true, 
                deactivated_rows: '' + result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias BlogRoute_ApproveBlog
     */
    api.post(Prefix + BaseURI + '/:id/approve',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware(undefined, 'approve-blog'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');

            let id = Minify.decode('blogs', request.params.id as string);
            let result = await BlogService.markAsApproved(id);

            return response.status(204).json({
                approved: true, 
                approved_rows: '' + result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias BlogRoute_PublishBlog
     */
    api.post(Prefix + BaseURI + '/:id/publish',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware('blogs', AllowOwner, 'publish-blog'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');

            let id = Minify.decode('blogs', request.params.id as string);
            let result = await BlogService.markAsPublished(id);

            return response.status(204).json({
                published: true, 
                published_rows: '' + result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias BlogRoute_UnpublishBlog
     */
    api.post(Prefix + BaseURI + '/:id/publish',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware('blogs', AllowOwner, 'unpublish-blog'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');

            let id = Minify.decode('blogs', request.params.id as string);
            let result = await BlogService.markAsUnpublished(id);

            return response.status(204).json({
                unpublished: true, 
                unpublished_rows: '' + result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias BlogRoute_LikeCounts
     */
    api.get(Prefix + BaseURI + '/:id/likes/counts',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');

            let id = Minify.decode('blogs', request.params.id as string);
            let counts = await BlogService.likes.counts(id);

            return response.status(200).json({type: 'like', counts});
        }
    );

    /**
     * @alias BlogRoute_AddLike
     */
    api.post(Prefix + BaseURI + '/:id/likes',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');
            
            let id = Minify.decode('blogs', request.params.id as string);
            let authentication: Authentication = request.authentication;
            let result = await BlogService.likes.add(authentication.id, id);

            return response.status(204).json({
                created: 'insertId' in result,
            });
        }
    );

    /**
     * @alias BlogRoute_RemoveLike
     */
    api.delete(Prefix + BaseURI + '/:id/likes',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware('blogs/likes', AllowOwner, 'remove-blog-like'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('blogs', request.params.id as string)) throw new NotFoundError('Blog not found');
         
            let id = Minify.decode('blogs', request.params.id as string);
            let authentication: Authentication = request.authentication;
            let result = await BlogService.likes.remove(authentication.id, id);

            return response.status(204).json({
                removed: result.numUpdatedRows > 0,
            });
        }
    );

    /**
     * @alias BlogRoute_OwnedBlogs
     */
    api.get(Prefix + BaseURI + '/:id/owned',
        ValidateMiddleware('params', { id: 'string' }),
        ValidateMiddleware('query', {
            page: {type: 'number', required: false},
            limit: {type: 'number', required: false},
        }),
        Authenticated(),
        RequiredMiddleware('blogs/owned', AllowOwner, 'view-blog'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');
         
            let id = Minify.decode('users', request.params.id as string);
            let authentication: Authentication = request.authentication;
            let {limit, offset} = Pagination.getData(request);
            let total = await BlogService.owned.counts(id);
            let blogs = await BlogService.owned.selects(id, offset, limit);
            let filtered = await BlogService.filters.blogs(authentication.id, blogs);
            let pagination = Pagination.create(request, filtered, total);

            return response.status(200).json(pagination);
        }
    );
}