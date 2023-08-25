import { API, RegisterOptions, Request, Response } from 'lambda-api';
import { AuthenticatedMiddleware as Authenticated } from '../middleware/authenticated.middleware';
import { UserService } from '../services/user.service';
import { Validation } from '../utilities/validation';
import { Authentication } from '../middleware/authentication.middleware';
import { ValidateMiddleware } from '../middleware/validate.middleware';
import { Pagination } from '../utilities/pagination';
import { Minify } from '../utilities/minify';
import { BadRequestError, NotFoundError } from '../middleware/error.middleware';

export const UserRoute = (api: API, options: RegisterOptions | undefined) => {
    const Prefix = options?.prefix || '';
    const BaseURI = '/users';

    api.get(Prefix + BaseURI + '/counts',
        Authenticated(),
        async (request: Request, response: Response) => {
            let counts = await UserService.counts();
            return response.status(200).json({type: 'user', counts});
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
                let total = await UserService.counts();
                let users = await UserService.selects(offset, limit);
                let filtered = await UserService.filters.users(authentication.id, users);
    
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

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('User not found');
            let id = Minify.decode(request.params.id as string);

            try {
                let user = await UserService.select(id);
                let filtered = await UserService.filters.user(authentication.id, user);

                return response.status(200).json(filtered);
            } catch (error) {
                throw new NotFoundError('User not found');
            }
        }
    );

    api.get(Prefix + BaseURI + '/email/[email]',
        ValidateMiddleware('params', { 'email': 'string' }),
        Authenticated(),
        async (request: Request, response: Response) => {
            if (Validation.email(request.params.email as string)) throw new BadRequestError(`Given 'email' is not an valid email address`);
            let id = await UserService.findUserIdByEmail(request.params.email as string);

            if (id === undefined) throw new NotFoundError('User not found');

            return response.redirect(308, `/${id}`);
        }
    );

}