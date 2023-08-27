import { API, RegisterOptions, Request, Response } from "lambda-api";
import { AuthenticatedMiddleware as Authenticated } from "../middleware/authenticated.middleware";
import { CommentService } from "../services/comment.service";
import { Authentication } from "../middleware/authentication.middleware";
import { ValidateMiddleware } from "../middleware/validate.middleware";
import { Pagination } from "../utilities/pagination";
import { Minify } from "../utilities/minify";
import { NotFoundError } from "../middleware/error.middleware";

export const CommentRoute = (api: API, options: RegisterOptions | undefined) => {
    const Prefix = options?.prefix || '';
    const BaseURI = '/comments';

    api.get(Prefix + BaseURI + '/comments',
        Authenticated(),
        async (request: Request, response: Response) => {
            let counts = await CommentService.counts();
            return response.status(200).json({type: 'comments', counts});
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
                let total = await CommentService.counts();
                let comments = await CommentService.selects(offset, limit);
                let filtered = await CommentService.filters.comments(authentication.id, comments);
    
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

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Comment not found');
            let id = Minify.decode(request.params.id as string);

            try {
                let comment = await CommentService.select(id);
                let filtered = await CommentService.filters.comment(authentication.id, comment);

                return response.status(200).json(filtered);
            } catch (error) {
                throw new NotFoundError('Comment not found');
            }
        }
    );

    api.post(Prefix + BaseURI, 
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;

            try {

                return response.status(201).json;
            }
            catch {
                throw new NotFoundError('Comment not created');
            }
        }
    );

    api.patch(Prefix + BaseURI + '/[id]',
        ValidateMiddleware('params', {'id': 'string'}),
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Comment not found');
            let id = Minify.decode(request.params.id as string);

            try {

                return response.status(204).json;
            }
            catch {
                throw new NotFoundError('Comment not updated');
            }
        }
    );

    api.post(Prefix + BaseURI + '/deactivate/[id]', 
        ValidateMiddleware('params', {'id': 'string'}),
        Authenticated(),
        async (request: Request, response: Response) => {
            let authencation: Authentication = request.authentication;

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Comment not found');
            let id = Minify.decode(request.params.id as string);

            try {

                return response.status(204).json;
            }
            catch {
                throw new NotFoundError('Comment not deactivated');
            }
        }
    );

    api.post(Prefix + BaseURI + '/approve/[id]',
        ValidateMiddleware('params', {'id': 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Comment not found');
            let id = Minify.decode(request.params.id as string);

            try {

                return response.status(204).json; 
            }
            catch {
                throw new NotFoundError('Comment not approved');
            }
        }
    );

    api.post(Prefix + BaseURI + '/review/[id]',
        ValidateMiddleware('params', {'id': 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            let authentication: Authentication = request.authentication; 

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Comment not found');
            let id = Minify.decode(request.params.id as string);

            try {

                return response.status(204).json;
            }
            catch {
                throw new NotFoundError('Comment review not approved')
            }
        }
    );

    api.get(Prefix + BaseURI + '/likes/count/[id]',
        ValidateMiddleware('params', {'id': 'string'}),
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Comment not found');
            let id = Minify.decode(request.params.id as string);

            try {

                return response.status(200).json;
            }
            catch {
                throw new NotFoundError('Likecount not found');
            }
        }
    );

    api.post(Prefix + BaseURI + '/likes/[id]',
        ValidateMiddleware('params', {'id': 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            let authentication: Authentication = request.authencation;

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Comment not found');
            let id = Minify.decode(request.params.id as string);

            try {

                return response.status(204).json;
            }
            catch {
                throw new NotFoundError('Comment like not executed');
            }
        }
    );

    api.delete(Prefix + BaseURI + '/likes/[id]',
        ValidateMiddleware('params', {'id': 'string'}),
        Authenticated(),
        async(request: Request, response: Response) => {
            let authentication: Authentication = request.authentication; 

            if (!Minify.validate(request.params.id as string)) throw new NotFoundError('Comment not found');
            let id = Minify.decode(request.params.id as string);

            try {

                return response.status(204).json; 
            }
            catch {
                throw new NotFoundError('Comment like not removed');
            }
        }
    );
}