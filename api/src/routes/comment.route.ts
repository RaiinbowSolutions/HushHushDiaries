import { API, RegisterOptions, Request, Response } from "lambda-api";
import { AuthenticatedMiddleware as Authenticated } from "../middleware/authenticated.middleware";
import { CommentService } from "../services/comment.service";
import { Authentication } from "../middleware/authentication.middleware";
import { Validation } from "../utilities/validation";
import { CreateDataResponse, CreatePaginationDataResponse } from "../utilities/responses";
export const CommentRoute = (api: API, options: RegisterOptions | undefined) => {
    const Prefix = options?.prefix;
    const BaseURI = '/comments';

    api.get(Prefix + BaseURI + '/comments',
        Authenticated(),
        async (request: Request, response: Response) => {
            let counts = await CommentService.counts();
            return response.status(200).json({type: 'comments', counts});
        }
    );

    api.get(Prefix + BaseURI, 
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication; 
            let {limit, offset} = Validation.pagination(request);
            let total = await CommentService.counts();
            let comments = await CommentService.selects(offset, limit);
            let filteredComments = await CommentService.filters.comments(authentication.id, comments);
            return CreatePaginationDataResponse(request, response, filteredComments, total);
        }
    );

    api.get(Prefix + BaseURI + '/[id]', 
        Authenticated(), 
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;
            let id = Validation.id(request);
            let comment = await CommentService.select(id);
            let filteredComment = await CommentService.filters.comment(authentication.id, comment);
            return CreateDataResponse(request, response, filteredComment);
        }
    );
}