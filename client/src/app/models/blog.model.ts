export type Blog = {
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

export type BlogCreateData = {
    title: string;
    keywords: string | null | undefined;
    description: string | null | undefined;
    content: string; 
    category_id: string; 
    author_id: string;
}

export type BlogCreated = {
    created: boolean, 
    id: string, 
    path: string,
}

export type BlogUpdateData = Omit<Partial<Blog>, 'title' | 'keywords' | 'description' | 'content' | 'category_id' 
| 'author_id' | 'reviewed_at' | 'deleted' | 'deleted_at' | 'published' | 'published_at' | 'approved' | 'updated_at'>;