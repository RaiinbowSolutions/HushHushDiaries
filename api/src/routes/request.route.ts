import { Authentication } from './../middleware/authentication.middleware';
import { API, RegisterOptions, Request, Response } from "lambda-api";
import { AuthenticatedMiddleware as Authenticated } from '../middleware/authenticated.middleware';
import { RequestService } from "../services/request.service";
import { ValidateMiddleware } from '../middleware/validate.middleware';
import { Pagination } from '../utilities/pagination';
import { Minify } from '../utilities/minify';
import { NotFoundError } from '../middleware/error.middleware';
import { RequiredMiddleware, SpecialPermission } from '../middleware/required.middleware';
import { CreateRequest } from '../models/request.model';

const AllowOwner = SpecialPermission.AllowOwner;

export const RequestRoute = (api: API, options: RegisterOptions | undefined) => {
    const Prefix = options?.prefix || '';
    const BaseURI = '/requests';

    /**
     * @alias RequestRoute_GetCounts
     */
    api.get(Prefix + BaseURI + '/counts', 
        Authenticated(), 
        RequiredMiddleware(undefined, 'view-request'),
        async (request: Request, response: Response) => {
            let counts = await RequestService.counts();

            return response.status(200).json({type: 'request', counts});
        }
    );

    /**
     * @alias RequestRoute_GetRequests
     */
    api.get(Prefix + BaseURI,
        ValidateMiddleware('query', {
            page: { type: 'number', required: false },
            limit: { type: 'number', required: false },
        }),
        Authenticated(),
        RequiredMiddleware(undefined, 'view-request'),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;
            let {limit, offset} = Pagination.getData(request);
            let total = await RequestService.counts();
            let requests = await RequestService.selects(offset, limit);
            let filtered = await RequestService.filters.requests(authentication.id, requests);
            let pagination = Pagination.create(request, filtered, total);

            return response.status(200).json(pagination);
        }
    );

    /**
     * @alias RequestRoute_GetRequest
     */
    api.get(Prefix + BaseURI + '/:id',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware('requests', AllowOwner, 'view-request'),
        async (request: Request, response: Response) => {
            if (!Minify.validate('requests', request.params.id as string)) throw new NotFoundError('Request not found');
            
            let id = Minify.decode('requests', request.params.id as string);
            let authentication: Authentication = request.authentication;
            let reQuest = await RequestService.select(id);
            let filtered = await RequestService.filters.request(authentication.id, reQuest);

            return response.status(200).json(filtered);
        }
    );

    /**
     * @alias RequestRoute_CreateRequest
     */
    api.post(Prefix + BaseURI,
        ValidateMiddleware('body', {
            content: 'string',
            topic: 'string',
            reference_type: 'string',
            reference_id: 'string',
        }),
        Authenticated(),
        async (request: Request, response: Response) => {
            let reference_type = request.body.reference_type as CreateRequest['reference_type']; 

            if (!Minify.validate(reference_type === 'blog' ? 'blogs' : reference_type === 'comment' ? 'comments' : 'users', request.body.reference_id as string)) throw new NotFoundError(`Given 'reference_id' is not an valid reference`);

            let authentication: Authentication = request.authentication;
            let content = request.body.content as string; 
            let topic = request.body.topic as CreateRequest['topic']; 
            let reference_id = Minify.decode(reference_type === 'blog' ? 'blogs' : reference_type === 'comment' ? 'comments' : 'users', request.body.reference_id as string);
            let result = await RequestService.insert(authentication.id, content, topic, reference_type, reference_id);
            let id = Minify.encode('requests', result.insertId as bigint);

            return response.status(201).json({
                created: true, 
                id, 
                path: `${request.path}/${id}`,
            });
        }
    );

    /**
     * @alias RequestRoute_UpdateRequest
     */
    api.patch(Prefix + BaseURI + '/:id',
        ValidateMiddleware('params', { id: 'string' }),
        ValidateMiddleware('body', {
            content: { type: 'string', required: false },
        }),
        Authenticated(),
        RequiredMiddleware('requests', AllowOwner, 'update-request'),
        async (request: Request, response: Response) => {
            if (!Minify.validate('requests', request.params.id as string)) throw new NotFoundError('Request not found');

            let id = Minify.decode('requests', request.params.id as string);
            let content = request.body.content as string | undefined;
            let result = await RequestService.update(id, {
                content,
            });

            return response.status(204).json({
                updated: true, 
                updated_rows: '' + result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias RequestRoute_DeleteRequest
     */
    api.delete(Prefix + BaseURI + '/:id',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware(undefined, 'delete-request'),
        async (request: Request, response: Response) => {
            if (!Minify.validate('requests', request.params.id as string)) throw new NotFoundError('Request not found');

            let id = Minify.decode('requests', request.params.id as string);
            let result = await RequestService.delete(id);

            return response.status(204).json({
                deleted: true, 
                deleted_rows: '' + result.numDeletedRows,
            });
        }
    );

    /**
     * @alias RequestRoute_DeactivateRequest
     */
    api.post(Prefix + BaseURI + '/:id/deactivate',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware('requests', AllowOwner, 'deactivate-request'),
        async (request: Request, response: Response) => {
            if (!Minify.validate('requests', request.params.id as string)) throw new NotFoundError('Request not found');

            let id = Minify.decode('requests', request.params.id as string);
            let result = await RequestService.markAsDeleted(id);

            return response.status(204).json({
                deactivated: true, 
                deactivated_rows: '' + result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias RequestRoute_ReviewRequest
     */
    api.post(Prefix + BaseURI + '/:id/review',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware(undefined, 'review-request'),
        async (request: Request, response: Response) => {
            if (!Minify.validate('requests', request.params.id as string)) throw new NotFoundError('Request not found');
            
            let id = Minify.decode('requests', request.params.id as string);
            let result = await RequestService.markAsReviewed(id);
            
            return response.status(204).json({
                reviewed: true, 
                reviewed_rows: '' + result.numUpdatedRows,
            });
        }
    );
}