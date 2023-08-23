import { DeleteResult, InsertResult, Kysely, Transaction, UpdateResult, WhereExpressionFactory } from "kysely";
import { Database, DatabaseSchema } from "../utilities/database";
import { CreateRequest, Request, UpdateRequest } from "../models/request.model";

///////////////////////////////////////////////////////
/// Filters                                         ///
///////////////////////////////////////////////////////

const requestIsListable: WhereExpressionFactory<DatabaseSchema, 'requests'> = (expressionBuilder) => {
    return expressionBuilder.or([
        expressionBuilder('requests.deleted', '!=', true),
    ]);
}

///////////////////////////////////////////////////////
/// Request Functions                               ///
///////////////////////////////////////////////////////

async function counts(database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('requests')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .filterWhere(requestIsListable)
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selects(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Request[]> {
    let results = await database
    .selectFrom('requests')
    .selectAll()
    .where(requestIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function select(requestId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Request> {
    let result = await database
    .selectFrom('requests')
    .selectAll()
    .where('id', '=', requestId)
    .executeTakeFirstOrThrow();

    return result;
}
async function insert(createRequestData: CreateRequest, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database
    .insertInto('requests')
    .values(createRequestData)
    .executeTakeFirstOrThrow();

    return result;
}
async function update(requestId: bigint, updateRequestData: UpdateRequest, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('requests')
    .where('id', '=', requestId)
    .set(updateRequestData)
    .executeTakeFirstOrThrow();

    return result;
}
async function Delete(requestId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('requests')
    .where('id', '=', requestId)
    .executeTakeFirstOrThrow();

    return result;
}
async function markAsDeleted(requestId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(requestId, {deleted: true, deleted_at: new Date().toUTCString()}, database);
    return result;
}
async function markAsReviewed(requestId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(requestId, {reviewed: true, reviewed_at: new Date().toUTCString()}, database);
    return result;
}

///////////////////////////////////////////////////////
/// Request Service Setup                           ///
///////////////////////////////////////////////////////

export const RequestService = {
    counts,
    selects,
    select,
    insert,
    update,
    delete: Delete,
    markAsDeleted,
    markAsReviewed,
}