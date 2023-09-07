import { API, RegisterOptions, Request, Response } from "lambda-api";
import { AuthenticatedMiddleware as Authenticated } from "../middleware/authenticated.middleware";
import { MessageService } from "../services/message.service";
import { Authentication } from "../middleware/authentication.middleware";
import { ValidateMiddleware } from "../middleware/validate.middleware";
import { Pagination } from "../utilities/pagination";
import { Minify } from "../utilities/minify";
import { NotFoundError } from "../middleware/error.middleware";
import { CreateMessage } from "../models/message.model";
import { RequiredMiddleware, SpecialPermission } from "../middleware/required.middleware";

const AllowOwner = SpecialPermission.AllowOwner;

export const MessageRoute = (api: API, options: RegisterOptions | undefined) => {
    const Prefix = options?.prefix || '';
    const BaseURI = '/messages';

    /**
     * @alias MessageRoute_GetCounts
     */
    api.get(Prefix + BaseURI + '/counts', 
        Authenticated(),
        RequiredMiddleware('messages', AllowOwner, 'view-message'),
        async (request: Request, response: Response) => {
            let counts = await MessageService.counts();

            return response.status(200).json({type: 'message', counts});
        }
    );
    
    /**
     * @alias MessageRoute_GetMessages
     */
    api.get(Prefix + BaseURI,
        ValidateMiddleware('query', {
            page: { type: 'number', required: false },
            limit: { type: 'number', required: false },
        }),
        Authenticated(),
        RequiredMiddleware('messages', AllowOwner, 'view-message'),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;
            let {limit, offset} = Pagination.getData(request);
            let total = await MessageService.counts();
            let messages = await MessageService.selects(offset, limit);
            let filtered = await MessageService.filters.messages(authentication.id, messages);
            let pagination = Pagination.create(request, filtered, total);

            return response.status(200).json(pagination);
        }
    );

    /**
     * @alias MessageRoute_GetMessage
     */
    api.get(Prefix + BaseURI + '/:id',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware('messages', AllowOwner, 'view-message'),
        async (request: Request, response: Response) => {
            if (!Minify.validate('messages', request.params.id as string)) throw new NotFoundError('Message not found');

            let id = Minify.decode('messages', request.params.id as string);
            let authentication: Authentication = request.authentication;
            let message = await MessageService.select(id);
            let filtered = await MessageService.filters.message(authentication.id, message);

            return response.status(200).json(filtered);
        }
    );

    /**
     * @alias MessageRoute_CreateMessage
     */
    api.post(Prefix + BaseURI,
        ValidateMiddleware('body', {
            content: 'string',
            topic: 'string',
            receiver_id: 'string',
        }),
        Authenticated(),
        async(request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;
            let content = request.body.content as string;
            let topic = request.body.topic as CreateMessage['topic'];
            let receiver_id = Minify.decode('users', request.body.receiver_id as string);
            let result = await MessageService.insert(authentication.id, receiver_id, content, topic);
            let id = Minify.encode('messages', result.insertId as bigint);

            return response.status(201).json({
                created: true,
                id, 
                path: `${request.path}/${id}`
            });
        }
    );

    /**
     * @alias MessageRoute_UpdateMessage
     */
    api.patch(Prefix + BaseURI + '/:id',
        ValidateMiddleware('params', { id: 'string' }),
        ValidateMiddleware('body', {
            content: 'string',
            topic: 'string',
            receiver_id: 'string',
        }),
        Authenticated(),
        RequiredMiddleware('messages', AllowOwner, 'update-message'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('messages', request.params.id as string)) throw new NotFoundError('Message not found');

            let id = Minify.decode('messages', request.params.id as string);
            let content = request.body.content as string;
            let topic = request.body.topic as CreateMessage['topic'];
            let receiver_id = Minify.decode('users', request.body.receiver_id as string);
            let result = await MessageService.update(id, {
                content,
                topic,
                receiver_id,
            });

            return response.status(204).json({
                updated: true, 
                updated_rows: '' + result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias MessageRoute_DeleteMessage
     */
    api.delete(Prefix + BaseURI + '/:id',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware('messages', 'delete-message'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('messages', request.params.id as string)) throw new NotFoundError('Message not found');

            let id = Minify.decode('messages', request.params.id as string);
            let result = await MessageService.delete(id);

            return response.status(204).json({
                deleted: true, 
                deleted_rows: '' + result.numDeletedRows,
            });
        }
    );

    /**
     * @alias MessageRoute_DeactivateMessage
     */
    api.post(Prefix + BaseURI + '/:id/deactivate',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware('messages', AllowOwner, 'deactivate-message'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('messages', request.params.id as string)) throw new NotFoundError('Message not found');

            let id = Minify.decode('messages', request.params.id as string);
            let result = await MessageService.markAsDeleted(id);

            return response.status(204).json({
                deactivated: true, 
                deactivated_rows: '' + result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias MessageRoute_ReviewMessage
     */
    api.post(Prefix + BaseURI + '/:id/approve',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware('messages', 'approve-message'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('messages', request.params.id as string)) throw new NotFoundError('Message not found');

            let id = Minify.decode('messages', request.params.id as string);
            let result = await MessageService.markAsReviewed(id);

            return response.status(204).json({
                reviewed: true, 
                reviewed_rows: '' + result.numUpdatedRows,
            });
        }
    );

    /**
     * @alias MessageRoute_OutgoingCounts
     */
    api.get(Prefix + BaseURI + '/:id/outgoings/counts',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware('messages/outgoings', AllowOwner, 'view-message'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');

            let id = Minify.decode('users', request.params.id as string);
            let counts = await MessageService.outgoings.counts(id);

            return response.status(204).json({ type: 'message', counts});
        }
    );

    /**
     * @alias MessageRoute_Outgoings
     */
    api.get(Prefix + BaseURI + '/:id/outgoings',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware('messages/outgoings', AllowOwner, 'view-message'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');

            let id = Minify.decode('users', request.params.id as string);
            let authentication: Authentication = request.authentication;
            let {limit, offset} = Pagination.getData(request);
            let total = await MessageService.outgoings.counts(id);
            let messages = await MessageService.outgoings.selects(id, offset, limit);
            let filtered = await MessageService.filters.messages(authentication.id, messages);
            let pagination = Pagination.create(request, filtered, total);

            return response.status(204).json(pagination);
        }
    );

    /**
     * @alias MessageRoute_IncomingCounts
     */
    api.get(Prefix + BaseURI + '/:id/incomings/counts',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware('messages/incomings', AllowOwner, 'view-message'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');

            let id = Minify.decode('users', request.params.id as string);
            let counts = await MessageService.incomings.counts(id);

            return response.status(204).json({ type: 'message', counts});
        }
    );

    /**
     * @alias MessageRoute_Incomings
     */
    api.get(Prefix + BaseURI + '/:id/incomings',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware('messages/incomings', AllowOwner, 'view-message'),
        async(request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');

            let id = Minify.decode('users', request.params.id as string);
            let authentication: Authentication = request.authentication;
            let {limit, offset} = Pagination.getData(request);
            let total = await MessageService.incomings.counts(id);
            let messages = await MessageService.incomings.selects(id, offset, limit);
            let filtered = await MessageService.filters.messages(authentication.id, messages);
            let pagination = Pagination.create(request, filtered, total);

            return response.status(204).json(pagination);
        }
    );
}