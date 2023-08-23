import { DeleteResult, InsertResult, Kysely, Transaction, UpdateResult, WhereExpressionFactory } from "kysely";
import { Database, DatabaseSchema } from "../utilities/database";
import { CreateMessage, Message, UpdateMessage } from "../models/message.model";

///////////////////////////////////////////////////////
/// Default Templates                               ///
///////////////////////////////////////////////////////

const DefaultMessage: Omit<CreateMessage, 'content' | 'sender_id' | 'reveiver_id' | 'topic'> = {
    reviewed: false,
    deleted: false,
}

///////////////////////////////////////////////////////
/// Filters                                         ///
///////////////////////////////////////////////////////

const MessageIsListable: WhereExpressionFactory<DatabaseSchema, 'messages'> = (expressionBuilder) => {
    return expressionBuilder.or([
        expressionBuilder('messages.deleted', '!=', true),
    ]);
}
const OutgoingMessageIsListable: (userId: Message['sender_id']) => WhereExpressionFactory<DatabaseSchema, 'messages'> = (userId) => {
    return (expressionBuilder) => {
        return expressionBuilder.and([
            expressionBuilder('messages.sender_id', '=', userId),
            expressionBuilder.or([
                expressionBuilder('messages.deleted', '!=', true),
            ]),
        ]);
    };
}
const IncomingMessageIsListable: (userId: Message['reveiver_id']) => WhereExpressionFactory<DatabaseSchema, 'messages'> = (userId) => {
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
        .filterWhere(MessageIsListable)
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selects(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Message[]> {
    let results = await database
    .selectFrom('messages')
    .selectAll()
    .where(MessageIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function select(messageId: Message['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Message> {
    let result = await database
    .selectFrom('messages')
    .selectAll()
    .where('id', '=', messageId)
    .executeTakeFirstOrThrow();

    return result;
}
async function insert(userId: CreateMessage['sender_id'], reveiverId: CreateMessage['reveiver_id'], content: CreateMessage['content'], topic: CreateMessage['topic'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database
    .insertInto('messages')
    .values({...DefaultMessage, sender_id: userId, reveiver_id: reveiverId, content, topic})
    .executeTakeFirstOrThrow();

    return result;
}
async function update(messageId: Message['id'], updateMessageData: UpdateMessage, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('messages')
    .where('id', '=', messageId)
    .set(updateMessageData)
    .executeTakeFirstOrThrow();

    return result;
}
async function Delete(messageId: Message['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('messages')
    .where('id', '=', messageId)
    .executeTakeFirstOrThrow();

    return result;
}
async function markAsDeleted(messageId: Message['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(messageId, {deleted: true, deleted_at: new Date().toUTCString()}, database);
    return result;
}
async function markAsReviewed(messageId: Message['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(messageId, {reviewed: true, reviewed_at: new Date().toUTCString()}, database);
    return result;
}

///////////////////////////////////////////////////////
/// Message Outgoing Functions                      ///
///////////////////////////////////////////////////////

async function countOutgoings(userId: Message['sender_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('messages')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .filterWhere(OutgoingMessageIsListable(userId))
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selectOutgoings(userId: Message['sender_id'], offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Message[]> {
    let results = await database
    .selectFrom('messages')
    .selectAll()
    .where(OutgoingMessageIsListable(userId))
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}

///////////////////////////////////////////////////////
/// Message Incoming Functions                      ///
///////////////////////////////////////////////////////

async function countIncomings(userId: Message['reveiver_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('messages')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .filterWhere(IncomingMessageIsListable(userId))
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selectIncomings(userId: Message['reveiver_id'], offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Message[]> {
    let results = await database
    .selectFrom('messages')
    .selectAll()
    .where(IncomingMessageIsListable(userId))
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