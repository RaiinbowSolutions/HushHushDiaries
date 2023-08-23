import { DeleteResult, InsertResult, Kysely, Transaction, UpdateResult, WhereExpressionFactory } from "kysely";
import { Database, DatabaseSchema } from "../utilities/database";
import { Comment, CreateComment, UpdateComment } from "../models/comment.model";

///////////////////////////////////////////////////////
/// Filters                                         ///
///////////////////////////////////////////////////////

const commentIsListable: WhereExpressionFactory<DatabaseSchema, 'comments'> = (expressionBuilder) => {
    return expressionBuilder.or([
        expressionBuilder('comments.deleted', '!=', true),
    ]);
}
const commentLikeIsListable: (commentId: bigint) => WhereExpressionFactory<DatabaseSchema, 'likes'> = (commentId) => {
    return (expressionBuilder) => {
        return expressionBuilder.and([
            expressionBuilder('likes.refecence_id', '=', commentId),
            expressionBuilder('likes.refecence_type', '=', 'comment'),
            expressionBuilder.or([
                expressionBuilder('likes.deleted', '!=', true),
            ]),
        ]);
    };
}

///////////////////////////////////////////////////////
/// Comment Functions                               ///
///////////////////////////////////////////////////////

async function counts(database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('comments')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .filterWhere(commentIsListable)
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selects(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Comment[]> {
    let results = await database
    .selectFrom('comments')
    .selectAll()
    .where(commentIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function select(commentId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Comment> {
    let result = await database
    .selectFrom('comments')
    .selectAll()
    .where('id', '=', commentId)
    .executeTakeFirstOrThrow();

    return result;
}
async function insert(createCommentData: CreateComment, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database
    .insertInto('comments')
    .values(createCommentData)
    .executeTakeFirstOrThrow();

    return result;
}
async function update(commentId: bigint, updateCommentData: UpdateComment, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('comments')
    .where('id', '=', commentId)
    .set(updateCommentData)
    .executeTakeFirstOrThrow();

    return result;
}
async function Delete(commentId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('comments')
    .where('id', '=', commentId)
    .executeTakeFirstOrThrow();

    return result;
}
async function markAsDeleted(commentId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(commentId, {deleted: true, deleted_at: new Date().toUTCString()}, database);
    return result;
}
async function markAsReviewed(commentId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(commentId, {reviewed: true, reviewed_at: new Date().toUTCString()}, database);
    return result;
}
async function markAsApproved(commentId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(commentId, {approved: true, approved_at: new Date().toUTCString()}, database);
    return result;
}

///////////////////////////////////////////////////////
/// Comment Like Functions                          ///
///////////////////////////////////////////////////////

async function countLikes(commentId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('likes')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .filterWhere(commentLikeIsListable(commentId))
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}

///////////////////////////////////////////////////////
/// Comment Service Setup                           ///
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