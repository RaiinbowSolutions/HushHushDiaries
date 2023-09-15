import { ColumnType, Insertable, Selectable, Updateable } from "kysely";

/**
 * Kysely definition for the Permission Table.
 */
export interface PermissionTable {
    id: ColumnType<bigint, never, never>;
    name: string;
    description: string | null | undefined;
    deleted: boolean;
    deleted_at: ColumnType<Date | null | undefined, string | null | undefined, string | null | undefined>;
    updated_at: ColumnType<Date, never, never>;
    created_at: ColumnType<Date, never, never>;
};
export type SelectPermission = Selectable<PermissionTable>;
export type CreatePermission = Insertable<PermissionTable>;
export type UpdatePermission = Updateable<PermissionTable>;
export type Permission = Omit<SelectPermission, 'id'> & {
    id: string;
};