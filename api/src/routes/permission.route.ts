import { API, RegisterOptions, Request, Response } from "lambda-api";
import { AuthenticatedMiddleware as Authenticated } from "../middleware/authenticated.middleware";
import { PermissionService } from "../services/permission.service";
import { Validation } from "../utilities/validation";
import { CreateDataResponse, CreatePaginationDataResponse } from "../utilities/responses";

export const PermissionRoute = (api: API, options: RegisterOptions | undefined) => {
    const Prefix = options?.prefix;
    const BaseURI = '/permissions';

    api.get(Prefix + BaseURI + '/counts',
    Authenticated(),
    async (request: Request, response: Response) => {
        let counts = await PermissionService.counts();
        return response.status(200).json({type: 'permission', counts});
    });

    api.get(Prefix + BaseURI,
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication = request.authenication;
            let {limit, offset} = Validation.pagination(request);
            let total = await PermissionService.counts();
            let permissions = await PermissionService.selects(offset, limit);
            let filteredPermissions = await PermissionService.filters.permissions(authentication.id, permissions);
            return CreatePaginationDataResponse(request, response, filteredPermissions, total);
        }
    );

    api.get(Prefix + BaseURI + '/[id]',
    Authenticated(),
    async (request: Request, response: Response) => {
        let authentication = request.authentication;
        let id = Validation.id(request);
        let permission = await PermissionService.select(id);
        let filteredPermission = await PermissionService.filters.permission(authentication.id, permission);
        return CreateDataResponse(request, response, filteredPermission);
    });
}