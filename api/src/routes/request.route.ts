import { Authentication } from './../middleware/authentication.middleware';
import { API, RegisterOptions, Request, Response } from "lambda-api";
import { AuthenticatedMiddleware as Authenticated } from '../middleware/authenticated.middleware';
import { RequestService } from "../services/request.service";
import { Validation } from "../utilities/validation";
import { ValidateMiddleware } from '../middleware/validate.middleware';
import { Pagination } from '../utilities/pagination';
import { Minify } from '../utilities/minify';
import { NotFoundError } from '../middleware/error.middleware';

export const RequestRoute = (api: API, options: RegisterOptions | undefined) => {
    const Prefix = options?.prefix || '';
    const BaseURI = '/requests';

    api.get(Prefix + BaseURI + '/counts', 
        Authenticated(), 
        async (request: Request, response: Response) => {
            let counts = await RequestService.counts();
            return response.status(200).json({type: 'request', counts});
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
                let total = await RequestService.counts();
                let requests = await RequestService.selects(offset, limit);
                let filtered = await RequestService.filters.requests(authentication.id, requests);
    
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

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Request not found');
            let id = Minify.decode(request.params.id as string);

            try {
                let request = await RequestService.select(id);
                let filtered = await RequestService.filters.request(authentication.id, request);

                return response.status(200).json(filtered);
            } catch (error) {
                throw new NotFoundError('Request not found');
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
                throw new NotFoundError('Request not created');
            }
        }
    );

    api.patch(Prefix + BaseURI + '/[id]',
        ValidateMiddleware('params', { 'id': 'string' }),
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;
            
            try {
                return response.status(204).json;
            }
            catch {
                throw new NotFoundError('Request not updated');
            }
        }
    );

    api.post(Prefix + BaseURI + 'deactivate/[id]',
        ValidateMiddleware('params', { 'id': 'string' }),
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;

            try {
                return response.status(204).json;
            }
            catch {
                throw new NotFoundError('Request not deactivated');
            }
        }
    );

    api.delete(Prefix + BaseURI + '/[id]',
        ValidateMiddleware('params', { 'id': 'string'}),
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authencation;

            try {
                return response.status(204).json;
            }
            catch {
                throw new NotFoundError('Request not deleted');
            }
        }
    );

    api.post(Prefix + BaseURI + '/review/[id]',
        ValidateMiddleware('params', { 'id': 'string'}),
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authencation;

            try {
                return response.status(204).json;
            }
            catch {
                throw new NotFoundError('Request not reviewed');
            }
        }
    );
}