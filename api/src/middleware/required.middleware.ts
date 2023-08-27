import { Middleware } from "lambda-api";
import { Authentication } from "./authentication.middleware";
import { ReferenceType } from "../utilities/database";
import { UserService } from "../services/user.service";
import { RequestService } from "../services/request.service";
import { MessageService } from "../services/message.service";
import { LikeService } from "../services/like.service";
import { CommentService } from "../services/comment.service";
import { BlogService } from "../services/blog.service";
import { ForbiddenError } from "./error.middleware";
import { Minify } from "../utilities/minify";

export enum SpecialPermission {
    AllowOwner = 'allow-owner',
}

function hasRequiredPermissions(userPermissions: string[], permissions: (string | SpecialPermission)[]) {
    for (let permission of permissions) {
        if (permission == SpecialPermission.AllowOwner) continue;
        if (!userPermissions.includes(permission)) return false;
    }

    return true;
}

async function isOwner(as: Authentication['id'], referenceType: ReferenceType, referenceId: bigint) {
    if (referenceType == 'users') {
        let user = await UserService.select(referenceId);
        return as == user.id;
    }

    if (referenceType == 'user_options') {
        let option = await UserService.options.selectOption(referenceId);
        return as == option.user_id;
    }

    if (referenceType == 'user_details') {
        let detail = await UserService.details.selectDetail(referenceId);
        return as == detail.user_id;
    }

    if (referenceType == 'user_credentials') {
        let credential = await UserService.credentials.selectCredential(referenceId);
        return as == credential.user_id;
    }

    if (referenceType == 'requests') {
        let request = await RequestService.select(referenceId);
        return as == request.sender_id;
    }

    if (referenceType == 'messages') {
        let message = await MessageService.select(referenceId);
        return as == message.sender_id || as == message.receiver_id;
    }

    if (referenceType == 'likes') {
        let like = await LikeService.select(referenceId);
        return as == like.user_id;
    }

    if (referenceType == 'comments') {
        let comment = await CommentService.select(referenceId);
        return as == comment.author_id;
    }

    if (referenceType == 'blogs') {
        let blog = await BlogService.select(referenceId);
        return as == blog.author_id;
    }

    return false;
}

export const RequiredMiddleware = (referenceType: ReferenceType, ...permissions: (string | SpecialPermission)[]): Middleware => {
    return async (request, response, next) => {
        let authentication: Authentication = request.authentication;
        let referenceId = Minify.decode(referenceType, request.params.id as string);
        let failed = true;

        if (permissions.includes(SpecialPermission.AllowOwner)) {
            let owner = await isOwner(authentication.id, referenceType, referenceId);
            if (owner) failed = false; 
        }

        let allowed = hasRequiredPermissions(authentication.permissions, permissions);
        if (allowed) failed = false;

        if (failed) throw new ForbiddenError('Given authentication does not have required permissions for this action');
        return next();
    }
};