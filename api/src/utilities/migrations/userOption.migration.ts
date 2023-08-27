import { Kysely, Migration, sql } from 'kysely';

async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('user_options')
    .addColumn('id', 'bigint', column => column.autoIncrement().primaryKey())
    .addColumn('user_id', 'bigint', column => column.notNull())
    .addColumn('font_size', sql`ENUM('small', 'medium', 'large')`, column => column.notNull().defaultTo('medium'))
    .addColumn('design_tempature', sql`ENUM('cold', 'normal', 'warm')`, column => column.notNull().defaultTo('normal'))
    .addColumn('email_show_state', sql`ENUM('hidden', 'public')`, column => column.notNull().defaultTo('hidden'))
    .addColumn('username_show_state', sql`ENUM('hidden', 'public')`, column => column.notNull().defaultTo('hidden'))
    .addColumn('firstname_show_state', sql`ENUM('hidden', 'public')`, column => column.notNull().defaultTo('hidden'))
    .addColumn('lastname_show_state', sql`ENUM('hidden', 'public')`, column => column.notNull().defaultTo('hidden'))
    .addColumn('birthday_show_state', sql`ENUM('hidden', 'public')`, column => column.notNull().defaultTo('hidden'))
    .addColumn('gender_show_state', sql`ENUM('hidden', 'public')`, column => column.notNull().defaultTo('hidden'))
    .addColumn('pronouns_show_state', sql`ENUM('hidden', 'public')`, column => column.notNull().defaultTo('hidden'))
    .addColumn('profile_description_show_state', sql`ENUM('hidden', 'public')`, column => column.notNull().defaultTo('hidden'))
    .addColumn('deleted', 'boolean', column => column.notNull().defaultTo(false))
    .addColumn('deleted_at', 'datetime')
    .addColumn('updated_at', sql`DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    .addColumn('created_at', sql`DATETIME DEFAULT CURRENT_TIMESTAMP`)
    .execute();
}

async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('user_options').execute();
}

export const UserOptionMigration: Migration = {
    up,
    down,
}