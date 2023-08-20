import { ColumnType, Insertable, Selectable, Updateable } from "kysely";

/**
 * Kysely definition for the Blog Table.
 */
export interface BlogTable {
    id: ColumnType<bigint, never, never>;
    title: string;
    keywords: string | undefined;
    description: string | undefined;
    content: string;
    category_id: bigint;
    author_id: bigint;
    reviewed: boolean;
    reviewedAt: ColumnType<Date | undefined, string | undefined, string | undefined>;
    published: boolean;
    publishedAt: ColumnType<Date | undefined, string | undefined, string | undefined>;
    approved: boolean;
    approvedAt: ColumnType<Date | undefined, string | undefined, string | undefined>;
    deleted: boolean;
    deleted_at: ColumnType<Date | undefined, string | undefined, string | undefined>;
    updated_at: ColumnType<Date, never, never>;
    created_at: ColumnType<Date, never, never>;
};