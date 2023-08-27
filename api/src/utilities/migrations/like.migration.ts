import { Kysely, Migration, sql } from 'kysely';

async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('likes')
    .addColumn('id', 'bigint', column => column.autoIncrement().primaryKey())
    .addColumn('user_id', 'bigint', column => column.notNull())
    .addColumn('refecence_type', sql`ENUM('blog', 'comment')`, column => column.notNull())
    .addColumn('refecence_id', 'bigint', column => column.notNull())
    .addColumn('deleted', 'boolean', column => column.notNull().defaultTo(false))
    .addColumn('deleted_at', 'datetime')
    .addColumn('updated_at', sql`DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    .addColumn('created_at', sql`DATETIME DEFAULT CURRENT_TIMESTAMP`)
    .execute();
}

async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('likes').execute();
}

export const LikeMigration: Migration = {
    up,
    down,
}