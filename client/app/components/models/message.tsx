export interface MessageObject {
    id: string;
    content: string;
    topic: 'message';
    sender_id: string;
    receiver_id: string;
    reviewed: boolean;
    reviewed_at: Date | null;
    deleted: boolean;
    deleted_at: Date | null;
    updated_at: Date;
    created_at: Date;
}