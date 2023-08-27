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

    /**
     * @alias PermissionRoute_GetCounts
     */

    api.get(Prefix + BaseURI + '/counts',
    Authenticated(),
    async (request: Request, response: Response) => {
        let counts = await PermissionService.counts();
        return response.status(200).json({type: 'permission', counts});
    });

    /**
     * @alias PermissionRoute_GetPermissions
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

            try {
                let total = await PermissionService.counts();
                let permissions = await PermissionService.selects(offset, limit);
                let filtered = await PermissionService.filters.permissions(authentication.id, permissions);
    
                let pagination = Pagination.create(request, filtered, total);
    
                return response.status(200).json(pagination);
            } catch (error) {}
        }
    );
    
    /**
     * @alias PermissionRoute_GetPermission
     */
    api.get(Prefix + BaseURI + '/[id]',
        ValidateMiddleware('params', { 'id': 'string' }),
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Permission not found');
            let id = Minify.decode(request.params.id as string);
            let permission = await PermissionService.select(id);
            let filtered = await PermissionService.filters.permission(authentication.id, permission);

            return response.status(200).json(filtered);
        }
    );
    
    /**
     * @alias PermissionRoute_CreatePermission
     */
    api.post(Prefix + BaseURI,
        ValidateMiddleware('body', {
            'name': 'string',
        }),
        Authenticated(),
        async(request: Request, response: Response) => {
            let name = request.body.name as string;
            let description = request.body.description as string;
            let result = await PermissionService.insert(name, description);
            let id = Minify.encode(result.insertId as bigint);

            return response.status(201).json({
                created: true,
                id,
                path: `${request.path}/${id}`,
            });
        }
    );

    /**
     * @alias PermissionRoute_UpdatePermission
     */
    api.patch(Prefix + BaseURI + '/[id]',
        ValidateMiddleware('params', {id : 'string'}),
        ValidateMiddleware('body', {
            'name': 'string',
        }),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Permission not found');

            let id = Minify.decode(request.params.id as string);
            let name = request.body.name as string ; 
            let description = request.body.description as string; 

            let result = await PermissionService.update(id, {
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
     * @alias PermissionRoute_DeactivatePermission
     */
    api.post(Prefix + BaseURI + '/deactivate/[id]',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Permission not found');

            let id = Minify.decode(request.params.id as string);
            let result = await PermissionService.markAsDeleted(id);

            return response.status(204).json({
                deactivated: true, 
                deactivated_rows: result.numUpdatedRows,
            })
        }
    );

    /**
     * @alias PermissionRoute_DeletePermission
     */
    api.delete(Prefix + BaseURI + '/[id]',
        ValidateMiddleware('params', {id: 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Permission not found');

            let id = Minify.decode(request.params.id as string);
            let result = await PermissionService.delete(id);

            return response.status(204).json({
                deleted: true, 
                deleted_rows: result.numDeletedRows,
            })
        }
    );
}