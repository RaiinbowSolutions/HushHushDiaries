import { ColumnType, Insertable, Selectable, Updateable } from "kysely";

type SizeOption = 'small' | 'medium' | 'large';
type DesignTempatureOption = 'cold' | 'normal' | 'warm';
type ShowStateOption = 'hidden' | 'public';
type GenderOption = 'female' | 'male' | 'nonbinary' | 'transwoman' | 'transman';

/**
 * Kysely definition for the User Table.
 */
export interface UserTable {
    id: ColumnType<bigint, never, never>;
    email: string;
    username: string | undefined;
    anonym: boolean;
    validated: boolean;
    validated_at: ColumnType<Date | undefined, string | undefined, string | undefined>;
    banned: boolean;
    banned_at: ColumnType<Date | undefined, string | undefined, string | undefined>;
    deleted: boolean;
    deleted_at: ColumnType<Date | undefined, string | undefined, string | undefined>;
    updated_at: ColumnType<Date, never, never>;
    created_at: ColumnType<Date, never, never>;
}
export type SelectUser = Selectable<UserTable>;
export type CreateUser = Insertable<UserTable>;
export type UpdateUser = Updateable<UserTable>;
export type User = Omit<SelectUser, 'id' | 'username'> & {
    id: string,
    username: string,
};

/**
 * Kysely definition for the User Permission Table.
 */
export interface UserPermissionTable {
    id: ColumnType<bigint, never, never>;
    user_id: bigint;
    permission_id: bigint;
    deleted: boolean;
    deleted_at: ColumnType<Date | undefined, string | undefined, string | undefined>;
    updated_at: ColumnType<Date, never, never>;
    created_at: ColumnType<Date, never, never>;
}
export type SelectUserPermission = Selectable<UserPermissionTable>;
export type CreateUserPermission = Insertable<UserPermissionTable>;
export type UpdateUserPermission = Updateable<UserPermissionTable>;
export type UserPermission = Omit<SelectUserPermission, 'id' | 'user_id' | 'permission_id'> & {
    id: string, 
    user_id: string, 
    permission_id: string,
};

/**
 * Kysely definition for the User Option Table.
 */
export interface UserOptionTable {
    id: ColumnType<bigint, never, never>;
    user_id: bigint;
    font_size: SizeOption;
    design_tempature: DesignTempatureOption;
    email_show_state: ShowStateOption;
    username_show_state: ShowStateOption;
    firstname_show_state: ShowStateOption;
    lastname_show_state: ShowStateOption;
    description_show_state: ShowStateOption;
    birthday_show_state: ShowStateOption;
    gender_show_state: ShowStateOption;
    pronouns_show_state: ShowStateOption;
    profile_description_show_state: ShowStateOption;
    deleted: boolean;
    deleted_at: ColumnType<Date | undefined, string | undefined, string | undefined>;
    updated_at: ColumnType<Date, never, never>;
    created_at: ColumnType<Date, never, never>;
}
export type SelectUserOption = Selectable<UserOptionTable>;
export type CreateUserOption = Insertable<UserOptionTable>;
export type UpdateUserOption = Updateable<UserOptionTable>;
export type UserOption = Omit<SelectUserOption, 'id' | 'user_id'> & {
    id: string, 
    user_id: string,
};

/**
 * Kysely definition for the User Detail Table.
 */
export interface UserDetailTable {
    id: ColumnType<bigint, never, never>;
    user_id: bigint;
    firstname: string | undefined;
    lastname: string | undefined;
    birthday: ColumnType<Date | undefined, string | undefined, string | undefined>;
    gender: GenderOption | undefined;
    pronouns: string | undefined;
    profile_description: string | undefined;
    deleted: boolean;
    deleted_at: ColumnType<Date | undefined, string | undefined, string | undefined>;
    updated_at: ColumnType<Date, never, never>;
    created_at: ColumnType<Date, never, never>;
}
export type SelectUserDetail = Selectable<UserDetailTable>;
export type CreateUserDetail = Insertable<UserDetailTable>;
export type UpdateUserDetail = Updateable<UserDetailTable>;
export type UserDetail = Omit<SelectUserDetail, 'id' | 'user_id' | 'birthday' | 'gender'> & {
    id: string, 
    user_id: string,
    birthday: string,
    gender: string,
};

/**
 * Kysely definition for the User Credential Table.
 */
export interface UserCredentialTable {
    id: ColumnType<bigint, never, never>;
    user_id: bigint;
    password: string;
    salt: string;
    deleted: boolean;
    deleted_at: ColumnType<Date | undefined, string | undefined, string | undefined>;
    updated_at: ColumnType<Date, never, never>;
    created_at: ColumnType<Date, never, never>;
}
export type SelectUserCredential = Selectable<UserCredentialTable>;
export type CreateUserCredential = Insertable<UserCredentialTable>;
export type UpdateUserCredential = Updateable<UserCredentialTable>;
export type UserCredential = Omit<SelectUserCredential, 'id' | 'user_id'> & {
    id: string,
    user_id: string,
};