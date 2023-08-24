import { Authentication } from './../middleware/authentication.middleware';
import { API, RegisterOptions, Request, Response } from "lambda-api";
import { AuthenticatedMiddleware as Authenticated } from '../middleware/authenticated.middleware';
import { RequestService } from "../services/request.service";
import { Validation } from "../utilities/validation";
import { CreateDataResponse, CreatePaginationDataResponse } from "../utilities/responses";

export const RequestRoute = (api: API, options: RegisterOptions | undefined) => {
    const Prefix = options?.prefix;
    const BaseURI = '/requests';

    api.get(Prefix + BaseURI + '/counts', 
        Authenticated(), 
        async (request: Request, response: Response) => {
            let counts = await RequestService.counts();
            return response.status(200).json({type: 'request', counts});
        }
    );

    api.get(Prefix + BaseURI, 
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;
            let {limit, offset} = Validation.pagination(request);
            let total = await RequestService.counts();
            let requests = await RequestService.selects(offset, limit);
            let filteredRequests = await RequestService.filters.requests(authentication.id, requests);
            return CreatePaginationDataResponse(request, response, filteredRequests, total);
        }
    );

    api.get(Prefix + BaseURI + '/[id]',
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;
            let id = Validation.id(request);
            let reQuest = await RequestService.select(id);
            let filteredRequest = await RequestService.filters.request(authentication.id, reQuest);
            return CreateDataResponse(request, response, filteredRequest);
        }
    );
}