import { API, RegisterOptions, Request, Response, CookieOptions } from 'lambda-api';
import { ValidateMiddleware } from '../middleware/validate.middleware';
import { Validation } from '../utilities/validation';
import { BadRequestError } from '../middleware/error.middleware';
import { UserService } from '../services/user.service';
import { Token } from '../utilities/token';
import { Encryption } from '../utilities/encryption';

const CookieOption = (expires: Date): CookieOptions => {
    return {
        httpOnly: true,
        expires: addMinute(expires, 10),
        secure: true,
        sameSite: 'Strict',
    }
}

function addMinute(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
}

export const TokenRoute = (api: API, options: RegisterOptions | undefined) => {
    const Prefix = options?.prefix || '';
    const BaseURI = '/token';

    api.post(Prefix + BaseURI,
        ValidateMiddleware('body', {
            email: { type: 'string', required: false },
            password: { type: 'string', required: false },
        }),
        async (request: Request, response: Response) => {
            if (!Validation.email(request.body.email as string)) throw new BadRequestError(`Given 'email' is not an valid email address`);
            let password = request.body.password as string;
            let id = await UserService.findUserIdByEmail(request.body.email as string);
            
            if (id === undefined) throw new BadRequestError(`Given login data did not match`);

            let credential = await UserService.credentials.select(id);
            let hash = Encryption.hashing(password, credential.salt);

            if (hash !== credential.password) throw new BadRequestError(`Given login data did not match`);

            let token = Token.encode({
                id,
            });

            return response
            //.cookie('token_type', 'Bearer', CookieOption(new Date()))
            //.cookie('token', token, CookieOption(new Date()))
            .status(200)
            .json({
                type: 'Bearer',
                token
            });
        }
    );
}