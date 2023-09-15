export type Permission = {
    id: string;
    name: string;
    description: string | null;
    deleted: boolean;
    deleted_at: Date | null;
    updated_at: Date;
    created_at: Date;
}