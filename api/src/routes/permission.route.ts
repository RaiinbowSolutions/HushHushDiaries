import { API, RegisterOptions, Request, Response } from "lambda-api";
import { AuthenticatedMiddleware as Authenticated } from "../middleware/authenticated.middleware";
import { PermissionService } from "../services/permission.service";
import { ValidateMiddleware } from "../middleware/validate.middleware";
import { Authentication } from "../middleware/authentication.middleware";
import { Pagination } from "../utilities/pagination";
import { Minify } from "../utilities/minify";
import { NotFoundError } from "../middleware/error.middleware";

export const PermissionRoute = (api: API, options: RegisterOptions | undefined) => {
    const Prefix = options?.prefix || '';
    const BaseURI = '/permissions';

    api.get(Prefix + BaseURI + '/counts',
    Authenticated(),
    async (request: Request, response: Response) => {
        let counts = await PermissionService.counts();
        return response.status(200).json({type: 'permission', counts});
    });

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
                let total = await PermissionService.counts();
                let permissions = await PermissionService.selects(offset, limit);
                let filtered = await PermissionService.filters.permissions(authentication.id, permissions);
    
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

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Permission not found');
            let id = Minify.decode(request.params.id as string);

            try {
                let permission = await PermissionService.select(id);
                let filtered = await PermissionService.filters.permission(authentication.id, permission);

                return response.status(200).json(filtered);
            } catch (error) {
                throw new NotFoundError('Permission not found');
            }
        }
    );
}