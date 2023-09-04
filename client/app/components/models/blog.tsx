export interface BlogObject {
    id: string;
    title: string;
    keywords: string | null;
    description: string | null;
    content: string;
    category_id: string;
    author_id: string;
    reviewed: boolean;
    reviewed_at: Date | null;
    published: boolean;
    published_at: Date | null;
    approved: boolean;
    approved_at: Date | null;
    deleted: boolean;
    deleted_at: Date | null;
    updated_at: Date;
    created_at: Date;
}