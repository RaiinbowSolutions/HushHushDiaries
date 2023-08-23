import { DeleteResult, InsertResult, Kysely, Transaction, UpdateResult, WhereExpressionFactory } from "kysely";
import { Database, DatabaseSchema } from "../utilities/database";
import { CreatePermission, Permission, UpdatePermission } from "../models/permission.model";

///////////////////////////////////////////////////////
/// Default Templates                               ///
///////////////////////////////////////////////////////

const DefaultPermission: Omit<CreatePermission, 'name'> = {
    deleted: false,
}

///////////////////////////////////////////////////////
/// Filters                                         ///
///////////////////////////////////////////////////////

const permissionIsListable: WhereExpressionFactory<DatabaseSchema, 'permisions'> = (expressionBuilder) => {
    return expressionBuilder.or([
        expressionBuilder('permisions.deleted', '!=', true),
    ]);
}

///////////////////////////////////////////////////////
/// Permission Functions                            ///
///////////////////////////////////////////////////////

async function counts(database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('permisions')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .filterWhere(permissionIsListable)
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selects(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Permission[]> {
    let results = await database
    .selectFrom('permisions')
    .selectAll()
    .where(permissionIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function select(permissionId: Permission['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Permission> {
    let result = await database
    .selectFrom('permisions')
    .selectAll()
    .where('id', '=', permissionId)
    .executeTakeFirstOrThrow();

    return result;
}
async function insert(name: CreatePermission['name'], description: CreatePermission['description'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database
    .insertInto('permisions')
    .values({...DefaultPermission, name, description})
    .executeTakeFirstOrThrow();

    return result;
}
async function update(permissionId: Permission['id'], updatePermissionData: UpdatePermission, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('permisions')
    .where('id', '=', permissionId)
    .set(updatePermissionData)
    .executeTakeFirstOrThrow();

    return result;
}
async function Delete(permissionId: Permission['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('permisions')
    .where('id', '=', permissionId)
    .executeTakeFirstOrThrow();

    return result;
}
async function markAsDeleted(permissionId: Permission['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(permissionId, {deleted: true, deleted_at: new Date().toUTCString()}, database);
    return result;
}

///////////////////////////////////////////////////////
/// Permission Service Setup                        ///
///////////////////////////////////////////////////////

export const PermissionService = {
    counts,
    selects,
    select,
    insert,
    update,
    delete: Delete,
    markAsDeleted,
}