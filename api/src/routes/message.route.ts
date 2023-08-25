import { API, RegisterOptions, Request, Response } from "lambda-api";
import { AuthenticatedMiddleware as Authenticated } from "../middleware/authenticated.middleware";
import { MessageService } from "../services/message.service";
import { Authentication } from "../middleware/authentication.middleware";
import { ValidateMiddleware } from "../middleware/validate.middleware";
import { Pagination } from "../utilities/pagination";
import { Minify } from "../utilities/minify";
import { NotFoundError } from "../middleware/error.middleware";

export const MessageRoute = (api: API, options: RegisterOptions | undefined) => {
    const Prefix = options?.prefix || '';
    const BaseURI = '/messages';

    api.get(Prefix + BaseURI + '/counts', 
        Authenticated(),
        async (request: Request, response: Response) => {
            let counts = await MessageService.counts();
            return response.status(200).json({type: 'message', counts});
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
                let total = await MessageService.counts();
                let messages = await MessageService.selects(offset, limit);
                let filtered = await MessageService.filters.messages(authentication.id, messages);
    
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

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Message not found');
            let id = Minify.decode(request.params.id as string);

            try {
                let message = await MessageService.select(id);
                let filtered = await MessageService.filters.message(authentication.id, message);

                return response.status(200).json(filtered);
            } catch (error) {
                throw new NotFoundError('Message not found');
            }
        }
    );
}