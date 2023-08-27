import { DeleteResult, InsertResult, Kysely, Transaction, UpdateResult, WhereExpressionFactory } from "kysely";
import { Database, DatabaseDateString, DatabaseSchema } from "../utilities/database";
import { CreateMessage, Message, SelectMessage, UpdateMessage } from "../models/message.model";
import { SelectUser } from '../models/user.model';
import { Minify } from "../utilities/minify";

///////////////////////////////////////////////////////
/// Default Templates                               ///
///////////////////////////////////////////////////////

const DefaultMessage: Omit<CreateMessage, 'content' | 'sender_id' | 'receiver_id' | 'topic'> = {
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
const OutgoingMessageIsListable: (userId: SelectMessage['sender_id']) => WhereExpressionFactory<DatabaseSchema, 'messages'> = (userId) => {
    return (expressionBuilder) => {
        return expressionBuilder.and([
            expressionBuilder('messages.sender_id', '=', userId),
            expressionBuilder.or([
                expressionBuilder('messages.deleted', '!=', true),
            ]),
        ]);
    };
}
const IncomingMessageIsListable: (userId: SelectMessage['receiver_id']) => WhereExpressionFactory<DatabaseSchema, 'messages'> = (userId) => {
    return (expressionBuilder) => {
        return expressionBuilder.and([
            expressionBuilder('messages.receiver_id', '=', userId),
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
        .as('total')
    )
    .where(MessageIsListable)
    .executeTakeFirstOrThrow();

    return BigInt(result.total);
}
async function selects(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectMessage[]> {
    let results = await database
    .selectFrom('messages')
    .selectAll()
    .where(MessageIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function select(messageId: SelectMessage['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectMessage> {
    let result = await database
    .selectFrom('messages')
    .selectAll()
    .where('id', '=', messageId)
    .executeTakeFirstOrThrow();

    return result;
}
async function insert(userId: CreateMessage['sender_id'], receiverId: CreateMessage['receiver_id'], content: CreateMessage['content'], topic: CreateMessage['topic'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database
    .insertInto('messages')
    .values({...DefaultMessage, sender_id: userId, receiver_id: receiverId, content, topic})
    .executeTakeFirstOrThrow();

    return result;
}
async function update(messageId: SelectMessage['id'], updateMessageData: UpdateMessage, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('messages')
    .where('id', '=', messageId)
    .set(updateMessageData)
    .executeTakeFirstOrThrow();

    return result;
}
async function Delete(messageId: SelectMessage['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('messages')
    .where('id', '=', messageId)
    .executeTakeFirstOrThrow();

    return result;
}
async function markAsDeleted(messageId: SelectMessage['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(messageId, {deleted: true, deleted_at: DatabaseDateString(new Date())}, database);
    return result;
}
async function markAsReviewed(messageId: SelectMessage['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(messageId, {reviewed: true, reviewed_at: DatabaseDateString(new Date())}, database);
    return result;
}

///////////////////////////////////////////////////////
/// Message Outgoing Functions                      ///
///////////////////////////////////////////////////////

async function countOutgoings(userId: SelectMessage['sender_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
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
async function selectOutgoings(userId: SelectMessage['sender_id'], offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectMessage[]> {
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

async function countIncomings(userId: SelectMessage['receiver_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
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
async function selectIncomings(userId: SelectMessage['receiver_id'], offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectMessage[]> {
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
/// Message Filter Functions                        ///
///////////////////////////////////////////////////////

async function filterMessages(as: SelectUser['id'], messages: SelectMessage[], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Message[]> {
    let results = await database.transaction().execute(async (transaction) => {
        let filtered: Message[] = [];

        for (let message of messages) filtered.push(await filterMessage(as, message, transaction));

        return filtered;
    })

    return results;
}
async function filterMessage(as: SelectUser['id'], message: SelectMessage, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Message> {
    let id = Minify.encode(message.id);
    let sender_id = Minify.encode(message.sender_id);
    let receiver_id = Minify.encode(message.receiver_id);
    let content = 'hidden';

    if (as == message.sender_id || as == message.receiver_id) content = message.content;

    return {
        ...message,
        id,
        sender_id,
        receiver_id,
        content,
    }
}

///////////////////////////////////////////////////////
/// Message Service Setup                           ///
///////////////////////////////////////////////////////

export const MessageService = {
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
    filters: {
        messages: filterMessages,
        message: filterMessage,
    }
}