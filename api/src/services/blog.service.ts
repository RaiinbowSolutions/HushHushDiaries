import { DeleteResult, InsertResult, Kysely, Transaction, UpdateResult, WhereExpressionFactory } from "kysely";
import { Database, DatabaseDateString, DatabaseSchema } from "../utilities/database";
import { SelectBlog, CreateBlog, UpdateBlog, Blog } from "../models/blog.model";
import { SelectLike } from "../models/like.model";
import { SelectUser } from "../models/user.model";
import { Minify } from "../utilities/minify";

///////////////////////////////////////////////////////
/// Default Templates                               ///
///////////////////////////////////////////////////////

const DefaultBlog: Omit<CreateBlog, 'title' | 'content' | 'category_id' | 'author_id'> = {
    reviewed: false,
    published: false,
    approved: false,
    deleted: false
}

///////////////////////////////////////////////////////
/// Filters                                         ///
///////////////////////////////////////////////////////

const blogIsListable: WhereExpressionFactory<DatabaseSchema, 'blogs'> = (expressionBuilder) => {
    return expressionBuilder.or([
        expressionBuilder('blogs.deleted', '!=', true),
    ]);
}
const blogLikeIsListable: (blogId: SelectLike['refecence_id']) => WhereExpressionFactory<DatabaseSchema, 'likes'> = (blogId) => {
    return (expressionBuilder) => {
        return expressionBuilder.and([
            expressionBuilder('likes.refecence_id', '=', blogId),
            expressionBuilder('likes.refecence_type', '=', 'blog'),
            expressionBuilder.or([
                expressionBuilder('likes.deleted', '!=', true),
            ]),
        ]);
    };
}

///////////////////////////////////////////////////////
/// Blog Functions                                  ///
///////////////////////////////////////////////////////

async function counts(database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('blogs')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .as('total')
    )
    .where(blogIsListable)
    .executeTakeFirstOrThrow();

    return BigInt(result.total);
}
async function selects(offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectBlog[]> {
    let results = await database
    .selectFrom('blogs')
    .selectAll()
    .where(blogIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function select(blogId: SelectBlog['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectBlog> {
    let result = await database
    .selectFrom('blogs')
    .selectAll()
    .where('id', '=', blogId)
    .executeTakeFirstOrThrow();

    return result;
}
async function insert(userId: CreateBlog['author_id'], title: CreateBlog['title'], content: CreateBlog['content'], categoryId: CreateBlog['category_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database
    .insertInto('blogs')
    .values({...DefaultBlog, author_id: userId, title, content, category_id: categoryId})
    .executeTakeFirstOrThrow();

    return result;
}
async function update(blogId: SelectBlog['id'], updateBlogData: UpdateBlog, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('blogs')
    .where('id', '=', blogId)
    .set(updateBlogData)
    .executeTakeFirstOrThrow();

    return result;
}
async function Delete(blogId: SelectBlog['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('blogs')
    .where('id', '=', blogId)
    .executeTakeFirstOrThrow();

    return result;
}
async function markAsDeleted(blogId: SelectBlog['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(blogId, {deleted: true, deleted_at: DatabaseDateString(new Date())}, database);
    return result;
}
async function markAsReviewed(blogId: SelectBlog['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(blogId, {reviewed: true, reviewed_at: DatabaseDateString(new Date())}, database);
    return result;
}
async function markAsApproved(blogId: SelectBlog['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(blogId, {approved: true, approved_at: DatabaseDateString(new Date())}, database);
    return result;
}
async function markAsPublished(blogId: SelectBlog['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(blogId, {published: true, published_at: DatabaseDateString(new Date())}, database);
    return result;
}

///////////////////////////////////////////////////////
/// Blog Like Functions                             ///
///////////////////////////////////////////////////////

async function countLikes(blogId: SelectLike['refecence_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('likes')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .as('total')
    )
    .where(blogLikeIsListable(blogId))
    .executeTakeFirstOrThrow();

    return BigInt(result.total);
}

///////////////////////////////////////////////////////
/// Blog Filter Functions                           ///
///////////////////////////////////////////////////////

async function filterBlogs(as: SelectUser['id'], blogs: SelectBlog[], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Blog[]> {
    let results = await database.transaction().execute(async (transaction) => {
        let filtered: Blog[] = [];

        for (let blog of blogs) filtered.push(await filterBlog(as, blog, transaction));

        return filtered;
    })

    return results;
}
async function filterBlog(as: SelectUser['id'], blog: SelectBlog, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Blog> {
    let id = Minify.encode(blog.id);
    let category_id = Minify.encode(blog.category_id);
    let author_id = Minify.encode(blog.author_id);

    return {
        ...blog,
        id,
        category_id,
        author_id,
    }
}

///////////////////////////////////////////////////////
/// Blog Service Setup                              ///
///////////////////////////////////////////////////////

export const BlogService = {
    counts,
    selects,
    select,
    insert,
    update,
    delete: Delete,
    markAsDeleted,
    markAsReviewed,
    markAsApproved,
    markAsPublished,
    countLikes,
    filters: {
        blogs: filterBlogs,
        blog: filterBlog,
    }
}