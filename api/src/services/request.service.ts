import { DeleteResult, InsertResult, Kysely, Transaction, UpdateResult } from "kysely";
import { Database, DatabaseDateString, DatabaseSchema, ReferenceType, WhereExpressionFactory } from "../utilities/database";
import { CreateRequest, Request, SelectRequest, UpdateRequest } from "../models/request.model";
import { SelectUser } from "../models/user.model";
import { Minify } from '../utilities/minify';

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
        .as('total')
    )
    .where(RequestIsListable)
    .executeTakeFirstOrThrow();

    return BigInt(result.total);
}
async function selects(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectRequest[]> {
    let results = await database
    .selectFrom('requests')
    .selectAll()
    .where(RequestIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function select(requestId: SelectRequest['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectRequest> {
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
async function update(requestId: SelectRequest['id'], updateRequestData: UpdateRequest, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('requests')
    .where('id', '=', requestId)
    .set(updateRequestData)
    .executeTakeFirstOrThrow();

    return result;
}
async function Delete(requestId: SelectRequest['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('requests')
    .where('id', '=', requestId)
    .executeTakeFirstOrThrow();

    return result;
}
async function markAsDeleted(requestId: SelectRequest['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(requestId, {deleted: true, deleted_at: DatabaseDateString(new Date())}, database);
    return result;
}
async function markAsReviewed(requestId: SelectRequest['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(requestId, {reviewed: true, reviewed_at: DatabaseDateString(new Date())}, database);
    return result;
}
async function isOwnerOfRequest(requestId: SelectRequest['id'], ownerId: SelectUser['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<boolean> {
    let result = await database
    .selectFrom('requests')
    .selectAll()
    .where((expressionBuilder) => expressionBuilder.and([
        expressionBuilder('id', '=', requestId),
        expressionBuilder('sender_id', '=', ownerId)
    ]))
    .executeTakeFirst();

    return result !== undefined;
}

///////////////////////////////////////////////////////
/// Request Filter Functions                        ///
///////////////////////////////////////////////////////

async function filterRequests(as: SelectUser['id'], requests: SelectRequest[], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Request[]> {
    let results = await database.transaction().execute(async (transaction) => {
        let filtered: Request[] = [];

        for (let request of requests) filtered.push(await filterRequest(as, request, transaction));

        return filtered;
    })

    return results;
}
async function filterRequest(as: SelectUser['id'], request: SelectRequest, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Request> {
    let id = Minify.encode('requests', request.id);
    let referenceType: ReferenceType = request.reference_type === 'blog' ? 'blogs' : request.reference_type === 'comment' ? 'comments' : 'users';
    let reference_id = Minify.encode(referenceType, request.reference_id);
    let sender_id = Minify.encode('users', request.sender_id);

    return {
        ...request,
        id,
        reference_id,
        sender_id,
    }
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
    isOwner: isOwnerOfRequest,
    filters: {
        requests: filterRequests,
        request: filterRequest,
    }
}