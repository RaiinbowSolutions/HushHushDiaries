import { Middleware } from "lambda-api";
import { Authentication } from "./authentication.middleware";
import { ReferenceType } from "../utilities/database";
import { UserService } from "../services/user.service";
import { RequestService } from "../services/request.service";
import { MessageService } from "../services/message.service";
import { CommentService } from "../services/comment.service";
import { BlogService } from "../services/blog.service";
import { ForbiddenError } from "./error.middleware";
import { Minify } from "../utilities/minify";
import { Pagination } from "../utilities/pagination";

export type OwnerReferenceType = 'blogs' | 'blogs/owned' | 'blogs/likes' | 'comments' | 'comments/likes' | 'messages' | 'messages/outgoings' | 'messages/incomings' | 'requests' | 'users' | 'users/options' | 'users/details' | 'users/credentials' | 'users/permissions';
export enum SpecialPermission {
    AllowOwner = 'allow-owner',
    AllowAdmin = 'the-lord-of-the-rings',
}

function hasRequiredPermissions(userPermissions: string[], permissions: (string | SpecialPermission)[]) {
    for (let permission of permissions) {
        if (permission == SpecialPermission.AllowOwner) continue;
        if (!userPermissions.includes(permission)) return false;
    }

    return true;
}

function getReferenceType(ownerReferenceType: OwnerReferenceType): ReferenceType {
    switch(ownerReferenceType) {
        case 'blogs': return 'blogs';
        case 'blogs/owned': return 'users';
        case 'blogs/likes': return 'blogs';
        case 'comments': return 'comments';
        case 'comments/likes': return 'comments';
        case 'messages': return 'messages';
        case 'messages/outgoings': return 'users';
        case 'messages/incomings': return 'users';
        case 'requests': return 'requests';
        case 'users': return 'users';
        case 'users/options': return 'users';
        case 'users/details': return 'users';
        case 'users/credentials': return 'users';
        case 'users/permissions': return 'users';
    }
}

async function isOwner(ownerReferenceType: OwnerReferenceType, as: Authentication['id'], referenceId: bigint, offset: number, limit: number) {
    switch(ownerReferenceType) {
        case 'blogs': return await BlogService.isOwner(referenceId, as);
        case 'blogs/owned': return await BlogService.owned.isOwner(referenceId, as, offset, limit);
        case 'blogs/likes': return await BlogService.likes.isOwner(referenceId, as);
        case 'comments': return await CommentService.isOwner(referenceId, as);
        case 'comments/likes': return await CommentService.likes.isOwner(referenceId, as);
        case 'messages': return await MessageService.isOwner(referenceId, as);
        case 'messages/outgoings': return await MessageService.outgoings.isOwner(referenceId, as, offset, limit);
        case 'messages/incomings': return await MessageService.incomings.isOwner(referenceId, as, offset, limit);
        case 'requests': return await RequestService.isOwner(referenceId, as);
        case 'users': return await UserService.isOwner(referenceId, as);
        case 'users/options': return await UserService.options.isOwner(referenceId, as);
        case 'users/details': return await UserService.details.isOwner(referenceId, as);
        case 'users/credentials': return await UserService.credentials.isOwner(referenceId, as);
        case 'users/permissions': return await UserService.permissions.isOwner(referenceId, as, offset, limit);
    }
}

export const RequiredMiddleware = (ownerReferenceType: OwnerReferenceType | undefined, ...permissions: (string | SpecialPermission)[]): Middleware => {
    return async (request, response, next) => {
        let authentication: Authentication = request.authentication;
        let failed = true;

        if (authentication.permissions.includes(SpecialPermission.AllowAdmin)) return next();
        if (permissions.includes(SpecialPermission.AllowOwner) && ownerReferenceType !== undefined) {
            let referenceType = getReferenceType(ownerReferenceType);
            let referenceId = Minify.decode(referenceType, request.params.id as string);
            let {limit, offset} = Pagination.getData(request);
            let owner = await isOwner(ownerReferenceType, authentication.id, referenceId, offset, limit);

            if (owner) failed = false;
        }

        let allowed = hasRequiredPermissions(authentication.permissions, permissions);
        if (allowed) failed = false;

        if (failed) throw new ForbiddenError('Given authentication does not have required permissions for this action');
        return next();
    }
};