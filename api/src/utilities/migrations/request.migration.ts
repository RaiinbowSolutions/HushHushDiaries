import { Kysely, Migration, sql } from 'kysely';

async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('requests')
    .addColumn('id', 'bigint', column => column.autoIncrement().primaryKey())
    .addColumn('content', 'text', column => column.notNull())
    .addColumn('topic', sql`ENUM('review', 'report')`, column => column.notNull())
    .addColumn('refecence_type', sql`ENUM('user', 'blog', 'comment')`, column => column.notNull())
    .addColumn('refecence_id', 'bigint', column => column.notNull())
    .addColumn('sender_id', 'bigint', column => column.notNull())
    .addColumn('reviewed', 'boolean', column => column.notNull().defaultTo(false))
    .addColumn('reviewed_at', 'datetime')
    .addColumn('deleted', 'boolean', column => column.notNull().defaultTo(false))
    .addColumn('deleted_at', 'datetime')
    .addColumn('updated_at', sql`DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    .addColumn('created_at', sql`DATETIME DEFAULT CURRENT_TIMESTAMP`)
    .execute();
}

async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('requests').execute();
}

export const RequestMigration: Migration = {
    up,
    down,
}