import { API, RegisterOptions, Request, Response } from "lambda-api";
import { AuthenticatedMiddleware as Authenticated } from "../middleware/authenticated.middleware";
import { CategoryService } from "../services/category.service";
import { Authentication } from '../middleware/authentication.middleware';
import { ValidateMiddleware } from "../middleware/validate.middleware";
import { Pagination } from "../utilities/pagination";
import { Minify } from "../utilities/minify";
import { NotFoundError } from "../middleware/error.middleware";

export const CategoryRoute = (api: API, options: RegisterOptions | undefined) => {
    const Prefix = options?.prefix || '';
    const BaseURI = '/categories';

    /**
     * @alias CategoryRoute_GetCounts
     */
    api.get(Prefix + BaseURI + '/counts',
        Authenticated(), 
        async (request: Request, response: Response) => {
            let counts = await CategoryService.counts();

            return response.status(200).json({type: 'category', counts});
        }
    );
    
    /**
     * @alias CategoryRoute_GetCategories
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
            let total = await CategoryService.counts();
            let categories = await CategoryService.selects(offset, limit);
            let filtered = await CategoryService.filters.categories(authentication.id, categories);
            let pagination = Pagination.create(request, filtered, total);

            return response.status(200).json(pagination);
        }
    );

    /**
     * @alias CategoryRoute_GetCategory
     */
    api.get(Prefix + BaseURI + '/[id]',
        ValidateMiddleware('params', { 'id': 'string' }),
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Category not found');
            let id = Minify.decode(request.params.id as string);
            let category = await CategoryService.select(id);
            let filtered = await CategoryService.filters.category(authentication.id, category);

            return response.status(200).json(filtered);
        }
    );

    /**
     * @alias CategoryRoute_CreateCategory
     */
    api.post(Prefix + BaseURI,
        ValidateMiddleware('body', {
            'name': 'string',
        }),
        Authenticated(),
        async(request: Request, response: Response) => {
            let name = request.body.name as string; 
            let description = request.body.description as string;
            let result = await CategoryService.insert(name, description);
            let id = Minify.encode(result.insertId as bigint);

            return response.status(201).json({
                created: true, 
                id, 
                path: `${request.path}/${id}`,
            });
        }
    );

    /**
     * @alias CategoryRoute_UpdateCategory
     */
    api.patch(Prefix + BaseURI + '/[id]',
        ValidateMiddleware('params', {id: 'string'}),
        ValidateMiddleware('body', {
            'name': 'string'
        }),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Category not found');

            let id = Minify.decode(request.params.id as string);
            let name = request.body.name as string;
            let description = request.body.description as string;

            let result = await CategoryService.update(id, {
                name,
                description,
            });

            return response.status(200).json({
                updated: true,
                updated_rows: '' + result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias CategoryRoute_DeactivateCategory
     */
    api.post(Prefix + BaseURI + '/deactivate/[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Category not found');

            let id = Minify.decode(request.params.id as string);
            let result = await CategoryService.markAsDeleted(id);

            return response.status(204).json({
                deactivated: true, 
                deactivated_rows: result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias CategoryRoute_DeleteCategory
     */
    api.delete(Prefix + BaseURI + '/[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Category not found');

            let id = Minify.decode(request.params.id as string);
            let result = await CategoryService.delete(id);

            return response.status(204).json({
                deleted: true, 
                deleted_rows: result.numDeletedRows,
            });
        }
    );
}