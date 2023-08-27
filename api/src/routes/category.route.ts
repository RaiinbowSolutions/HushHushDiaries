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

    api.get(Prefix + BaseURI + '/counts',
        Authenticated(), 
        async (request: Request, response: Response) => {
            let counts = await CategoryService.counts();
            return response.status(200).json({type: 'category', counts});
        }
    );

    api.get(Prefix + BaseURI,
        ValidateMiddleware('query', {
            'page': { type: 'number', required: false },
            'limit': { type: 'number', required: false },
        }),
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;
            let {limit, offset} = Pagination.getData(request);

            try {
                let total = await CategoryService.counts();
                let categories = await CategoryService.selects(offset, limit);
                let filtered = await CategoryService.filters.categories(authentication.id, categories);
    
                let pagination = Pagination.create(request, filtered, total);
    
                return response.status(200).json(pagination);
            } catch (error) {}
        }
    );

    api.get(Prefix + BaseURI + '/[id]',
        ValidateMiddleware('params', { 'id': 'string' }),
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Category not found');
            let id = Minify.decode(request.params.id as string);

            try {
                let category = await CategoryService.select(id);
                let filtered = await CategoryService.filters.category(authentication.id, category);

                return response.status(200).json(filtered);
            } catch (error) {
                throw new NotFoundError('Category not found');
            }
        }
    );

    api.post(Prefix + BaseURI, 
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;

            try {

                return response.status(201).json;
            }
            catch {
                throw new NotFoundError('Category not created');
            }
        }
    ); 

    api.patch(Prefix + BaseURI + '/[id]',
        ValidateMiddleware('params', { 'id': 'string' }),
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication; 

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Category not found');
            let id = Minify.decode(request.params.id as string);

            try {

                return response.status(204).json;
            }
            catch {
                throw new NotFoundError('Category not updated');
            }
        }
    );

    api.post(Prefix + BaseURI + '/deactivate/[id',
        ValidateMiddleware('params', { 'id': 'string' }),
        Authenticated(),
        async (request: Request, response: Response) => 
        {
            let authentication: Authentication = request.authentication;

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Category not found');
            let id = Minify.decode(request.params.id as string);

            try {

                return response.status(204).json;
            }
            catch {
                throw new NotFoundError('Category not deactivated');
            }
        }
    );

    api.delete(Prefix + BaseURI + '/[id]', 
        ValidateMiddleware('params', { 'id': 'string' }),
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Category not found');
            let id = Minify.decode(request.params.id as string);

            try {
                return response.status(204).json;
            }
            catch {
                throw new NotFoundError('Category not deleted');
            }
        }
    );
}