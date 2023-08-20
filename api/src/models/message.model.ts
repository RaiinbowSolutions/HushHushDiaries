import { ColumnType, Insertable, Selectable, Updateable } from "kysely";

type TopicOption = 'message';

/**
 * Kysely definition for the Message Table.
 */
export interface MessageTable {
    id: ColumnType<bigint, never, never>;
    content: string;
    topic: TopicOption;
    sender_id: bigint;
    reveiver_id: bigint;
    reviewed: boolean;
    reviewed_at: ColumnType<Date | undefined, string | undefined, string | undefined>;
    deleted: boolean;
    deleted_at: ColumnType<Date | undefined, string | undefined, string | undefined>;
    updated_at: ColumnType<Date, never, never>;
    created_at: ColumnType<Date, never, never>;
};
export type Message = Selectable<MessageTable>;
export type CreateMessage = Insertable<MessageTable>;
export type UpdateMessage = Updateable<MessageTable>;