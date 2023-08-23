import { ColumnType, Insertable, Selectable, Updateable } from "kysely";

type TopicOption = 'review' | 'report';
type ReferenceTypeOption = 'user' | 'blog' | 'comment';

/**
 * Kysely definition for the Request Table.
 */
export interface RequestTable {
    id: ColumnType<bigint, never, never>;
    content: string;
    topic: TopicOption;
    reference_type: ReferenceTypeOption;
    reference_id: bigint;
    sender_id: bigint;
    reviewed: boolean;
    reviewed_at: ColumnType<Date | undefined, string | undefined, string | undefined>;
    deleted: boolean;
    deleted_at: ColumnType<Date | undefined, string | undefined, string | undefined>;
    updated_at: ColumnType<Date, never, never>;
    created_at: ColumnType<Date, never, never>;
};
export type Request = Selectable<RequestTable>;
export type CreateRequest = Insertable<RequestTable>;
export type UpdateRequest = Updateable<RequestTable>;