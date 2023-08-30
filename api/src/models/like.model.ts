import { ColumnType, Insertable, Selectable, Updateable } from "kysely";

type RefecenceTypeOption = 'blog' | 'comment';

/**
 * Kysely definition for the Like Table.
 */
export interface LikeTable {
    id: ColumnType<bigint, never, never>;
    user_id: bigint;
    refecence_type: RefecenceTypeOption;
    refecence_id: bigint;
    deleted: boolean;
    deleted_at: ColumnType<Date | null | undefined, string | null | undefined, string | null | undefined>;
    updated_at: ColumnType<Date, never, never>;
    created_at: ColumnType<Date, never, never>;
}
export type SelectLike = Selectable<LikeTable>;
export type CreateLike = Insertable<LikeTable>;
export type UpdateLike = Updateable<LikeTable>;
export type Like = Omit<SelectLike, 'id' | 'user_id' | 'refecence_id'> & {
    id: string,
    user_id: string,
    refecence_id: string,
};