import { Kysely, Migration, sql } from 'kysely';

async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('blogs')
    .addColumn('id', 'bigint', column => column.autoIncrement().primaryKey())
    .addColumn('title', 'varchar(120)', column => column.notNull())
    .addColumn('keywords', 'varchar(255)')
    .addColumn('description', 'varchar(255)')
    .addColumn('content', 'text', column => column.notNull())
    .addColumn('category_id', 'bigint', column => column.notNull())
    .addColumn('author_id', 'bigint', column => column.notNull())
    .addColumn('reviewed', 'boolean', column => column.notNull().defaultTo(false))
    .addColumn('reviewed_at', 'datetime')
    .addColumn('published', 'boolean', column => column.notNull().defaultTo(false))
    .addColumn('published_at', 'datetime')
    .addColumn('approved', 'boolean', column => column.notNull().defaultTo(false))
    .addColumn('approved_at', 'datetime')
    .addColumn('deleted', 'boolean', column => column.notNull().defaultTo(false))
    .addColumn('deleted_at', 'datetime')
    .addColumn('updated_at', sql`DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    .addColumn('created_at', sql`DATETIME DEFAULT CURRENT_TIMESTAMP`)
    .execute();
}

async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('blogs').execute();
}

export const BlogMigration: Migration = {
    up,
    down,
}