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

    api.get(Prefix + BaseURI + '/counts', 
        Authenticated(), 
        async (request: Request, response: Response) => {
            let counts = await BlogService.counts();
            return response.status(200).json({type: 'blog', counts});
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
                let total = await BlogService.counts();
                let blogs = await BlogService.selects(offset, limit);
                let filtered = await BlogService.filters.blogs(authentication.id, blogs);
    
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

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Blog not found');
            let id = Minify.decode(request.params.id as string);

            try {
                let blog = await BlogService.select(id);
                let filtered = await BlogService.filters.blog(authentication.id, blog);

                return response.status(200).json(filtered);
            } catch (error) {
                throw new NotFoundError('Blog not found');
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
                throw new NotFoundError('Blog not created');
            }
        }
    );

    api.patch(Prefix + BaseURI + '/[id]', 
        ValidateMiddleware ('params', { 'id': 'string' }),
        Authenticated(), 
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;  

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Blog not found');
            let id = Minify.decode(request.params.id as string);

            try {

                return response.status(204).json;
            }
            catch {
                throw new NotFoundError('Blog not updated');
            }
        }
    );

    api.post(Prefix + BaseURI + '/deactivate/[id]', 
        ValidateMiddleware('params', { 'id': 'string'}), 
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication; 

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Blog not found');
            let id = Minify.decode(request.params.id as string);

            try {

                return response.status(204).json;
            }
            catch {
                throw new NotFoundError('Blog not deactivated');
            }
        }
    );

    api.delete(Prefix + BaseURI + '/[id]',
        ValidateMiddleware('params', { 'id': 'string' }),
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication; 

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Blog not found');
            let id = Minify.decode(request.params.id as string);

            try {

                return response.status(204).json; 
            }
            catch {
                throw new NotFoundError('Blog not deleted');
            }
        }
    );

    api.post(Prefix + BaseURI + '/approve/[id]',
        ValidateMiddleware('params', {'id': 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            let authentication: Authentication = request.authentication; 

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Blog not found');
            let id = Minify.decode(request.params.id as string);

            try {

                return response.status(204).json;
            }
            catch {
                throw new NotFoundError('Blog not approved');
            }
        }
    );

    api.post(Prefix + BaseURI + '/review/[id]',
        ValidateMiddleware('params', {'id': 'string'}),
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Blog not found');
            let id = Minify.decode(request.params.id as string);

            try {

                return response.status(204).json;
            }
            catch {
                throw new NotFoundError('Blog not reviewed');
            }
        }
    );

    api.post(Prefix + BaseURI + '/publish/[id]',
        ValidateMiddleware('params', { 'id': 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            let authentication: Authentication = request.authentication; 

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Blog not found');
            let id = Minify.decode(request.params.id as string);

            try {

                return response.status(204).json;
            }
            catch {
                throw new NotFoundError('Blog not published');
            }
        }
    );

    api.post(Prefix + BaseURI + '/publish/[id]',
        ValidateMiddleware('params', {'id': 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            let authentication: Authentication = request.authentication; 

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Blog not found');
            let id = Minify.decode(request.params.id as string);

            try {

                return response.status(204).json;
            }
            catch {
                throw new NotFoundError('Blog not unpublished');
            }
        }
    );

    api.get(Prefix + BaseURI + '/likes/count/[id]',
        ValidateMiddleware('params', {'id': 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            let authentication: Authentication = request.authentication; 

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Blog not found');
            let id = Minify.decode(request.params.id as string);

            try {

                return response.status(200).json;
            }
            catch {
                throw new NotFoundError('Blog likes not found');
            }
        }
    );

    api.post(Prefix + BaseURI + '/likes/[id]',
        ValidateMiddleware('params', {'id': 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            let authentication: Authentication = request.authentication; 

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Blog not found');
            let id = Minify.decode(request.params.id as string);

            try {

                return response.status(204).json;
            }
            catch {
                throw new NotFoundError('Blog like not executed');
            }
        }
    );

    api.delete(Prefix + BaseURI + '/likes/[id]',
        ValidateMiddleware('params', {'id': 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;  

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Blog not found');
            let id = Minify.decode(request.params.id as string);

            try {

                return response.status(204).json;
            }
            catch {
                throw new NotFoundError('Blog like not removed');
            }
        }
    );

    api.get(Prefix + BaseURI, 
        ValidateMiddleware('query', {
            'page': {type: 'number', required: false},
            'limit': {type: 'number', required: false},
        }),
        Authenticated(),
        async(request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;  
            let {limit, offset} = Pagination.getData(request);

            try {

                return response.status(200).json;
            }
            catch {
                throw new NotFoundError('Blog owned list not found');
            }
        }
    );
}