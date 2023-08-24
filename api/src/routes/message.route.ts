import { API, RegisterOptions, Request, Response } from "lambda-api";
import { AuthenticatedMiddleware as Authenticated } from "../middleware/authenticated.middleware";
import { MessageService } from "../services/message.service";
import { Authentication } from "../middleware/authentication.middleware";
import { Validation } from "../utilities/validation";
import { CreateDataResponse, CreatePaginationDataResponse } from "../utilities/responses";
export const MessageRoute = (api: API, options: RegisterOptions) => {
    const Prefix = options?.prefix;
    const BaseURI = '/messages';

    api.get(Prefix + BaseURI + '/counts', 
        Authenticated(),
        async (request: Request, response: Response) => {
            let counts = await MessageService.counts();
            return response.status(200).json({type: 'message', counts});
        }
    );

    api.get(Prefix + BaseURI, 
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication; 
            let {limit, offset} = Validation.pagination(request);
            let total = await MessageService.counts();
            let messages = await MessageService.selects(offset, limit);
            let filteredMessages = await MessageService.filters.messages(authentication.id, messages);
            return CreatePaginationDataResponse(request, response, filteredMessages, total);
        }
    );

    api.get(Prefix + BaseURI + '/[id]',
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;
            let id = Validation.id(request);
            let message = await MessageService.select(id);
            let filteredMessage = await MessageService.filters.message(authentication.id, message);
            return CreateDataResponse(request, response, filteredMessage);
        }
    );
}