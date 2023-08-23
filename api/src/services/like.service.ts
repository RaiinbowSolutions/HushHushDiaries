import { DeleteResult, InsertResult, Kysely, Transaction, UpdateResult, WhereExpressionFactory } from "kysely";
import { Database, DatabaseSchema } from "../utilities/database";
import { CreateLike, Like, UpdateLike } from "../models/like.model";

///////////////////////////////////////////////////////
/// Filters                                         ///
///////////////////////////////////////////////////////

const likeIsListable: WhereExpressionFactory<DatabaseSchema, 'likes'> = (expressionBuilder) => {
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
        .filterWhere(likeIsListable)
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selects(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Like[]> {
    let results = await database
    .selectFrom('likes')
    .selectAll()
    .where(likeIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function select(likeId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Like> {
    let result = await database
    .selectFrom('likes')
    .selectAll()
    .where('id', '=', likeId)
    .executeTakeFirstOrThrow();

    return result;
}
async function insert(createLikeData: CreateLike, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database
    .insertInto('likes')
    .values(createLikeData)
    .executeTakeFirstOrThrow();

    return result;
}
async function update(likeId: bigint, updateLikeData: UpdateLike, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('likes')
    .where('id', '=', likeId)
    .set(updateLikeData)
    .executeTakeFirstOrThrow();

    return result;
}
async function Delete(likeId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('likes')
    .where('id', '=', likeId)
    .executeTakeFirstOrThrow();

    return result;
}
async function markAsDeleted(likeId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
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