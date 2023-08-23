import 'dotenv/config';
import { DeleteResult, InsertResult, Kysely, Transaction, UpdateResult, WhereExpressionFactory } from "kysely";
import { Database, DatabaseSchema } from "../utilities/database";
import { CreateRequest, Request, SelectRequest, UpdateRequest } from "../models/request.model";
import { SelectUser } from "../models/user.model";
import HashIdsContructor from 'hashids';

const Salt = process.env.HASH_ID_SALT || undefined;
const MinLength = Number(process.env.HASH_ID_MIN_LENGTH) || 8;
const Alphabet = process.env.HASH_ID_ALPHABET || undefined;
const HashIds = new HashIdsContructor(Salt, MinLength, Alphabet);

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
    let result = await update(requestId, {deleted: true, deleted_at: new Date().toUTCString()}, database);
    return result;
}
async function markAsReviewed(requestId: SelectRequest['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(requestId, {reviewed: true, reviewed_at: new Date().toUTCString()}, database);
    return result;
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
    let id = HashIds.encode(request.id);
    let reference_id = HashIds.encode(request.reference_id);
    let sender_id = HashIds.encode(request.sender_id);

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
    filters: {
        requests: filterRequests,
        request: filterRequest,
    }
}