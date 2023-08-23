import { DeleteResult, InsertResult, Kysely, Transaction, UpdateResult, WhereExpressionFactory } from "kysely";
import { Database, DatabaseSchema } from "../utilities/database";
import { CreateMessage, Message, UpdateMessage } from "../models/message.model";

///////////////////////////////////////////////////////
/// Filters                                         ///
///////////////////////////////////////////////////////

const messageIsListable: WhereExpressionFactory<DatabaseSchema, 'messages'> = (expressionBuilder) => {
    return expressionBuilder.or([
        expressionBuilder('messages.deleted', '!=', true),
    ]);
}
const outgoingMessageIsListable: (userId: bigint) => WhereExpressionFactory<DatabaseSchema, 'messages'> = (userId) => {
    return (expressionBuilder) => {
        return expressionBuilder.and([
            expressionBuilder('messages.sender_id', '=', userId),
            expressionBuilder.or([
                expressionBuilder('messages.deleted', '!=', true),
            ]),
        ]);
    };
}
const incomingMessageIsListable: (userId: bigint) => WhereExpressionFactory<DatabaseSchema, 'messages'> = (userId) => {
    return (expressionBuilder) => {
        return expressionBuilder.and([
            expressionBuilder('messages.reveiver_id', '=', userId),
            expressionBuilder.or([
                expressionBuilder('messages.deleted', '!=', true),
            ]),
        ]);
    };
}

///////////////////////////////////////////////////////
/// Message Functions                               ///
///////////////////////////////////////////////////////

async function counts(database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('messages')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .filterWhere(messageIsListable)
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selects(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Message[]> {
    let results = await database
    .selectFrom('messages')
    .selectAll()
    .where(messageIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function select(messageId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Message> {
    let result = await database
    .selectFrom('messages')
    .selectAll()
    .where('id', '=', messageId)
    .executeTakeFirstOrThrow();

    return result;
}
async function insert(createMessageData: CreateMessage, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database
    .insertInto('messages')
    .values(createMessageData)
    .executeTakeFirstOrThrow();

    return result;
}
async function update(messageId: bigint, updateMessageData: UpdateMessage, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('messages')
    .where('id', '=', messageId)
    .set(updateMessageData)
    .executeTakeFirstOrThrow();

    return result;
}
async function Delete(messageId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('messages')
    .where('id', '=', messageId)
    .executeTakeFirstOrThrow();

    return result;
}
async function markAsDeleted(messageId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(messageId, {deleted: true, deleted_at: new Date().toUTCString()}, database);
    return result;
}
async function markAsReviewed(messageId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(messageId, {reviewed: true, reviewed_at: new Date().toUTCString()}, database);
    return result;
}

///////////////////////////////////////////////////////
/// Message Outgoing Functions                      ///
///////////////////////////////////////////////////////

async function countOutgoings(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('messages')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .filterWhere(outgoingMessageIsListable(userId))
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selectOutgoings(userId: bigint, offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Message[]> {
    let results = await database
    .selectFrom('messages')
    .selectAll()
    .where(outgoingMessageIsListable(userId))
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}

///////////////////////////////////////////////////////
/// Message Incoming Functions                      ///
///////////////////////////////////////////////////////

async function countIncomings(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('messages')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .filterWhere(incomingMessageIsListable(userId))
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selectIncomings(userId: bigint, offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Message[]> {
    let results = await database
    .selectFrom('messages')
    .selectAll()
    .where(incomingMessageIsListable(userId))
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}

///////////////////////////////////////////////////////
/// Message Service Setup                           ///
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

    countOutgoings,
    selectOutgoings,

    countIncomings,
    selectIncomings,
}