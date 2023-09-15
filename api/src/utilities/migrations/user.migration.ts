import { Kysely, Migration, sql } from 'kysely';

async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('users')
    .addColumn('id', 'bigint', column => column.autoIncrement().primaryKey())
    .addColumn('email', 'varchar(254)', column => column.notNull().unique())
    .addColumn('username', 'varchar(30)')
    .addColumn('anonym', 'boolean', column => column.notNull().defaultTo(true))
    .addColumn('validated', 'boolean', column => column.notNull().defaultTo(false))
    .addColumn('validated_at', 'datetime')
    .addColumn('banned', 'boolean', column => column.notNull().defaultTo(false))
    .addColumn('banned_at', 'datetime')
    .addColumn('deleted', 'boolean', column => column.notNull().defaultTo(false))
    .addColumn('deleted_at', 'datetime')
    .addColumn('updated_at', sql`DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    .addColumn('created_at', sql`DATETIME DEFAULT CURRENT_TIMESTAMP`)
    .execute();
}

async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('users').execute();
}

export const UserMigration: Migration = {
    up,
    down,
}