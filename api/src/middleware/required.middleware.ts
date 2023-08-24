import { Middleware } from "lambda-api";
import { Validation } from '../utilities/validation';
import { Authentication } from "./authentication.middleware";
import { ReferenceType } from "../utilities/database";
import { UserService } from "../services/user.service";
import { RequestService } from "../services/request.service";
import { MessageService } from "../services/message.service";
import { LikeService } from "../services/like.service";
import { CommentService } from "../services/comment.service";
import { BlogService } from "../services/blog.service";

export enum SpecialPermission {
    AllowOwner = 'allow-owner',
}

const HasPermissions = (userPermissions: string[], permissions: (string | SpecialPermission)[]) => {
    for (let permission of permissions) {
        if (permission == SpecialPermission.AllowOwner) continue;
        if (!(permission in userPermissions)) return false;
    }

    return true;
}

const IsOwner = async (as: Authentication['id'], referenceType: ReferenceType, referenceId: bigint): Promise<boolean> => {
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
        let referenceId = Validation.id(request);
        let allowOwner = SpecialPermission.AllowOwner in permissions;
        let allowed = HasPermissions(authentication.permissions, permissions);
        let isOwner = await IsOwner(authentication.id, referenceType, referenceId);

        if (isOwner && allowOwner) return next();
        if (allowed) return next();

        throw new Error(); // Needs a better error definition
    }
};