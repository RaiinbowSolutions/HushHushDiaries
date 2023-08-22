import { Kysely, Transaction, WhereExpressionFactory, InsertResult, UpdateResult, DeleteResult } from "kysely";
import { Database, DatabaseSchema } from "../utilities/database";
import { CreateUser, CreateUserCredential, CreateUserDetail, CreateUserOption, CreateUserPermission, UpdateUser, UpdateUserCredential, UpdateUserDetail, UpdateUserOption, UpdateUserPermission, User, UserCredential, UserDetail, UserOption, UserPermission } from "../models/user.model";
import { Permission } from "../models/permission.model";

///////////////////////////////////////////////////////
/// Filters                                         ///
///////////////////////////////////////////////////////

const userIsListable: WhereExpressionFactory<DatabaseSchema, 'users'> = (expressionBuilder) => {
    return expressionBuilder.or([
        expressionBuilder('users.validated', '!=', false),
        expressionBuilder('users.banned', '!=', true),
        expressionBuilder('users.deleted', '!=', true),
    ])
}
const userOptionIsListable: WhereExpressionFactory<DatabaseSchema, 'user_options'> = (expressionBuilder) => {
    return expressionBuilder.or([
        expressionBuilder('user_options.deleted', '!=', true),
    ])
}
const userDetailIsListable: WhereExpressionFactory<DatabaseSchema, 'user_details'> = (expressionBuilder) => {
    return expressionBuilder.or([
        expressionBuilder('user_details.deleted', '!=', true),
    ])
}
const userCredentialIsListable: WhereExpressionFactory<DatabaseSchema, 'user_credentials'> = (expressionBuilder) => {
    return expressionBuilder.or([
        expressionBuilder('user_credentials.deleted', '!=', true),
    ])
}
const userPermissionIsListable: (userId: bigint) => WhereExpressionFactory<DatabaseSchema, 'user_permissions'> = (userId) => {
    return (expressionBuilder) => {
        return expressionBuilder.and([
            expressionBuilder('user_permissions.user_id', '=', userId),
            expressionBuilder.or([
                expressionBuilder('user_permissions.deleted', '!=', true),
            ]),
        ])
    }
}

///////////////////////////////////////////////////////
/// User Functions                                  ///
///////////////////////////////////////////////////////

