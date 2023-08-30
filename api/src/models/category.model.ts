import { ColumnType, Insertable, Selectable, Updateable } from "kysely";

/**
 * Kysely definition for the Category Table.
 */
export interface CategoryTable {
    id: ColumnType<bigint, never, never>;
    name: string;
    description: string | null | undefined;
    deleted: boolean;
    deleted_at: ColumnType<Date | null | undefined, string | null | undefined, string | null | undefined>;
    updated_at: ColumnType<Date, never, never>;
    created_at: ColumnType<Date, never, never>;
};
export type SelectCategory = Selectable<CategoryTable>;
export type CreateCategory = Insertable<CategoryTable>;
export type UpdateCategory = Updateable<CategoryTable>;
export type Category = Omit<SelectCategory, 'id'> & {
    id: string;
};