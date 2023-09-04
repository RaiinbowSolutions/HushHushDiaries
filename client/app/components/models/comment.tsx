export interface CommentObject {
    id: string;
    content: string;
    author_id: string;
    refecence_type: 'blog' | 'comment';
    refecence_id: string;
    approved: boolean;
    approved_at: Date | null;
    reviewed: boolean;
    reviewed_at: Date | null;
    deleted: boolean;
    deleted_at: Date | null;
    updated_at: Date;
    created_at: Date;
}