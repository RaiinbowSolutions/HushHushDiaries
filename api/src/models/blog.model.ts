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
    reviewed_at: ColumnType<Date | undefined, string | undefined, string | undefined>;
    published: boolean;
    published_at: ColumnType<Date | undefined, string | undefined, string | undefined>;
    approved: boolean;
    approved_at: ColumnType<Date | undefined, string | undefined, string | undefined>;
    deleted: boolean;
    deleted_at: ColumnType<Date | undefined, string | undefined, string | undefined>;
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