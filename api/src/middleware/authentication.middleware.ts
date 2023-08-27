import { Middleware } from "lambda-api";
import { UserService } from '../services/user.service';
import { Token } from "../utilities/token";


export type Authentication = {
    authenticated: boolean,
    id: bigint,
    permissions: string[],
}

export const AuthenticationMiddleware = (): Middleware => {
    return async (request, response, next) => {
        let auth = request.auth;
        let authentication: Authentication = {
            authenticated: false,
            id: BigInt(0),
            permissions: [],
        };

        if ('token' in request.cookies) {
            auth.type = 'Bearer';
            auth.value = request.cookies.token;
        }

        if (auth.type == 'Bearer' && auth.value != null) {
            let payload = Token.decode(auth.value);
            let id = BigInt(payload.id);
            let total = await UserService.permissions.countPermissions(id);
            let userPermissions = await UserService.permissions.selectPermissions(id, 0, Number(total));
            let permissions = userPermissions.map((userPermission) => userPermission.name);

            authentication.id = payload.id;
            authentication.permissions = permissions;
            authentication.authenticated = true;

            console.info('Authentication from', request.ip+':', authentication);
        }

        if (!authentication.authenticated) console.info('Authentication from', request.ip+':', 'Not authenticated');

        request.authentication = authentication;

        return next();
    }
};