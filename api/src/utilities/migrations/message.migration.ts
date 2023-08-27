import { Kysely, Migration, sql } from 'kysely';

async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('messages')
    .addColumn('id', 'bigint', column => column.autoIncrement().primaryKey())
    .addColumn('content', 'text', column => column.notNull())
    .addColumn('topic', sql`ENUM('message')`, column => column.notNull())
    .addColumn('sender_id', 'bigint', column => column.notNull())
    .addColumn('receiver_id', 'bigint', column => column.notNull())
    .addColumn('reviewed', 'boolean', column => column.notNull().defaultTo(false))
    .addColumn('reviewed_at', 'datetime')
    .addColumn('deleted', 'boolean', column => column.notNull().defaultTo(false))
    .addColumn('deleted_at', 'datetime')
    .addColumn('updated_at', sql`DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    .addColumn('created_at', sql`DATETIME DEFAULT CURRENT_TIMESTAMP`)
    .execute();
}

async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('messages').execute();
}

export const MessageMigration: Migration = {
    up,
    down,
}