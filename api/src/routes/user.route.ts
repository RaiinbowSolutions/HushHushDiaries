import { API, RegisterOptions, Request, Response } from 'lambda-api';
import { AuthenticatedMiddleware as Authenticated } from '../middleware/authenticated.middleware';
import { UserService } from '../services/user.service';
import { Validation } from '../utilities/validation';
import { Authentication } from '../middleware/authentication.middleware';
import { ValidateMiddleware } from '../middleware/validate.middleware';
import { Pagination } from '../utilities/pagination';
import { Minify } from '../utilities/minify';
import { BadRequestError, NotFoundError } from '../middleware/error.middleware';
import { Encryption } from '../utilities/encryption';
import { RequiredMiddleware, SpecialPermission } from '../middleware/required.middleware';
import { PermissionService } from '../services/permission.service';

const AllowOwner = SpecialPermission.AllowOwner;

export const UserRoute = (api: API, options: RegisterOptions | undefined) => {
    const Prefix = options?.prefix || '';
    const BaseURI = '/users';

    /**
     * @alias UserRoute_GetCounts
     */
    api.get(Prefix + BaseURI + '/counts',
        Authenticated(),
        async (request: Request, response: Response) => {
            let counts = await UserService.counts();

            return response.status(200).json({type: 'user', counts});
        }
    );

    /**
     * @alias UserRoute_GetUsers
     */
    api.get(Prefix + BaseURI,
        ValidateMiddleware('query', {
            page: { type: 'number', required: false },
            limit: { type: 'number', required: false },
        }),
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;
            let {limit, offset} = Pagination.getData(request);
            let total = await UserService.counts();
            let users = await UserService.selects(offset, limit);
            let filtered = await UserService.filters.users(authentication.id, users);
            let pagination = Pagination.create(request, filtered, total);
    
            return response.status(200).json(pagination);
        }
    );

    /**
     * @alias UserRoute_GetUser
     */
    api.get(Prefix + BaseURI + '/:id',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        async (request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');

            let authentication: Authentication = request.authentication;
            let id = Minify.decode('users', request.params.id as string);
            let user = await UserService.select(id);
            let filtered = await UserService.filters.user(authentication.id, user);

            return response.status(200).json(filtered);
        }
    );

    /**
     * @alias UserRoute_GetUserId_by_Email
     */
    api.post(Prefix + BaseURI + '/email',
        ValidateMiddleware('body', { email: 'string' }),
        async (request: Request, response: Response) => {
            if (!Validation.email(request.body.email as string)) throw new BadRequestError(`Given 'email' is not an valid email address`);

            let id = await UserService.findUserIdByEmail(request.body.email as string);

            return response.status(200).json({id: id ? Minify.encode('users', id) : null});
        }
    );

    /**
     * @alias UserRoute_CreateUser
     */
    api.post(Prefix + BaseURI,
        ValidateMiddleware('body', {
            email: 'string',
            password: 'string',
        }),
        async (request: Request, response: Response) => {
            if (!Validation.email(request.body.email as string)) throw new BadRequestError(`Given 'email' is not an valid email address`);

            let emailExist = await UserService.findUserIdByEmail(request.body.email as string);

            if (emailExist !== undefined) throw new BadRequestError(`Given 'email' is already in use`);

            let email = request.body.email as string;
            let password = request.body.password as string;
            let salt = Encryption.generateSalt();
            let hash = Encryption.hashing(password, salt);
            let result = await UserService.insert(email, hash, salt);
            let id = Minify.encode('users', result.insertId as bigint);

            return response.status(201).json({
                created: true,
                id,
                path: `${request.path}/${id}`,
            });
        }
    )

    /**
     * @alias UserRoute_UpdateUser
     */
    api.patch(Prefix + BaseURI + '/:id',
        ValidateMiddleware('params', { id: 'string' }),
        ValidateMiddleware('body', {
            email: { type: 'string', required: false },
            username: { type: 'string', required: false },
            anonym: { type: 'boolean', required: false },
        }),
        Authenticated(),
        RequiredMiddleware('users', AllowOwner, 'update-user'),
        async (request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');

            let id = Minify.decode('users', request.params.id as string);
            let email = request.body.email as string | undefined;
            let username = request.body.username as string | undefined;
            let anonym = request.body.anonym as boolean | undefined;

            if (email !== undefined && !Validation.email(email)) throw new BadRequestError(`Given 'email' is not an valid email address`);
            if (email !== undefined) {
                let user = await UserService.select(id);
                let emailExist = await UserService.findUserIdByEmail(email);

                if (emailExist !== undefined && user.email !== email) throw new BadRequestError(`Given 'email' is already in use`);
            }

            let result = await UserService.update(id, {
                email,
                username,
                anonym,
            });

            return response.status(204).json({
                updated: true,
                updated_rows: '' + result.numUpdatedRows,
            });
        }
    )

    /**
     * @alias UserRoute_DeleteUser
     */
    api.delete(Prefix + BaseURI + '/:id',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware(undefined, 'delete-user'),
        async (request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');

            let id = Minify.decode('users', request.params.id as string);
            let result = await UserService.delete(id);

            return response.status(200).json({
                deleted: true,
                deleted_rows: '' + result.numDeletedRows,
            });
        }
    )

    /**
     * @alias UserRoute_DeactivateUser
     */
    api.post(Prefix + BaseURI + '/:id/deactivate',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware('users', AllowOwner, 'deactivate-user'),
        async (request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');

            let id = Minify.decode('users', request.params.id as string);
            let result = await UserService.markAsDeleted(id);

            return response.status(204).json({
                deactivated: true,
                deactivated_rows: '' + result.numUpdatedRows,
            });
        }
    )

    /**
     * @alias UserRoute_BanUser
     */
    api.post(Prefix + BaseURI + '/:id/ban',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware(undefined, 'ban-user'),
        async (request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');

            let id = Minify.decode('users', request.params.id as string);
            let result = await UserService.markAsBanned(id);

            return response.status(204).json({
                banned: true,
                banned_rows: '' + result.numUpdatedRows,
            });
        }
    )

    /**
     * @alias UserRoute_ValidateUser
     */
    api.post(Prefix + BaseURI + '/:id/validate',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        RequiredMiddleware('users', AllowOwner, 'validate-user'),
        async (request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');

            let id = Minify.decode('users', request.params.id as string);
            let result = await UserService.markAsValidated(id);

            return response.status(204).json({
                validated: true,
                validated_rows: '' + result.numUpdatedRows,
            });
        }
    )

    /**
     * @alias UserRoute_GetUserOption
     */
    api.get(Prefix + BaseURI + '/:id/option',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        async (request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');

            let authentication: Authentication = request.authentication;
            let id = Minify.decode('users', request.params.id as string);
            let option = await UserService.options.select(id);
            let filtered = await UserService.filters.userOption(authentication.id, option);

            return response.status(200).json(filtered);
        }
    )

    /**
     * @alias UserRoute_UpdateUserOption
     */
    api.patch(Prefix + BaseURI + '/:id/option',
        ValidateMiddleware('params', { id: 'string' }),
        ValidateMiddleware('body', {
            font_size: { type: 'string', required: false },
            design_tempature: { type: 'string', required: false },
            email_show_state: { type: 'string', required: false },
            username_show_state: { type: 'string', required: false },
            firstname_show_state: { type: 'string', required: false },
            lastname_show_state: { type: 'string', required: false },
            birthday_show_state: { type: 'string', required: false },
            gender_show_state: { type: 'string', required: false },
            pronouns_show_state: { type: 'string', required: false },
            profile_description_show_state: { type: 'string', required: false },
        }),
        Authenticated(),
        RequiredMiddleware('users/options', AllowOwner, 'update-user-option'),
        async (request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');

            let id = Minify.decode('users', request.params.id as string);
            let font_size = request.body.font_size;
            let design_tempature = request.body.design_tempature;
            let email_show_state = request.body.email_show_state;
            let username_show_state = request.body.username_show_state;
            let firstname_show_state = request.body.firstname_show_state;
            let lastname_show_state = request.body.lastname_show_state;
            let birthday_show_state = request.body.birthday_show_state;
            let gender_show_state = request.body.gender_show_state;
            let pronouns_show_state = request.body.pronouns_show_state;
            let profile_description_show_state = request.body.profile_description_show_state;
            let result = await UserService.options.update(id, {
                font_size,
                design_tempature,
                email_show_state,
                username_show_state,
                firstname_show_state,
                lastname_show_state,
                birthday_show_state,
                gender_show_state,
                pronouns_show_state,
                profile_description_show_state,
            });

            return response.status(204).json({
                updated: true,
                updated_rows: '' + result.numUpdatedRows,
            });
        }
    )

    /**
     * @alias UserRoute_GetUserDetail
     */
    api.get(Prefix + BaseURI + '/:id/detail',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        async (request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');

            let authentication: Authentication = request.authentication;
            let id = Minify.decode('users', request.params.id as string);
            let detail = await UserService.details.select(id);
            let filtered = await UserService.filters.userDetial(authentication.id, detail);

            return response.status(200).json(filtered);
        }
    )

    /**
     * @alias UserRoute_UpdateUserDetail
     */
    api.patch(Prefix + BaseURI + '/:id/detail',
        ValidateMiddleware('params', { id: 'string' }),
        ValidateMiddleware('body', {
            firstname: { type: 'string', required: false },
            lastname: { type: 'string', required: false },
            birthday: { type: 'date', required: false },
            gender: { type: 'string', required: false },
            pronouns: { type: 'string', required: false },
            profile_description: { type: 'string', required: false },
        }),
        Authenticated(),
        RequiredMiddleware('users/details', AllowOwner, 'update-user-detail'),
        async (request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');

            let id = Minify.decode('users', request.params.id as string);
            let firstname = request.body.firstname;
            let lastname = request.body.lastname;
            let birthday = request.body.birthday;
            let gender = request.body.gender;
            let pronouns = request.body.pronouns;
            let profile_description = request.body.profile_description;
            let result = await UserService.details.update(id, {
                firstname,
                lastname,
                birthday,
                gender,
                pronouns,
                profile_description,
            });

            return response.status(204).json({
                updated: true,
                updated_rows: '' + result.numUpdatedRows,
            });
        }
    )

    /**
     * @alias UserRoute_UpdateUserCredential
     */
    api.patch(Prefix + BaseURI + '/:id/credential',
        ValidateMiddleware('params', { id: 'string' }),
        ValidateMiddleware('body', { password: 'string' }),
        Authenticated(),
        RequiredMiddleware('users/credentials', AllowOwner, 'update-user-credential'),
        async (request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');

            let id = Minify.decode('users', request.params.id as string);
            let password = request.body.password as string;
            let salt = Encryption.generateSalt();
            let hash = Encryption.hashing(password, salt);
            let result = await UserService.credentials.update(id, {
                password: hash,
                salt,
            });

            return response.status(204).json({
                updated: true,
                updated_rows: '' + result.numUpdatedRows,
            })
        }
    )

    /**
     * @alias UserRoute_UserPermissionCounts
     */
    api.get(Prefix + BaseURI + '/:id/permissions/counts',
        ValidateMiddleware('params', { id: 'string' }),
        Authenticated(),
        async (request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');

            let id = Minify.decode('users', request.params.id as string);
            let counts = await UserService.permissions.counts(id);

            return response.status(200).json({type: 'permission', counts});
        }
    )

    /**
     * @alias UserRoute_UserPermissions
     */
    api.get(Prefix + BaseURI + '/:id/permissions',
        ValidateMiddleware('params', { id: 'string' }),
        ValidateMiddleware('query', {
            page: { type: 'number', required: false },
            limit: { type: 'number', required: false },
        }),
        Authenticated(),
        async (request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');

            let id = Minify.decode('users', request.params.id as string);
            let authentication: Authentication = request.authentication;
            let {limit, offset} = Pagination.getData(request);
            let total = await UserService.permissions.counts(id);
            let permissions = await UserService.permissions.selects(id, offset, limit);
            let filtered = await PermissionService.filters.permissions(authentication.id, permissions);
            let pagination = Pagination.create(request, filtered, total);
    
            return response.status(200).json(pagination);
        }
    )

    /**
     * @alias UserRoute_AddUserPermission
     */
    api.post(Prefix + BaseURI + '/:id/permissions/:permission_id',
        ValidateMiddleware('params', { id: 'string', permission_id: 'string' }),
        Authenticated(),
        RequiredMiddleware(undefined, 'add-user-permission'),
        async (request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');
            if (!Minify.validate('permissions', request.params.permission_id as string)) throw new NotFoundError('Permission not found');

            let id = Minify.decode('users', request.params.id as string);
            let permission_id = Minify.decode('permissions', request.params.permission_id as string);
            let result = await UserService.permissions.add(id, permission_id);

            return response.status(204).json({
                created: 'insertId' in result,
            });
        }
    )

    /**
     * @alias UserRoute_RemoveUserPermission
     */
    api.delete(Prefix + BaseURI + '/:id/permissions/:permission_id',
        ValidateMiddleware('params', { id: 'string', permission_id: 'string' }),
        Authenticated(),
        RequiredMiddleware(undefined, 'remove-user-permission'),
        async (request: Request, response: Response) => {
            if (!Minify.validate('users', request.params.id as string)) throw new NotFoundError('User not found');
            if (!Minify.validate('permissions', request.params.permission_id as string)) throw new NotFoundError('Permission not found');

            let id = Minify.decode('users', request.params.id as string);
            let permission_id = Minify.decode('permissions', request.params.permission_id as string);
            let result = await UserService.permissions.remove(id, permission_id);

            return response.status(204).json({
                removed: result.numUpdatedRows > 0,
            });
        }
    )
}