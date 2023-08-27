import { Kysely, Migration, sql } from 'kysely';

async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('categories')
    .addColumn('id', 'bigint', column => column.autoIncrement().primaryKey())
    .addColumn('name', 'varchar(30)', column => column.notNull())
    .addColumn('description', 'varchar(255)')
    .addColumn('deleted', 'boolean', column => column.notNull().defaultTo(false))
    .addColumn('deleted_at', 'datetime')
    .addColumn('updated_at', sql`DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    .addColumn('created_at', sql`DATETIME DEFAULT CURRENT_TIMESTAMP`)
    .execute();
}

async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('categories').execute();
}

export const CategoryMigration: Migration = {
    up,
    down,
}