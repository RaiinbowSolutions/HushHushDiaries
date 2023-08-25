import { Kysely, Transaction, WhereExpressionFactory, InsertResult, UpdateResult, DeleteResult } from "kysely";
import { Database, DatabaseSchema } from "../utilities/database";
import { CreateUser, CreateUserCredential, CreateUserDetail, CreateUserOption, CreateUserPermission, UpdateUser, UpdateUserCredential, UpdateUserDetail, UpdateUserOption, SelectUser, SelectUserCredential, SelectUserDetail, SelectUserOption, SelectUserPermission, User, UserDetail, UserOption, UserCredential } from "../models/user.model";
import { SelectPermission } from "../models/permission.model";
import { Minify } from "../utilities/minify";

///////////////////////////////////////////////////////
/// Default Templates                               ///
///////////////////////////////////////////////////////

const DefaultUser: Omit<CreateUser, 'email'> = {
    anonym: false,
    validated: false,
    banned: false,
    deleted: false,
}
const DefaultUserOption: Omit<CreateUserOption, 'user_id'> = {
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
const DefaultUserDetial: Omit<CreateUserDetail, 'user_id'> = {
    deleted: false,
}
const DefualtUserCredentail: Omit<CreateUserCredential, 'user_id' | 'password' | 'salt'> = {
    deleted: false,
}
const DefaultUserPermission: Omit<CreateUserPermission, 'user_id' | 'permission_id'> = {
    deleted: false,
}

///////////////////////////////////////////////////////
/// Filters                                         ///
///////////////////////////////////////////////////////

const UserIsListable: WhereExpressionFactory<DatabaseSchema, 'users'> = (expressionBuilder) => {
    return expressionBuilder.or([
        expressionBuilder('users.validated', '!=', false),
        expressionBuilder('users.banned', '!=', true),
        expressionBuilder('users.deleted', '!=', true),
    ]);
}
const UserPermissionIsListable: (userId: SelectUserPermission['id']) => WhereExpressionFactory<DatabaseSchema, 'user_permissions'> = (userId) => {
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
        .filterWhere(UserIsListable)
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selects(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectUser[]> {
    let results = await database
    .selectFrom('users')
    .selectAll()
    .where(UserIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function select(userId: SelectUser['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectUser> {
    let result = await database
    .selectFrom('users')
    .selectAll()
    .where('id', '=', userId)
    .executeTakeFirstOrThrow();

    return result;
}
async function insert(email: CreateUser['email'], password: CreateUserCredential['password'], salt: CreateUserCredential['salt'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database.transaction().execute(async (transaction) => {
        let numInsertedOrUpdatedRows = BigInt(0);

        let userResult = await transaction
        .insertInto('users')
        .values({...DefaultUser, email})
        .executeTakeFirstOrThrow();

        let userOptionResult = await transaction
        .insertInto('user_options')
        .values({...DefaultUserOption, user_id: userResult.insertId!})
        .executeTakeFirstOrThrow();

        let userDetailResult = await transaction
        .insertInto('user_details')
        .values({...DefaultUserDetial, user_id: userResult.insertId!})
        .executeTakeFirstOrThrow();

        let userCredentialResult = await transaction
        .insertInto('user_credentials')
        .values({...DefualtUserCredentail, user_id: userResult.insertId!, password, salt})
        .executeTakeFirstOrThrow();

        numInsertedOrUpdatedRows += userResult.numInsertedOrUpdatedRows || BigInt(0);
        numInsertedOrUpdatedRows += userOptionResult.numInsertedOrUpdatedRows || BigInt(0);
        numInsertedOrUpdatedRows += userDetailResult.numInsertedOrUpdatedRows || BigInt(0);
        numInsertedOrUpdatedRows += userCredentialResult.numInsertedOrUpdatedRows || BigInt(0);

        return new InsertResult(userResult.insertId, numInsertedOrUpdatedRows);
    });

    return result;
}
async function update(userId: SelectUser['id'], updateUserData: UpdateUser, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('users')
    .where('id', '=', userId)
    .set(updateUserData)
    .executeTakeFirstOrThrow();

    return result;
}
async function Delete(userId: SelectUser['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
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
async function markAsDeleted(userId: SelectUser['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
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
async function markAsBanned(userId: SelectUser['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(userId, {banned: true, banned_at: new Date().toUTCString()}, database);
    return result;
}
async function markAsValidated(userId: SelectUser['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(userId, {validated: true, validated_at: new Date().toUTCString()}, database);
    return result;
}

///////////////////////////////////////////////////////
/// User Option Functions                           ///
///////////////////////////////////////////////////////

async function selectOption(userId: SelectUserOption['user_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectUserOption> {
    let result = await database
    .selectFrom('user_options')
    .selectAll()
    .where('user_id', '=', userId)
    .executeTakeFirstOrThrow();

    return result;
}
async function updateOption(userId: SelectUserOption['user_id'], updateUserOptionData: UpdateUserOption, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
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

async function selectDetail(userId: SelectUserDetail['user_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectUserDetail> {
    let result = await database
    .selectFrom('user_details')
    .selectAll()
    .where('user_id', '=', userId)
    .executeTakeFirstOrThrow();

    return result;
}
async function updateDetail(userId: SelectUserDetail['user_id'], updateUserDetailData: UpdateUserDetail, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
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

async function selectCredential(userId: SelectUserCredential['user_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectUserCredential> {
    let result = await database
    .selectFrom('user_credentials')
    .selectAll()
    .where('user_id', '=', userId)
    .executeTakeFirstOrThrow();

    return result;
}
async function updateCredential(userId: SelectUserCredential['user_id'], updateUserCredentialData: UpdateUserCredential, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
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

async function countPermissions(userId: SelectUserPermission['user_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('user_permissions')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .filterWhere(UserPermissionIsListable(userId))
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}
async function selectPermissions(userId: SelectUserPermission['user_id'], offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectPermission[]> {
    let results = await database
    .selectFrom('user_permissions')
    .innerJoin('permisions', 'permisions.id', 'user_permissions.id')
    .where(UserPermissionIsListable(userId))
    .selectAll('permisions')
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}

async function addPermission(userId: CreateUserPermission['user_id'], permissionId: CreateUserPermission['permission_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult | UpdateResult> {
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
    .values({...DefaultUserPermission, user_id: userId, permission_id: permissionId})
    .executeTakeFirstOrThrow();

    return insertResult;
}
async function removePermission(userId: SelectUserPermission['user_id'], permissionId: SelectUserPermission['permission_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
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
/// User Find Functions                             ///
///////////////////////////////////////////////////////

async function findUserIdByEmail(email: SelectUser['email'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectUser['id'] | undefined> {
    let result = await database
    .selectFrom('users')
    .select('id')
    .where('email', '=', email)
    .executeTakeFirst();

    return result ? result.id : undefined;
}

///////////////////////////////////////////////////////
/// User Filter Functions                           ///
///////////////////////////////////////////////////////

async function filterUsers(as: SelectUser['id'], users: SelectUser[], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<User[]> {
    let results = await database.transaction().execute(async (transaction) => {
        let filtered: User[] = [];

        for (let user of users) filtered.push(await filterUser(as, user, transaction));

        return filtered;
    })

    return results;
}
async function filterUser(as: SelectUser['id'], user: SelectUser, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<User> {
    let option = await selectOption(user.id, database);
    let id = Minify.encode(user.id);
    let email = 'hidden';
    let username = 'anonym';

    if (as == user.id || option.email_show_state == 'public') email = user.email;
    if (as == user.id || option.username_show_state == 'public') username = user.username || 'hidden';

    return {
        ...user,
        id,
        email,
        username,
    }
}
async function filterUserOptions(as: SelectUser['id'], userOptions: SelectUserOption[], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UserOption[]> {
    let results = await database.transaction().execute(async (transaction) => {
        let filtered: UserOption[] = [];

        for (let user of userOptions) filtered.push(await filterUserOption(as, user, transaction));

        return filtered;
    })

    return results;
}
async function filterUserOption(as: SelectUser['id'], userOption: SelectUserOption, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UserOption> {
    let id = Minify.encode(userOption.id);
    let user_id = Minify.encode(userOption.user_id);

    return {
        ...userOption,
        id,
        user_id,
    }
}
async function filterUserDetails(as: SelectUser['id'], userDetials: SelectUserDetail[], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UserDetail[]> {
    let results = await database.transaction().execute(async (transaction) => {
        let filtered: UserDetail[] = [];

        for (let userDetail of userDetials) filtered.push(await filterUserDetail(as, userDetail, transaction));

        return filtered;
    })

    return results;
}
async function filterUserDetail(as: SelectUser['id'], userDetial: SelectUserDetail, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UserDetail> {
    let option = await selectOption(userDetial.user_id, database);
    let id = Minify.encode(userDetial.id);
    let user_id = Minify.encode(userDetial.user_id);
    let firstname = 'hidden';
    let lastname = 'hidden';
    let birthday = 'hidden';
    let gender = 'hidden';
    let pronouns = 'hidden';
    let profile_description = 'hidden';

    if (as == userDetial.user_id || option.firstname_show_state == 'public') firstname = userDetial.firstname || firstname;
    if (as == userDetial.user_id || option.lastname_show_state == 'public') lastname = userDetial.lastname || lastname;
    if (as == userDetial.user_id || option.birthday_show_state == 'public') birthday = userDetial.birthday ? userDetial.birthday.toLocaleDateString() : undefined || birthday;
    if (as == userDetial.user_id || option.gender_show_state == 'public') gender = userDetial.gender || gender;
    if (as == userDetial.user_id || option.pronouns_show_state == 'public') pronouns = userDetial.pronouns || pronouns;
    if (as == userDetial.user_id || option.profile_description_show_state == 'public') profile_description = userDetial.profile_description || profile_description;

    return {
        ...userDetial,
        id,
        user_id,
        firstname,
        lastname,
        birthday,
        gender,
        pronouns,
        profile_description,
    }
}
async function filterUserCredentials(as: SelectUser['id'], userCredentials: SelectUserCredential[], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UserCredential[]> {
    let results = await database.transaction().execute(async (transaction) => {
        let filtered: UserCredential[] = [];

        for (let userCredential of userCredentials) filtered.push(await filterUserCredential(as, userCredential, transaction));

        return filtered;
    })

    return results;
}
async function filterUserCredential(as: SelectUser['id'], userCredential: SelectUserCredential, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UserCredential> {
    let id = Minify.encode(userCredential.id);
    let user_id = Minify.encode(userCredential.user_id);
    let password = 'hidden';
    let salt = 'hidden';

    if (as == userCredential.user_id) {
        password = userCredential.password;
        salt = userCredential.salt;
    }

    return {
        ...userCredential,
        id,
        user_id,
        password,
        salt,
    }
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
    findUserIdByEmail,
    filters: {
        users: filterUsers,
        user: filterUser,
        userOptions: filterUserOptions,
        userOption: filterUserOption,
        userDetials: filterUserDetails,
        userDetial: filterUserDetail,
        userCredentails: filterUserCredentials,
        userCredentail: filterUserCredential,
    }
}