async function countUsers(database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
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
async function selectUsers(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<User[]> {
    let results = await database
    .selectFrom('users')
    .selectAll()
    .where(userIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function selectUser(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<User> {
    let result = await database
    .selectFrom('users')
    .selectAll()
    .where('id', '=', userId)
    .executeTakeFirstOrThrow();

    return result;
}
async function insertUser(createUserData: CreateUser, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database
    .insertInto('users')
    .values(createUserData)
    .executeTakeFirstOrThrow();

    return result;
}
async function updateUser(userId: bigint, updateUserData: UpdateUser, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('users')
    .where('id', '=', userId)
    .set(updateUserData)
    .executeTakeFirstOrThrow();

    return result;
}
async function deleteUser(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('users')
    .where('id', '=', userId)
    .executeTakeFirstOrThrow();

    return result;
}
async function markUserAsDeleted(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await updateUser(userId, {deleted: true, deleted_at: new Date().toUTCString()}, database);
    return result;
}
async function markUserAsBanned(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await updateUser(userId, {banned: true, banned_at: new Date().toUTCString()}, database);
    return result;
}
async function markUserAsValidated(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await updateUser(userId, {validated: true, validated_at: new Date().toUTCString()}, database);
    return result;
}

///////////////////////////////////////////////////////
/// User Option Functions                           ///
///////////////////////////////////////////////////////

async function countUserOptions(database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('user_options')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .filterWhere(userOptionIsListable)
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selectUserOptions(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UserOption[]> {
    let results = await database
    .selectFrom('user_options')
    .selectAll()
    .where(userOptionIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function selectUserOption(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UserOption> {
    let result = await database
    .selectFrom('user_options')
    .selectAll()
    .where('user_id', '=', userId)
    .executeTakeFirstOrThrow();

    return result;
}
async function insertUserOption(createUserOptionData: CreateUserOption, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database
    .insertInto('user_options')
    .values(createUserOptionData)
    .executeTakeFirstOrThrow();

    return result;
}
async function updateUserOption(userId: bigint, updateUserOptionData: UpdateUserOption, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('user_options')
    .where('user_id', '=', userId)
    .set(updateUserOptionData)
    .executeTakeFirstOrThrow();

    return result;
}
async function deleteUserOption(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('user_options')
    .where('user_id', '=', userId)
    .executeTakeFirstOrThrow();

    return result;
}
async function markUserOptionAsDeleted(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await updateUserOption(userId, {deleted: true, deleted_at: new Date().toUTCString()}, database);
    return result;
}

///////////////////////////////////////////////////////
/// User Detail Functions                           ///
///////////////////////////////////////////////////////

async function countUserDetails(database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('user_details')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .filterWhere(userDetailIsListable)
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selectUserDetails(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UserDetail[]> {
    let results = await database
    .selectFrom('user_details')
    .selectAll()
    .where(userDetailIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function selectUserDetail(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UserDetail> {
    let result = await database
    .selectFrom('user_details')
    .selectAll()
    .where('user_id', '=', userId)
    .executeTakeFirstOrThrow();

    return result;
}
async function insertUserDetail(createUserDetailData: CreateUserDetail, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database
    .insertInto('user_details')
    .values(createUserDetailData)
    .executeTakeFirstOrThrow();

    return result;
}
async function updateUserDetail(userId: bigint, updateUserDetailData: UpdateUserDetail, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('user_details')
    .where('user_id', '=', userId)
    .set(updateUserDetailData)
    .executeTakeFirstOrThrow();

    return result;
}
async function deleteUserDetail(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('user_details')
    .where('user_id', '=', userId)
    .executeTakeFirstOrThrow();

    return result;
}
async function markUserDetailAsDeleted(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await updateUserDetail(userId, {deleted: true, deleted_at: new Date().toUTCString()}, database);
    return result;
}

///////////////////////////////////////////////////////
/// User Credential Functions                       ///
///////////////////////////////////////////////////////

async function countUserCredentials(database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('user_credentials')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .filterWhere(userCredentialIsListable)
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selectUserCredentials(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UserCredential[]> {
    let results = await database
    .selectFrom('user_credentials')
    .selectAll()
    .where(userCredentialIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function selectUserCredential(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UserCredential> {
    let result = await database
    .selectFrom('user_credentials')
    .selectAll()
    .where('user_id', '=', userId)
    .executeTakeFirstOrThrow();

    return result;
}
async function insertUserCredential(createUserCredentialData: CreateUserCredential, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database
    .insertInto('user_credentials')
    .values(createUserCredentialData)
    .executeTakeFirstOrThrow();

    return result;
}
async function updateUserCredential(userId: bigint, updateUserCredentialData: UpdateUserCredential, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('user_credentials')
    .where('user_id', '=', userId)
    .set(updateUserCredentialData)
    .executeTakeFirstOrThrow();

    return result;
}
async function deleteUserCredential(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('user_credentials')
    .where('user_id', '=', userId)
    .executeTakeFirstOrThrow();

    return result;
}
async function markUserCredentialAsDeleted(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await updateUserCredential(userId, {deleted: true, deleted_at: new Date().toUTCString()}, database);
    return result;
}

///////////////////////////////////////////////////////
/// User Permission Functions                       ///
///////////////////////////////////////////////////////

async function countUserPermissions(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
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
async function selectUserPermissions(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UserPermission[]> {
    let results = await database
    .selectFrom('user_permissions')
    .where(userPermissionIsListable(userId))
    .selectAll()
    .execute();

    return results;
}
async function selectUserPermissionsAsPermissions(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Permission[]> {
    let results = await database
    .selectFrom('user_permissions')
    .innerJoin('permisions', 'permisions.id', 'user_permissions.id')
    .where(userPermissionIsListable(userId))
    .selectAll('permisions')
    .execute();

    return results;
}
async function selectUserPermission(userId: bigint, permissionId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UserPermission> {
    let result = await database
    .selectFrom('user_permissions')
    .where((expressionBuilder) => expressionBuilder.and([
        expressionBuilder('user_id', '=', userId),
        expressionBuilder('permission_id', '=', permissionId),
    ]))
    .selectAll()
    .executeTakeFirstOrThrow();

    return result;
}
async function insertUserPermission(createUserPermissionData: CreateUserPermission, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database
    .insertInto('user_permissions')
    .values(createUserPermissionData)
    .executeTakeFirstOrThrow();

    return result;
}
async function updateUserPermission(userId: bigint, permissionId: bigint, updateUserPermissionData: UpdateUserPermission, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('user_permissions')
    .where((expressionBuilder) => expressionBuilder.and([
        expressionBuilder('user_id', '=', userId),
        expressionBuilder('permission_id', '=', permissionId),
    ]))
    .set(updateUserPermissionData)
    .executeTakeFirstOrThrow();

    return result;
}
async function deleteUserPermission(userId: bigint, permissionId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('user_permissions')
    .where((expressionBuilder) => expressionBuilder.and([
        expressionBuilder('user_id', '=', userId),
        expressionBuilder('permission_id', '=', permissionId),
    ]))
    .executeTakeFirstOrThrow();

    return result;
}
async function deleteUserPermissions(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let numDeletedRows = BigInt(0);
    let results = await database
    .deleteFrom('user_permissions')
    .where('user_id', '=', userId)
    .execute();

    for (let result of results) numDeletedRows += result.numDeletedRows;

    return new DeleteResult(numDeletedRows);
}
async function markUserPermissionAsDeleted(userId: bigint, permissionId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await updateUserPermission(userId, permissionId, {deleted: true, deleted_at: new Date().toUTCString()}, database);
    return result;
}
async function markUserPermissionsAsDeleted(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let numUpdatedRows = BigInt(0);
    let results = await database
    .updateTable('user_permissions')
    .where('user_id', '=', userId)
    .set({deleted: true, deleted_at: new Date().toUTCString()})
    .execute();

    for (let result of results) numUpdatedRows += result.numUpdatedRows;

    return new UpdateResult(numUpdatedRows, undefined);
}

///////////////////////////////////////////////////////
/// Combined Functions                              ///
///////////////////////////////////////////////////////

async function insert(createUser: CreateUser, createUserOptionData: Omit<CreateUserOption, 'user_id'>, createUserDetailData: Omit<CreateUserDetail, 'user_id'>, createUserCredentialData: Omit<CreateUserCredential, 'user_id'>, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database.transaction().execute(async (transaction) => {
        let numInsertedOrUpdatedRows = BigInt(0);
        let userResult = await insertUser(createUser, transaction);
        let userOptionResult = await insertUserOption({...createUserOptionData, user_id: userResult.insertId!}, transaction);
        let userDetailResult = await insertUserDetail({...createUserDetailData, user_id: userResult.insertId!}, transaction);
        let userCredentialResult = await insertUserCredential({...createUserCredentialData, user_id: userResult.insertId!}, transaction);

        numInsertedOrUpdatedRows += userResult.numInsertedOrUpdatedRows || BigInt(0);
        numInsertedOrUpdatedRows += userOptionResult.numInsertedOrUpdatedRows || BigInt(0);
        numInsertedOrUpdatedRows += userDetailResult.numInsertedOrUpdatedRows || BigInt(0);
        numInsertedOrUpdatedRows += userCredentialResult.numInsertedOrUpdatedRows || BigInt(0);

        return new InsertResult(userResult.insertId, numInsertedOrUpdatedRows);
    });

    return result;
}
async function update(userId: bigint, updateUserData: UpdateUser = {}, updateUserOptionData: UpdateUserOption = {}, updateUserDetailData: UpdateUserDetail = {}, updateUserCredentailData: UpdateUserCredential = {}, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database.transaction().execute(async (transaction) => {
        let numUpdatedRows = BigInt(0);
        let userResult = await updateUser(userId, updateUserData, transaction);
        let userOptionResult = await updateUserOption(userId, updateUserOptionData, transaction);
        let userDetailResult = await updateUserDetail(userId, updateUserDetailData, transaction);
        let userCredentialResult = await updateUserCredential(userId, updateUserCredentailData, transaction);

        numUpdatedRows += userResult.numUpdatedRows;
        numUpdatedRows += userOptionResult.numUpdatedRows;
        numUpdatedRows += userDetailResult.numUpdatedRows;
        numUpdatedRows += userCredentialResult.numUpdatedRows;

        return new UpdateResult(numUpdatedRows, undefined);
    });

    return result;
}
async function Delete(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database.transaction().execute(async (transaction) => {
        let numDeletedRows = BigInt(0);
        let userPermissionResult = await deleteUserPermissions(userId, transaction);
        let userCredentialResult = await deleteUserCredential(userId, transaction);
        let userDetailResult = await deleteUserDetail(userId, transaction);
        let userOptionResult = await deleteUserOption(userId, transaction);
        let userResult = await deleteUser(userId, transaction);
        
        numDeletedRows += userPermissionResult.numDeletedRows;
        numDeletedRows += userResult.numDeletedRows;
        numDeletedRows += userOptionResult.numDeletedRows;
        numDeletedRows += userDetailResult.numDeletedRows;
        numDeletedRows += userCredentialResult.numDeletedRows;

        return new DeleteResult(numDeletedRows);
    });

    return result;
}
async function MarkAsDeleted(userId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database.transaction().execute(async (transaction) => {
        let numUpdatedRows = BigInt(0);
        let userResult = await markUserAsDeleted(userId, transaction);
        let userOptionResult = await markUserOptionAsDeleted(userId, transaction);
        let userDetailResult = await markUserDetailAsDeleted(userId, transaction);
        let userCredentialResult = await markUserCredentialAsDeleted(userId, transaction);
        let userPermissionResult = await markUserPermissionsAsDeleted(userId, transaction);

        numUpdatedRows += userResult.numUpdatedRows;
        numUpdatedRows += userOptionResult.numUpdatedRows;
        numUpdatedRows += userDetailResult.numUpdatedRows;
        numUpdatedRows += userCredentialResult.numUpdatedRows;
        numUpdatedRows += userPermissionResult.numUpdatedRows;

        return new UpdateResult(numUpdatedRows, undefined);
    });

    return result;
}

///////////////////////////////////////////////////////
/// User Service Setup                              ///
///////////////////////////////////////////////////////

export const UserService = {
    countUsers,
    selectUsers,
    selectUser,
    insertUser,
    updateUser,
    deleteUser,
    markUserAsDeleted,
    markUserAsBanned,
    markUserAsValidated,

    countUserOptions,
    selectUserOptions,
    selectUserOption,
    insertUserOption,
    updateUserOption,
    deleteUserOption,
    markUserOptionAsDeleted,

    countUserDetails,
    selectUserDetails,
    selectUserDetail,
    insertUserDetail,
    updateUserDetail,
    deleteUserDetail,
    markUserDetailAsDeleted,

    countUserCredentials,
    selectUserCredentials,
    selectUserCredential,
    insertUserCredential,
    updateUserCredential,
    deleteUserCredential,
    markUserCredentialAsDeleted,

    countUserPermissions,
    selectUserPermissions,
    selectUserPermissionsAsPermissions,
    selectUserPermission,
    insertUserPermission,
    updateUserPermission,
    deleteUserPermission,
    deleteUserPermissions,
    markUserPermissionAsDeleted,
    markUserPermissionsAsDeleted,

    insert,
    update,
    delete: Delete,
    MarkAsDeleted,
}