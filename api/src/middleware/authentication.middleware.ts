import { Middleware } from "lambda-api";
import { UserService } from '../services/user.service';
import { Token } from "../utilities/token";
import { UnauthorizedError } from "./error.middleware";

export type AuthenticationType = "Bearer" | "Basic" | "OAuth" | "Digest" | "none";
export type Authentication = {
    authenticated: boolean,
    id: bigint,
    permissions: string[],
    banned: boolean,
    deleted: boolean
}

export const AuthenticationMiddleware = (): Middleware => {
    return async (request, response, next) => {
        let auth = request.auth;
        let authentication: Authentication = {
            authenticated: false,
            id: BigInt(0),
            permissions: [],
            banned: false,
            deleted: false,
        };

        if ('token' in request.cookies) {
            auth.type = request.cookies.token_type as AuthenticationType || 'Bearer';
            auth.value = request.cookies.token;
        }

        if (auth.type == 'Bearer' && auth.value != null) {
            let payload = Token.decode(auth.value);
            let id = BigInt(payload.id);
            let user = await UserService.select(id);
            let total = await UserService.permissions.countPermissions(id);
            let userPermissions = await UserService.permissions.selectPermissions(id, 0, Number(total));
            let permissions = userPermissions.map((userPermission) => userPermission.name);

            authentication.id = payload.id;
            authentication.permissions = permissions;
            authentication.authenticated = true;
            authentication.banned = user.banned ? true : false;
            authentication.deleted = user.deleted ? true : false;

            console.info('Authentication from', request.ip+':', authentication);
        }

        if (!authentication.authenticated) console.info('Authentication from', request.ip+':', 'Not authenticated');

        request.authentication = authentication;

        return next();
    }
};