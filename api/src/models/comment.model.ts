import { ColumnType, Insertable, Selectable, Updateable } from "kysely";

type RefecenceTypeOption = 'blog' | 'comment';

/**
 * Kysely definition for the Comment Table.
 */
export interface CommentTable {
    id: ColumnType<bigint, never, never>;
    content: string;
    author_id: bigint;
    refecence_type: RefecenceTypeOption;
    refecence_id: bigint;
    approved: boolean;
    approved_at: ColumnType<Date | undefined, string | undefined, string | undefined>;
    reviewed: boolean;
    reviewed_at: ColumnType<Date | undefined, string | undefined, string | undefined>;
    deleted: boolean;
    deleted_at: ColumnType<Date | undefined, string | undefined, string | undefined>;
    updated_at: ColumnType<Date, never, never>;
    created_at: ColumnType<Date, never, never>;
};
export type SelectComment = Selectable<CommentTable>;
export type CreateComment = Insertable<CommentTable>;
export type UpdateComment = Updateable<CommentTable>;
export type Comment = Omit<SelectComment, 'id' | 'author_id' | 'refecence_id'> & {
    id: string,
    author_id: string,
    refecence_id: string,
};