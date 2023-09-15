import { DeleteResult, InsertResult, Kysely, Transaction, UpdateResult } from "kysely";
import { Database, DatabaseDateString, DatabaseSchema, ReferenceType, WhereExpressionFactory } from "../utilities/database";
import { SelectComment, CreateComment, UpdateComment, Comment } from "../models/comment.model";
import { CreateLike, SelectLike } from "../models/like.model";
import { SelectUser } from "../models/user.model";
import { Minify } from "../utilities/minify";

///////////////////////////////////////////////////////
/// Default Templates                               ///
///////////////////////////////////////////////////////

const DefualtComment: Omit<CreateComment, 'author_id' | 'content' | 'refecence_type' | 'refecence_id'> = {
    deleted: false,
    approved: false,
    reviewed: false,
}
const DefualtLike: Omit<CreateLike, 'user_id' | 'refecence_type' | 'refecence_id'> = {
    deleted: false,
}

///////////////////////////////////////////////////////
/// Filters                                         ///
///////////////////////////////////////////////////////

const CommentIsListable: WhereExpressionFactory<DatabaseSchema, 'comments'> = (expressionBuilder) => {
    return expressionBuilder.or([
        expressionBuilder('comments.deleted', '!=', true),
    ]);
}
const CommentLikeIsListable: (commentId: SelectLike['refecence_id']) => WhereExpressionFactory<DatabaseSchema, 'likes'> = (commentId) => {
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
        .as('total')
    )
    .where(CommentIsListable)
    .executeTakeFirstOrThrow();

    return BigInt(result.total);
}
async function selects(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectComment[]> {
    let results = await database
    .selectFrom('comments')
    .selectAll()
    .where(CommentIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function select(commentId: SelectComment['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectComment> {
    let result = await database
    .selectFrom('comments')
    .selectAll()
    .where('id', '=', commentId)
    .executeTakeFirstOrThrow();

    return result;
}
async function insert(userId: CreateComment['author_id'], content: CreateComment['content'], referenceType: CreateComment['refecence_type'], referenceId: CreateComment['refecence_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database
    .insertInto('comments')
    .values({...DefualtComment, author_id: userId, content, refecence_type: referenceType, refecence_id: referenceId})
    .executeTakeFirstOrThrow();

    return result;
}
async function update(commentId: SelectComment['id'], updateCommentData: UpdateComment, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('comments')
    .where('id', '=', commentId)
    .set(updateCommentData)
    .executeTakeFirstOrThrow();

    return result;
}
async function Delete(commentId: SelectComment['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('comments')
    .where('id', '=', commentId)
    .executeTakeFirstOrThrow();

    return result;
}
async function markAsDeleted(commentId: SelectComment['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(commentId, {deleted: true, deleted_at: DatabaseDateString(new Date())}, database);
    return result;
}
async function markAsReviewed(commentId: SelectComment['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(commentId, {reviewed: true, reviewed_at: DatabaseDateString(new Date())}, database);
    return result;
}
async function markAsApproved(commentId: SelectComment['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(commentId, {approved: true, approved_at: DatabaseDateString(new Date())}, database);
    return result;
}
async function isOwnerOfComment(commentId: SelectComment['id'], ownerId: SelectUser['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<boolean> {
    let result = await database
    .selectFrom('comments')
    .selectAll()
    .where((expressionBuilder) => expressionBuilder.and([
        expressionBuilder('id', '=', commentId),
        expressionBuilder('author_id', '=', ownerId)
    ]))
    .executeTakeFirst();

    return result !== undefined;
}

///////////////////////////////////////////////////////
/// Comment Like Functions                          ///
///////////////////////////////////////////////////////

async function countLikes(commentId: SelectLike['refecence_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('likes')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .as('total')
    )
    .where(CommentLikeIsListable(commentId))
    .executeTakeFirstOrThrow();

    return BigInt(result.total);
}
async function addLike(userId: SelectLike['user_id'], commentId: SelectLike['refecence_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult | UpdateResult> {
    let updateResult = await database
    .updateTable('likes')
    .where((expressionBuilder) => expressionBuilder.and([
        expressionBuilder('user_id', '=', userId),
        expressionBuilder('refecence_id', '=', commentId),
        expressionBuilder('refecence_type', '=', 'comment'),
    ]))
    .set({deleted: false, deleted_at: undefined})
    .executeTakeFirst();

    if (updateResult.numUpdatedRows > 0) return updateResult;

    let insertResult = await database
    .insertInto('likes')
    .values({...DefualtLike, user_id: userId, refecence_id: commentId, refecence_type: 'comment'})
    .executeTakeFirstOrThrow();

    return insertResult;
}
async function removeLike(userId: SelectLike['user_id'], commentId: SelectLike['refecence_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('likes')
    .where((expressionBuilder) => expressionBuilder.and([
        expressionBuilder('user_id', '=', userId),
        expressionBuilder('refecence_id', '=', commentId),
        expressionBuilder('refecence_type', '=', 'comment'),
        expressionBuilder('deleted', '!=', true),
    ]))
    .set({deleted: true, deleted_at: DatabaseDateString(new Date())})
    .executeTakeFirst();

    return result;
}
async function isOwnerOfLike(commentId: SelectLike['refecence_id'], ownerId: SelectUser['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<boolean> {
    let result = await database
    .selectFrom('likes')
    .selectAll()
    .where((expressionBuilder) => expressionBuilder.and([
        expressionBuilder('user_id', '=', ownerId),
        expressionBuilder('refecence_id', '=', commentId),
        expressionBuilder('refecence_type', '=', 'comment'),
        expressionBuilder('deleted', '!=', true),
    ]))
    .executeTakeFirst();

    return result !== undefined;
}

///////////////////////////////////////////////////////
/// Comment Filter Functions                        ///
///////////////////////////////////////////////////////

async function filterComments(as: SelectUser['id'], comments: SelectComment[], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Comment[]> {
    let results = await database.transaction().execute(async (transaction) => {
        let filtered: Comment[] = [];

        for (let comment of comments) filtered.push(await filterComment(as, comment, transaction));

        return filtered;
    })

    return results;
}
async function filterComment(as: SelectUser['id'], comment: SelectComment, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Comment> {
    let id = Minify.encode('comments', comment.id);
    let author_id = Minify.encode('users', comment.author_id);
    let refecenceType: ReferenceType = comment.refecence_type === 'blog' ? 'blogs' : 'comments';
    let refecence_id = Minify.encode(refecenceType, comment.refecence_id);

    return {
        ...comment,
        id,
        author_id,
        refecence_id,
    }
}

///////////////////////////////////////////////////////
/// Comment Service Setup                           ///
///////////////////////////////////////////////////////

export const CommentService = {
    counts,
    selects,
    select,
    insert,
    update,
    delete: Delete,
    markAsDeleted,
    markAsReviewed,
    markAsApproved,
    isOwner: isOwnerOfComment,
    likes: {
        counts: countLikes,
        add: addLike,
        remove: removeLike,
        isOwner: isOwnerOfLike,
    },
    filters: {
        comments: filterComments,
        comment: filterComment,
    }
}