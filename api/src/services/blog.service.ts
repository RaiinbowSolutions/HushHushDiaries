import { DeleteResult, InsertResult, Kysely, Transaction, UpdateResult } from "kysely";
import { Database, DatabaseDateString, DatabaseSchema, WhereExpressionFactory } from "../utilities/database";
import { SelectBlog, CreateBlog, UpdateBlog, Blog } from "../models/blog.model";
import { CreateLike, SelectLike } from "../models/like.model";
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
const DefualtLike: Omit<CreateLike, 'user_id' | 'refecence_type' | 'refecence_id'> = {
    deleted: false,
}

///////////////////////////////////////////////////////
/// Filters                                         ///
///////////////////////////////////////////////////////

const blogIsListable: WhereExpressionFactory<DatabaseSchema, 'blogs'> = (expressionBuilder) => {
    return expressionBuilder.or([
        expressionBuilder('blogs.deleted', '!=', true),
    ]);
}
const ownedBlogIsListable: (userId: SelectUser['id']) => WhereExpressionFactory<DatabaseSchema, 'blogs'> = (userId) => {
    return (expressionBuilder) => {
        return expressionBuilder.and([
            expressionBuilder('blogs.author_id', '=', userId),
            expressionBuilder.or([
                expressionBuilder('blogs.deleted', '!=', true),
            ]),
        ]);
    };
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
async function insert(userId: CreateBlog['author_id'], title: CreateBlog['title'], content: CreateBlog['content'], categoryId: CreateBlog['category_id'], keywords: CreateBlog['keywords'] = undefined, description: CreateBlog['description'] = undefined, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database
    .insertInto('blogs')
    .values({...DefaultBlog, author_id: userId, title, content, category_id: categoryId, keywords, description})
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
async function markAsUnpublished(blogId: SelectBlog['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(blogId, {published: false, published_at: null}, database);
    return result;
}
async function isOwnerOfBlog(blogId: SelectBlog['id'], ownerId: SelectUser['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<boolean> {
    let result = await database
    .selectFrom('blogs')
    .selectAll()
    .where((expressionBuilder) => expressionBuilder.and([
        expressionBuilder('id', '=', blogId),
        expressionBuilder('author_id', '=', ownerId)
    ]))
    .executeTakeFirst();

    return result !== undefined;
}

///////////////////////////////////////////////////////
/// Blog Owned Functions                            ///
///////////////////////////////////////////////////////

async function ownedCounts(userId: SelectUser['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('blogs')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .as('total')
    )
    .where(ownedBlogIsListable(userId))
    .executeTakeFirstOrThrow();

    return BigInt(result.total);
}
async function owned(userId: SelectUser['id'], offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectBlog[]> {
    let results = await database
    .selectFrom('blogs')
    .selectAll()
    .where(ownedBlogIsListable(userId))
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}
async function isOwnerOfOwned(userId: SelectUser['id'], ownerId: SelectUser['id'], offset: number, limit: number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<boolean> {
    let results = await database
    .selectFrom('blogs')
    .selectAll()
    .where(ownedBlogIsListable(userId))
    .offset(offset)
    .limit(limit)
    .execute();

    let owner = true;

    for (let result of results) {
        owner = result !== undefined && userId === ownerId;
        if (!owner) break;
    }

    return owner;
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
async function addLike(userId: SelectLike['user_id'], blogId: SelectLike['refecence_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<InsertResult | UpdateResult> {
    let updateResult = await database
    .updateTable('likes')
    .where((expressionBuilder) => expressionBuilder.and([
        expressionBuilder('user_id', '=', userId),
        expressionBuilder('refecence_id', '=', blogId),
        expressionBuilder('refecence_type', '=', 'blog'),
    ]))
    .set({deleted: false, deleted_at: undefined})
    .executeTakeFirst();

    if (updateResult.numUpdatedRows > 0) return updateResult;

    let insertResult = await database
    .insertInto('likes')
    .values({...DefualtLike, user_id: userId, refecence_id: blogId, refecence_type: 'blog'})
    .executeTakeFirstOrThrow();

    return insertResult;
}
async function removeLike(userId: SelectLike['user_id'], blogId: SelectLike['refecence_id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('likes')
    .where((expressionBuilder) => expressionBuilder.and([
        expressionBuilder('user_id', '=', userId),
        expressionBuilder('refecence_id', '=', blogId),
        expressionBuilder('refecence_type', '=', 'blog'),
        expressionBuilder('deleted', '!=', true),
    ]))
    .set({deleted: true, deleted_at: DatabaseDateString(new Date())})
    .executeTakeFirst();

    return result;
}
async function isOwnerOfLike(blogId: SelectLike['refecence_id'], ownerId: SelectUser['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<boolean> {
    let result = await database
    .selectFrom('likes')
    .selectAll()
    .where((expressionBuilder) => expressionBuilder.and([
        expressionBuilder('user_id', '=', ownerId),
        expressionBuilder('refecence_id', '=', blogId),
        expressionBuilder('refecence_type', '=', 'blog'),
        expressionBuilder('deleted', '!=', true),
    ]))
    .executeTakeFirst();

    return result !== undefined;
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
    let id = Minify.encode('blogs', blog.id);
    let category_id = Minify.encode('categories', blog.category_id);
    let author_id = Minify.encode('users', blog.author_id);

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
    markAsUnpublished,
    isOwner: isOwnerOfBlog,
    owned: {
        counts: ownedCounts,
        selects: owned,
        isOwner: isOwnerOfOwned,
    },
    likes: {
        counts: countLikes,
        add: addLike,
        remove: removeLike,
        isOwner: isOwnerOfLike,
    },
    filters: {
        blogs: filterBlogs,
        blog: filterBlog,
    }
}