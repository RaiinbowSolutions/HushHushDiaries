import { Category, CreateCategory, UpdateCategory } from '../models/category.model';
import { Database, DatabaseSchema } from './../utilities/database';
import { DeleteResult, InsertResult, Kysely, Transaction, UpdateResult, WhereExpressionFactory } from "kysely";
///////////////////////////////////////////////////////
/// Filters                                         ///
///////////////////////////////////////////////////////

const categoryIsListable: WhereExpressionFactory<DatabaseSchema, 'categories'> = (expressionBuilder) => {
    return expressionBuilder.or([
        expressionBuilder('categories.deleted', '!=', true),
    ]);
}

///////////////////////////////////////////////////////
/// Category Functions                              ///
///////////////////////////////////////////////////////

async function counts(database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<bigint> {
    let result = await database
    .selectFrom('categories')
    .select(
        (expressionBuilder) => expressionBuilder.fn
        .count<bigint>('id')
        .filterWhere(categoryIsListable)
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}

async function selects(offset: number, limit:number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Category[]> {
    let results = await database 
    .selectFrom('categories')
    .selectAll()
    .where(categoryIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}

async function select(categoryId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Category> {
    let result = await database
    .selectFrom('categories')
    .selectAll()
    .where('id', '=', categoryId)
    .executeTakeFirstOrThrow();

    return result;
}

async function insert(createCategoryData: CreateCategory, database: Kysely<DatabaseSchema>  | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database
    .insertInto('categories')
    .values(createCategoryData)
    .executeTakeFirstOrThrow();

    return result;
}

async function update(categoryId: bigint, UpdateCategoryData: UpdateCategory, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('categories')
    .where('id', '=', categoryId)
    .set(UpdateCategoryData)
    .executeTakeFirstOrThrow();

    return result;
}

async function Delete(categoryId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('categories')
    .where('id', '=', categoryId)
    .executeTakeFirstOrThrow();

    return result;
}

async function markAsDeleted(categoryId: bigint, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(categoryId, {deleted: true, deleted_at: new Date().toUTCString()}, database);
    return result;
}

///////////////////////////////////////////////////////
/// Category Service Setup                          ///
///////////////////////////////////////////////////////

export const CategoryService = {
    counts, 
    selects, 
    select, 
    insert, 
    update, 
    delete: Delete, 
    markAsDeleted,
}