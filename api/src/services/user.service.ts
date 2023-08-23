import { Kysely, Transaction, WhereExpressionFactory, InsertResult, UpdateResult, DeleteResult } from "kysely";
import { Database, DatabaseSchema } from "../utilities/database";
import { CreateUser, CreateUserCredential, CreateUserDetail, CreateUserOption, CreateUserPermission, UpdateUser, UpdateUserCredential, UpdateUserDetail, UpdateUserOption, UpdateUserPermission, User, UserCredential, UserDetail, UserOption, UserPermission } from "../models/user.model";
import { Permission } from "../models/permission.model";

///////////////////////////////////////////////////////
/// Default Templates                               ///
///////////////////////////////////////////////////////

const defaultUser: Omit<CreateUser, 'email'> = {
    anonym: false,
    validated: false,
    banned: false,
    deleted: false,
}
const defaultUserOption: Omit<CreateUserOption, 'user_id'> = {
    font_size: 'medium',
    design_tempature: 'normal',
    email_show_state: 'hidden',
    username_show_state: 'hidden',
    firstname_show_state: 'hidden',
    lastname_show_state: 'hidden',
    description_show_state: 'hidden',
    birthday_show_state: 'hidden',
    gender_show_state: 'hidden',
    pronouns_show_state: 'hidden',
    profile_description_show_state: 'hidden',
    deleted: false,
}
const defaultUserDetial: Omit<CreateUserDetail, 'user_id'> = {
    deleted: false,
}
const defualtUserCredentail: Omit<CreateUserCredential, 'user_id' | 'password' | 'salt'> = {
    deleted: false,
}
const defaultUserPermission: Omit<CreateUserPermission, 'user_id' | 'permission_id'> = {
    deleted: false,
}

///////////////////////////////////////////////////////
/// Filters                                         ///
///////////////////////////////////////////////////////

const userIsListable: WhereExpressionFactory<DatabaseSchema, 'users'> = (expressionBuilder) => {
    return expressionBuilder.or([
        expressionBuilder('users.validated', '!=', false),
        expressionBuilder('users.banned', '!=', true),
        expressionBuilder('users.deleted', '!=', true),
    ]);
}
const userPermissionIsListable: (userId: bigint) => WhereExpressionFactory<DatabaseSchema, 'user_permissions'> = (userId) => {
    return (expressionBuilder) => {
        return expressionBuilder.and([
            expressionBuilder('user_permissions.user_id', '=', userId),
            expressionBuilder.or([
                expressionBuilder('user_permissions.deleted', '!=', true),
            ]),
        ]);
    };
}

///////////////////////////////////////////////////////
/// User Functions                                  ///
///////////////////////////////////////////////////////

