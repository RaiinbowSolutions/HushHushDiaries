import { Kysely, Migration, sql } from 'kysely';

async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('user_details')
    .addColumn('id', 'bigint', column => column.autoIncrement().primaryKey())
    .addColumn('user_id', 'bigint', column => column.notNull())
    .addColumn('firstname', 'varchar(255)')
    .addColumn('lastname', 'varchar(255)')
    .addColumn('birthday', 'datetime')
    .addColumn('gender', sql`ENUM('female', 'male', 'nonbinary', 'transwoman', 'transman')`)
    .addColumn('pronouns', 'varchar(255)')
    .addColumn('profile_description', 'varchar(255)')
    .addColumn('deleted', 'boolean', column => column.notNull().defaultTo(false))
    .addColumn('deleted_at', 'datetime')
    .addColumn('updated_at', sql`DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    .addColumn('created_at', sql`DATETIME DEFAULT CURRENT_TIMESTAMP`)
    .execute();
}

async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('user_details').execute();
}

export const UserDetailMigration: Migration = {
    up,
    down,
}