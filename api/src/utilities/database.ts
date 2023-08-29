import { Expression, ExpressionBuilder, Kysely, SqlBool } from "kysely";
import { PlanetScaleDialect } from "kysely-planetscale";
import { BlogTable } from "../models/blog.model";
import { CategoryTable } from "../models/category.model";
import { CommentTable } from "../models/comment.model";
import { LikeTable } from "../models/like.model";
import { MessageTable } from "../models/message.model";
import { PermissionTable } from "../models/permission.model";
import { RequestTable } from "../models/request.model";
import { UserCredentialTable, UserDetailTable, UserOptionTable, UserPermissionTable, UserTable } from "../models/user.model";

export type ReferenceType = 'blogs' | 'categories' | 'comments' | 'likes' | 'messages' | 'permissions' | 'requests' | 'users' | 'user_credentials' | 'user_details' | 'user_options' | 'user_permissions';
export type WhereExpressionFactory<DB, TB extends keyof DB> = (eb: ExpressionBuilder<DB, TB>) => Expression<SqlBool>;
export interface DatabaseSchema {
    blogs: BlogTable,
    categories: CategoryTable,
    comments: CommentTable,
    likes: LikeTable,
    messages: MessageTable,
    permissions: PermissionTable,
    requests: RequestTable,
    users: UserTable,
    user_credentials: UserCredentialTable,
    user_details: UserDetailTable,
    user_options: UserOptionTable,
    user_permissions: UserPermissionTable,
}

export const Database = new Kysely<DatabaseSchema>({
    dialect: new PlanetScaleDialect({
      url: process.env.PLANETSCALE_DATABASE_URL
    }),
});

export const DatabaseDateString = (date: Date): string => {
    let year = date.getUTCFullYear();
    let month = date.getUTCMonth() + 1;
    let day = date.getUTCDate();
    let hours = date.getUTCHours();
    let minutes = date.getUTCMinutes();
    let seconds = date.getUTCSeconds();

    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day} ${hours}:${minutes}:${seconds}`;
}