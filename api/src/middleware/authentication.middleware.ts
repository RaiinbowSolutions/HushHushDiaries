import 'dotenv/config';
import { Middleware } from "lambda-api";
import JWT, { JwtPayload } from 'jsonwebtoken';
import { UserService } from '../services/user.service';

const JsonWebTokenSecret = process.env.JSON_WEB_TOKEN_SECRET || '823aa5983cb0e574bdf87d2f4477a431e2542c16ec99594d0463d5aa37022b0a';
const JsonWebTokenIssuer = process.env.JSON_WEB_TOKEN_ISSUER || 'DEVELOPMENT';

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
            try {
                let payload: JwtPayload = JWT.verify(auth.value, JsonWebTokenSecret, {
                    ignoreExpiration: false,
                    ignoreNotBefore: false,
                    issuer: JsonWebTokenIssuer
                }) as JwtPayload;
    
                let total = await UserService.permissions.countPermissions(payload.id);
                let userPermissions = await UserService.permissions.selectPermissions(payload.id, 0, Number(total));
                let permissions = userPermissions.map((userPermission) => userPermission.name);
    
                authentication.id = payload.id;
                authentication.permissions = permissions;
                authentication.authenticated = true;
            } catch (error) {}
        }

        request.authentication = authentication;

        return next();
    }
};