import { ColumnType, Insertable, Selectable, Updateable } from "kysely";

/**
 * Kysely definition for the Blog Table.
 */
export interface BlogTable {
    id: ColumnType<bigint, never, never>;
    title: string;
    keywords: string | null | undefined;
    description: string | null | undefined;
    content: string;
    category_id: bigint;
    author_id: bigint;
    reviewed: boolean;
    reviewed_at: ColumnType<Date | null | undefined, string | null | undefined, string | null | undefined>;
    published: boolean;
    published_at: ColumnType<Date | null | undefined, string | null | undefined, string | null | undefined>;
    approved: boolean;
    approved_at: ColumnType<Date | null | undefined, string | null | undefined, string | null | undefined>;
    deleted: boolean;
    deleted_at: ColumnType<Date | null | undefined, string | null | undefined, string | null | undefined>;
    updated_at: ColumnType<Date, never, never>;
    created_at: ColumnType<Date, never, never>;
};
export type SelectBlog = Selectable<BlogTable>;
export type CreateBlog = Insertable<BlogTable>;
export type UpdateBlog = Updateable<BlogTable>;
export type Blog = Omit<SelectBlog, 'id' | 'category_id' | 'author_id'> & {
    id: string,
    category_id: string,
    author_id: string,
}