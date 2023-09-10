export type Category = {
    id: string;
    name: string;
    description: string;
    deleted: boolean;
    deleted_at: Date | null;
    updated_at: Date;
    created_at: Date;
}