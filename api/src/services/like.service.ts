import 'dotenv/config';
import { DeleteResult, InsertResult, Kysely, Transaction, UpdateResult, WhereExpressionFactory } from "kysely";
import { Database, DatabaseSchema } from "../utilities/database";
import { CreateLike, Like, SelectLike, UpdateLike } from "../models/like.model";
import { SelectUser } from '../models/user.model';
import HashIdsContructor from 'hashids';

const Salt = process.env.HASH_ID_SALT || undefined;
const MinLength = Number(process.env.HASH_ID_MIN_LENGTH) || 8;
const Alphabet = process.env.HASH_ID_ALPHABET || undefined;
const HashIds = new HashIdsContructor(Salt, MinLength, Alphabet);

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
async function selects(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectLike[]> {
    let results = await database
    .selectFrom('likes')
    .selectAll()
    .where(LikeIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function select(likeId: SelectLike['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectLike> {
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
async function update(likeId: SelectLike['id'], updateLikeData: UpdateLike, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('likes')
    .where('id', '=', likeId)
    .set(updateLikeData)
    .executeTakeFirstOrThrow();

    return result;
}
async function Delete(likeId: SelectLike['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('likes')
    .where('id', '=', likeId)
    .executeTakeFirstOrThrow();

    return result;
}
async function markAsDeleted(likeId: SelectLike['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(likeId, {deleted: true, deleted_at: new Date().toUTCString()}, database);
    return result;
}

///////////////////////////////////////////////////////
/// Like Filter Functions                           ///
///////////////////////////////////////////////////////

async function filterLikes(as: SelectUser['id'], likes: SelectLike[], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Like[]> {
    let results = await database.transaction().execute(async (transaction) => {
        let filtered: Like[] = [];

        for (let like of likes) filtered.push(await filterLike(as, like, transaction));

        return filtered;
    })

    return results;
}
async function filterLike(as: SelectUser['id'], like: SelectLike, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Like> {
    let id = HashIds.encode(like.id);
    let user_id = HashIds.encode(like.user_id);
    let refecence_id = HashIds.encode(like.refecence_id);

    return {
        ...like,
        id,
        user_id,
        refecence_id,
    }
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
    filters: {
        likes: filterLikes,
        like: filterLike,
    }
}