async function counts(database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('users')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .filterWhere(userIsListable)
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selects(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<User[]> {
    let results = await database
    .selectFrom('users')
    .selectAll()
    .where(userIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function select(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<User> {
    let result = await database
    .selectFrom('users')
    .selectAll()
    .where('id', '=', userId)
    .executeTakeFirstOrThrow();

    return result;
}
async function insert(email: string, password: string, salt: string, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database.transaction().execute(async (transaction) => {
        let numInsertedOrUpdatedRows = BigInt(0);

        let userResult = await transaction
        .insertInto('users')
        .values({...defaultUser, email})
        .executeTakeFirstOrThrow();

        let userOptionResult = await transaction
        .insertInto('user_options')
        .values({...defaultUserOption, user_id: userResult.insertId!})
        .executeTakeFirstOrThrow();

        let userDetailResult = await transaction
        .insertInto('user_details')
        .values({...defaultUserDetial, user_id: userResult.insertId!})
        .executeTakeFirstOrThrow();

        let userCredentialResult = await transaction
        .insertInto('user_credentials')
        .values({...defualtUserCredentail, user_id: userResult.insertId!, password, salt})
        .executeTakeFirstOrThrow();

        numInsertedOrUpdatedRows += userResult.numInsertedOrUpdatedRows || BigInt(0);
        numInsertedOrUpdatedRows += userOptionResult.numInsertedOrUpdatedRows || BigInt(0);
        numInsertedOrUpdatedRows += userDetailResult.numInsertedOrUpdatedRows || BigInt(0);
        numInsertedOrUpdatedRows += userCredentialResult.numInsertedOrUpdatedRows || BigInt(0);

        return new InsertResult(userResult.insertId, numInsertedOrUpdatedRows);
    });

    return result;
}
async function update(userId: bigint, updateUserData: UpdateUser, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('users')
    .where('id', '=', userId)
    .set(updateUserData)
    .executeTakeFirstOrThrow();

    return result;
}
async function Delete(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database.transaction().execute(async (transaction) => {
        let numDeletedRows = BigInt(0);

        let userPermissionResults = await transaction
        .deleteFrom('user_permissions')
        .where('user_id', '=', userId)
        .execute();

        let userCredentialResult = await transaction
        .deleteFrom('user_credentials')
        .where('user_id', '=', userId)
        .executeTakeFirstOrThrow();

        let userDetailResult = await transaction
        .deleteFrom('user_details')
        .where('user_id', '=', userId)
        .executeTakeFirstOrThrow();

        let userOptionResult = await transaction
        .deleteFrom('user_options')
        .where('user_id', '=', userId)
        .executeTakeFirstOrThrow();

        let userResult = await transaction
        .deleteFrom('users')
        .where('id', '=', userId)
        .executeTakeFirstOrThrow();

        let userPermissionResult = userPermissionResults.reduce((previousValue, currentValue) => new DeleteResult(currentValue.numDeletedRows + previousValue.numDeletedRows));
        
        numDeletedRows += userPermissionResult.numDeletedRows;
        numDeletedRows += userResult.numDeletedRows;
        numDeletedRows += userOptionResult.numDeletedRows;
        numDeletedRows += userDetailResult.numDeletedRows;
        numDeletedRows += userCredentialResult.numDeletedRows;

        return new DeleteResult(numDeletedRows);
    });

    return result;
}
async function markAsDeleted(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database.transaction().execute(async (transaction) => {
        let numUpdatedRows = BigInt(0);

        let userResult = await transaction
        .updateTable('users')
        .where((expressionBuilder) => expressionBuilder.and([
            expressionBuilder('id', '=', userId),
            expressionBuilder('deleted', '!=', true),
        ]))
        .set({deleted: true, deleted_at: new Date().toUTCString()})
        .executeTakeFirst();

        let userOptionResult = await transaction
        .updateTable('user_options')
        .where((expressionBuilder) => expressionBuilder.and([
            expressionBuilder('user_id', '=', userId),
            expressionBuilder('deleted', '!=', true),
        ]))
        .set({deleted: true, deleted_at: new Date().toUTCString()})
        .executeTakeFirst();

        let userDetailResult = await transaction
        .updateTable('user_details')
        .where((expressionBuilder) => expressionBuilder.and([
            expressionBuilder('user_id', '=', userId),
            expressionBuilder('deleted', '!=', true),
        ]))
        .set({deleted: true, deleted_at: new Date().toUTCString()})
        .executeTakeFirst();

        let userCredentialResult = await transaction
        .updateTable('user_credentials')
        .where((expressionBuilder) => expressionBuilder.and([
            expressionBuilder('user_id', '=', userId),
            expressionBuilder('deleted', '!=', true),
        ]))
        .set({deleted: true, deleted_at: new Date().toUTCString()})
        .executeTakeFirst();

        let userPermissionResults = await transaction
        .updateTable('user_permissions')
        .where((expressionBuilder) => expressionBuilder.and([
            expressionBuilder('user_id', '=', userId),
            expressionBuilder('deleted', '!=', true),
        ]))
        .set({deleted: true, deleted_at: new Date().toUTCString()})
        .execute();

        let userPermissionResult = userPermissionResults.reduce((previousValue, currentValue) => new UpdateResult(currentValue.numUpdatedRows + previousValue.numUpdatedRows, undefined));

        numUpdatedRows += userResult.numUpdatedRows;
        numUpdatedRows += userOptionResult.numUpdatedRows;
        numUpdatedRows += userDetailResult.numUpdatedRows;
        numUpdatedRows += userCredentialResult.numUpdatedRows;
        numUpdatedRows += userPermissionResult.numUpdatedRows;

        return new UpdateResult(numUpdatedRows, undefined);
    });

    return result;
}
async function markAsBanned(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(userId, {banned: true, banned_at: new Date().toUTCString()}, database);
    return result;
}
async function markAsValidated(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(userId, {validated: true, validated_at: new Date().toUTCString()}, database);
    return result;
}

///////////////////////////////////////////////////////
/// User Option Functions                           ///
///////////////////////////////////////////////////////

async function selectOption(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UserOption> {
    let result = await database
    .selectFrom('user_options')
    .selectAll()
    .where('user_id', '=', userId)
    .executeTakeFirstOrThrow();

    return result;
}
async function updateOption(userId: bigint, updateUserOptionData: UpdateUserOption, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('user_options')
    .where('user_id', '=', userId)
    .set(updateUserOptionData)
    .executeTakeFirstOrThrow();

    return result;
}

///////////////////////////////////////////////////////
/// User Detail Functions                           ///
///////////////////////////////////////////////////////

async function selectDetail(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UserDetail> {
    let result = await database
    .selectFrom('user_details')
    .selectAll()
    .where('user_id', '=', userId)
    .executeTakeFirstOrThrow();

    return result;
}
async function updateDetail(userId: bigint, updateUserDetailData: UpdateUserDetail, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('user_details')
    .where('user_id', '=', userId)
    .set(updateUserDetailData)
    .executeTakeFirstOrThrow();

    return result;
}

///////////////////////////////////////////////////////
/// User Credential Functions                       ///
///////////////////////////////////////////////////////

async function selectCredential(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UserCredential> {
    let result = await database
    .selectFrom('user_credentials')
    .selectAll()
    .where('user_id', '=', userId)
    .executeTakeFirstOrThrow();

    return result;
}
async function updateCredential(userId: bigint, updateUserCredentialData: UpdateUserCredential, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('user_credentials')
    .where('user_id', '=', userId)
    .set(updateUserCredentialData)
    .executeTakeFirstOrThrow();

    return result;
}

///////////////////////////////////////////////////////
/// User Permission Functions                       ///
///////////////////////////////////////////////////////

async function countPermissions(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('user_permissions')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .filterWhere(userPermissionIsListable(userId))
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selectPermissions(userId: bigint, offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Permission[]> {
    let results = await database
    .selectFrom('user_permissions')
    .innerJoin('permisions', 'permisions.id', 'user_permissions.id')
    .where(userPermissionIsListable(userId))
    .selectAll('permisions')
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}

async function addPermission(userId: bigint, permissionId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult | UpdateResult> {
    let updateResult = await database
    .updateTable('user_permissions')
    .where((expressionBuilder) => expressionBuilder.and([
        expressionBuilder('user_id', '=', userId),
        expressionBuilder('permission_id', '=', permissionId),
    ]))
    .set({deleted: false, deleted_at: undefined})
    .executeTakeFirst();

    if (updateResult.numUpdatedRows > 0) return updateResult;

    let insertResult = await database
    .insertInto('user_permissions')
    .values({...defaultUserPermission, user_id: userId, permission_id: permissionId})
    .executeTakeFirstOrThrow();

    return insertResult;
}
async function removePermission(userId: bigint, permissionId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('user_permissions')
    .where((expressionBuilder) => expressionBuilder.and([
        expressionBuilder('user_id', '=', userId),
        expressionBuilder('permission_id', '=', permissionId),
        expressionBuilder('deleted', '!=', true),
    ]))
    .set({deleted: true, deleted_at: new Date().toUTCString()})
    .executeTakeFirst();

    return result;
}

///////////////////////////////////////////////////////
/// User Service Setup                              ///
///////////////////////////////////////////////////////

export const UserService = {
    counts,
    selects,
    select,
    insert,
    update,
    delete: Delete,
    markAsDeleted,
    markAsBanned,
    markAsValidated,
    options: {
        selectOption,
        updateOption,
    },
    details: {
        selectDetail,
        updateDetail,
    },
    credentials: {
        selectCredential,
        updateCredential,
    },
    permissions: {
        countPermissions,
        selectPermissions,
        addPermission,
        removePermission,
    },
}