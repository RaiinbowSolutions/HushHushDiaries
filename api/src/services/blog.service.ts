import { DeleteResult, InsertResult, Kysely, Transaction, UpdateResult, WhereExpressionFactory } from "kysely";
import { Database, DatabaseSchema } from "../utilities/database";
import { Blog, CreateBlog, UpdateBlog } from "../models/blog.model";

///////////////////////////////////////////////////////
/// Filters                                         ///
///////////////////////////////////////////////////////

const blogIsListable: WhereExpressionFactory<DatabaseSchema, 'blogs'> = (expressionBuilder) => {
    return expressionBuilder.or([
        expressionBuilder('blogs.deleted', '!=', true),
    ]);
}
const blogLikeIsListable: (commentId: bigint) => WhereExpressionFactory<DatabaseSchema, 'likes'> = (commentId) => {
    return (expressionBuilder) => {
        return expressionBuilder.and([
            expressionBuilder('likes.refecence_id', '=', commentId),
            expressionBuilder('likes.refecence_type', '=', 'blog'),
            expressionBuilder.or([
                expressionBuilder('likes.deleted', '!=', true),
            ]),
        ]);
    };
}

///////////////////////////////////////////////////////
/// Blog Functions                                  ///
///////////////////////////////////////////////////////

async function counts(database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('blogs')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .filterWhere(blogIsListable)
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selects(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Blog[]> {
    let results = await database
    .selectFrom('blogs')
    .selectAll()
    .where(blogIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function select(blogId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Blog> {
    let result = await database
    .selectFrom('blogs')
    .selectAll()
    .where('id', '=', blogId)
    .executeTakeFirstOrThrow();

    return result;
}
async function insert(createBlogData: CreateBlog, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database
    .insertInto('blogs')
    .values(createBlogData)
    .executeTakeFirstOrThrow();

    return result;
}
async function update(blogId: bigint, updateBlogData: UpdateBlog, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('blogs')
    .where('id', '=', blogId)
    .set(updateBlogData)
    .executeTakeFirstOrThrow();

    return result;
}
async function Delete(blogId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('blogs')
    .where('id', '=', blogId)
    .executeTakeFirstOrThrow();

    return result;
}
async function markAsDeleted(blogId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(blogId, {deleted: true, deleted_at: new Date().toUTCString()}, database);
    return result;
}
async function markAsReviewed(blogId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(blogId, {reviewed: true, reviewed_at: new Date().toUTCString()}, database);
    return result;
}
async function markAsApproved(blogId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(blogId, {approved: true, approved_at: new Date().toUTCString()}, database);
    return result;
}
async function markAsPublished(blogId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(blogId, {published: true, published_at: new Date().toUTCString()}, database);
    return result;
}

///////////////////////////////////////////////////////
/// Blog Like Functions                             ///
///////////////////////////////////////////////////////

async function countLikes(blogId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('likes')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .filterWhere(blogLikeIsListable(blogId))
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}

///////////////////////////////////////////////////////
/// Blog Service Setup                              ///
///////////////////////////////////////////////////////

export const PermissionService = {
    counts,
    selects,
    select,
    insert,
    update,
    delete: Delete,
    markAsDeleted,
    markAsReviewed,
    markAsApproved,

    countLikes,
}