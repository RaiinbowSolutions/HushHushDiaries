import { DeleteResult, InsertResult, Kysely, Transaction, UpdateResult, WhereExpressionFactory } from "kysely";
import { Database, DatabaseSchema } from "../utilities/database";
import { CreateRequest, Request, UpdateRequest } from "../models/request.model";

///////////////////////////////////////////////////////
/// Default Templates                               ///
///////////////////////////////////////////////////////

const DefaultRequest: Omit<CreateRequest, 'sender_id' | 'content' | 'topic' | 'reference_type' | 'reference_id'> = {
    deleted: false,
    reviewed: false,
}

///////////////////////////////////////////////////////
/// Filters                                         ///
///////////////////////////////////////////////////////

const RequestIsListable: WhereExpressionFactory<DatabaseSchema, 'requests'> = (expressionBuilder) => {
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
        .filterWhere(RequestIsListable)
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selects(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Request[]> {
    let results = await database
    .selectFrom('requests')
    .selectAll()
    .where(RequestIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function select(requestId: Request['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Request> {
    let result = await database
    .selectFrom('requests')
    .selectAll()
    .where('id', '=', requestId)
    .executeTakeFirstOrThrow();

    return result;
}
async function insert(userId: CreateRequest['sender_id'], content: CreateRequest['content'], topic: CreateRequest['topic'], referenceType: CreateRequest['reference_type'], referenceId: CreateRequest['reference_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database
    .insertInto('requests')
    .values({...DefaultRequest, sender_id: userId, content, topic, reference_type: referenceType, reference_id: referenceId})
    .executeTakeFirstOrThrow();

    return result;
}
async function update(requestId: Request['id'], updateRequestData: UpdateRequest, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('requests')
    .where('id', '=', requestId)
    .set(updateRequestData)
    .executeTakeFirstOrThrow();

    return result;
}
async function Delete(requestId: Request['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('requests')
    .where('id', '=', requestId)
    .executeTakeFirstOrThrow();

    return result;
}
async function markAsDeleted(requestId: Request['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(requestId, {deleted: true, deleted_at: new Date().toUTCString()}, database);
    return result;
}
async function markAsReviewed(requestId: Request['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
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