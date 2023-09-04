type SizeOption = 'small' | 'medium' | 'large';
type DesignTempatureOption = 'cold' | 'normal' | 'warm';
type ShowStateOption = 'hidden' | 'public';
type GenderOption = 'female' | 'male' | 'nonbinary' | 'transwoman' | 'transman';

export interface UserObject {
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

export interface UserOptionObject {
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

export interface UserDetailObject {
    id: string;
    user_id: string;
    firstname: string | null | 'hidden';
    lastname: string | null | 'hidden';
    birthday: Date | null | 'hidden';
    gender: GenderOption | null | 'hidden';
    pronouns: string | null | 'hidden';
    profile_description: string | null | 'hidden';
    deleted: boolean;
    deleted_at: Date | null;
    updated_at: Date;
    created_at: Date;
}