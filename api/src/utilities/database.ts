import { Kysely } from "kysely";
import { PlanetScaleDialect } from "kysely-planetscale";
import { BlogTable } from "../models/blog.model";
import { CategoryTable } from "../models/category.model";
import { CommentTable } from "../models/comment.model";
import { LikeTable } from "../models/like.model";
import { MessageTable } from "../models/message.model";
import { PermissionTable } from "../models/permission.model";
import { RequestTable } from "../models/request.model";
import { UserCredentialTable, UserDetailTable, UserOptionTable, UserPermissionTable, UserTable } from "../models/user.model";

export interface DatabaseSchema {
    blogs: BlogTable,
    categories: CategoryTable,
    comments: CommentTable,
    likes: LikeTable,
    messages: MessageTable,
    permisions: PermissionTable,
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