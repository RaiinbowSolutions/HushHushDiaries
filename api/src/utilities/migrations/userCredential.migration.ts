import { Kysely, Migration, sql } from 'kysely';

async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('user_credentials')
    .addColumn('id', 'bigint', column => column.autoIncrement().primaryKey())
    .addColumn('user_id', 'bigint', column => column.notNull())
    .addColumn('password', 'varchar(64)')
    .addColumn('salt', 'varchar(16)')
    .addColumn('deleted', 'boolean', column => column.notNull().defaultTo(false))
    .addColumn('deleted_at', 'datetime')
    .addColumn('updated_at', sql`DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    .addColumn('created_at', sql`DATETIME DEFAULT CURRENT_TIMESTAMP`)
    .execute();
}

async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('user_credentials').execute();
}

export const UserCredentialMigration: Migration = {
    up,
    down,
}