import { API, RegisterOptions, Request, Response } from 'lambda-api';
import { AuthenticatedMiddleware as Authenticated } from '../middleware/authenticated.middleware';
import { UserService } from '../services/user.service';
import { CreateDataResponse, CreatePaginationDataResponse } from '../utilities/responses';
import { Filters } from '../utilities/filters';
import { Validate } from '../utilities/validations';

export const UserRoute = (api: API, options: RegisterOptions | undefined) => {
    const Prefix = options?.prefix;
    const BaseURI = '/users';

    api.get(Prefix + BaseURI + '/counts',
        Authenticated(),
        async (request: Request, response: Response) => {
            let counts = await UserService.counts();
            return response.status(200).json({type: 'user', counts});
        }
    );

    api.get(Prefix + BaseURI,
        Authenticated(),
        async (request: Request, response: Response) => {
            let {limit, offset} = Validate.pagination(request);
            let total = await UserService.counts();
            let users = await UserService.selects(offset, limit);
            let filteredUsers = await Filters.users(request, users);
            return CreatePaginationDataResponse(request, response, filteredUsers, total);
        }
    );

    api.get(Prefix + BaseURI + '/[id]',
        Authenticated(),
        async (request: Request, response: Response) => {
            let id = Validate.id(request);
            let user = await UserService.select(id);
            let filteredUser = await Filters.user(request, user);
            return CreateDataResponse(request, response, filteredUser);
        }
    );

    api.get(Prefix + BaseURI + '/email/[email]',
        Authenticated(),
        async (request: Request, response: Response) => {
            let email = Validate.email(request);
            let userId = await UserService.findUserIdByEmail(email);

            return response.redirect(308, `/${userId}`);
        }
    );

}