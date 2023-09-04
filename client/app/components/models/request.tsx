export interface RequestObject {
    id: string;
    content: string;
    topic: 'review' | 'report';
    reference_type: 'user' | 'blog' | 'comment';
    reference_id: string;
    sender_id: string;
    reviewed: boolean;
    reviewed_at: Date | null;
    deleted: boolean;
    deleted_at: Date | null;
    updated_at: Date;
    created_at: Date;
}