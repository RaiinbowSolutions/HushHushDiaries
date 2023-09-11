type SizeOption = 'small' | 'medium' | 'large';
type DesignTempatureOption = 'cold' | 'normal' | 'warm';
type ShowStateOption = 'hidden' | 'public';
type GenderOption = 'female' | 'male' | 'nonbinary' | 'transwoman' | 'transman';

export const GenderOptions: GenderOption[] = ['female', 'male', 'nonbinary', 'transwoman', 'transman'];

export type User = {
    id: string;
    email: string;
    username: string | null;
    anonym: boolean;
    validated: boolean;
    validated_at: Date | null;
    banned: boolean;
    banned_at: Date | null;
    deleted: boolean;
    deleted_at: Date | null;
    updated_at: Date;
    created_at: Date;
}

export type UserOption = {
    id: string;
    user_id: string;
    font_size: SizeOption;
    design_tempature: DesignTempatureOption;
    email_show_state: ShowStateOption;
    username_show_state: ShowStateOption;
    firstname_show_state: ShowStateOption;
    lastname_show_state: ShowStateOption;
    birthday_show_state: ShowStateOption;
    gender_show_state: ShowStateOption;
    pronouns_show_state: ShowStateOption;
    profile_description_show_state: ShowStateOption;
    deleted: boolean;
    deleted_at: Date | null;
    updated_at: Date;
    created_at: Date;
}

export type UserDetail = {
    id: string;
    user_id: string;
    firstname: string | null;
    lastname: string | null;
    birthday: Date | null;
    gender: GenderOption | null;
    pronouns: string | null;
    profile_description: string | null;
    deleted: boolean;
    deleted_at: Date | null;
    updated_at: Date;
    created_at: Date;
}

export type UserCreateData = {
    email: string,
    password: string,
}

export type UserCreated = {
    created: boolean,
    id: string,
    path: string,
}

export type UserUpdateData = Omit<Partial<User>, 'id' | 'validated' | 'validated_at' | 'banned' | 'banned_at' | 'deleted' | 'deleted_at' | 'updated_at' | 'created_at'>;
export type UserOptionUpdateData = Omit<Partial<UserOption>, 'id' | 'user_id' | 'deleted' | 'deleted_at' | 'updated_at' | 'created_at'>;
export type UserDetailUpdateData = Omit<Partial<UserDetail>, 'id' | 'user_id' | 'deleted' | 'deleted_at' | 'updated_at' | 'created_at'>;
export type UserCredentialUpdateData = { password: string };