import { DeleteResult, InsertResult, Kysely, Transaction, UpdateResult, WhereExpressionFactory } from "kysely";
import { Database, DatabaseSchema } from "../utilities/database";
import { CreateLike, Like, UpdateLike } from "../models/like.model";

///////////////////////////////////////////////////////
/// Default Templates                               ///
///////////////////////////////////////////////////////

const DefualtLike: Omit<CreateLike, 'user_id' | 'refecence_type' | 'refecence_id'> = {
    deleted: false,
}

///////////////////////////////////////////////////////
/// Filters                                         ///
///////////////////////////////////////////////////////

const LikeIsListable: WhereExpressionFactory<DatabaseSchema, 'likes'> = (expressionBuilder) => {
    return expressionBuilder.or([
        expressionBuilder('likes.deleted', '!=', true),
    ]);
}

///////////////////////////////////////////////////////
/// Like Functions                                  ///
///////////////////////////////////////////////////////

async function counts(database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('likes')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .filterWhere(LikeIsListable)
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selects(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Like[]> {
    let results = await database
    .selectFrom('likes')
    .selectAll()
    .where(LikeIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function select(likeId: Like['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Like> {
    let result = await database
    .selectFrom('likes')
    .selectAll()
    .where('id', '=', likeId)
    .executeTakeFirstOrThrow();

    return result;
}
async function insert(userId: CreateLike['user_id'], referenceType: CreateLike['refecence_type'], referenceId: CreateLike['refecence_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult | UpdateResult> {
    let updateResult = await database
    .updateTable('likes')
    .where((expressionBuilder) => expressionBuilder.and([
        expressionBuilder('user_id', '=', userId),
        expressionBuilder('refecence_type', '=', referenceType),
        expressionBuilder('refecence_id', '=', referenceId)
    ]))
    .set({deleted: false, deleted_at: undefined})
    .executeTakeFirst();

    if (updateResult.numUpdatedRows > 0) return updateResult;
    
    let result = await database
    .insertInto('likes')
    .values({...DefualtLike, user_id: userId, refecence_type: referenceType, refecence_id: referenceId})
    .executeTakeFirstOrThrow();

    return result;
}
async function update(likeId: Like['id'], updateLikeData: UpdateLike, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('likes')
    .where('id', '=', likeId)
    .set(updateLikeData)
    .executeTakeFirstOrThrow();

    return result;
}
async function Delete(likeId: Like['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('likes')
    .where('id', '=', likeId)
    .executeTakeFirstOrThrow();

    return result;
}
async function markAsDeleted(likeId: Like['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(likeId, {deleted: true, deleted_at: new Date().toUTCString()}, database);
    return result;
}

///////////////////////////////////////////////////////
/// Like Service Setup                              ///
///////////////////////////////////////////////////////

export const LikeService = {
    counts,
    selects,
    select,
    insert,
    update,
    delete: Delete,
    markAsDeleted,
}