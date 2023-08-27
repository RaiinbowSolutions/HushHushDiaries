import { SelectCategory, CreateCategory, UpdateCategory, Category } from '../models/category.model';
import { SelectUser } from '../models/user.model';
import { Minify } from '../utilities/minify';
import { Database, DatabaseDateString, DatabaseSchema } from './../utilities/database';
import { DeleteResult, InsertResult, Kysely, Transaction, UpdateResult, WhereExpressionFactory } from "kysely";

///////////////////////////////////////////////////////
/// Default Templates                               ///
///////////////////////////////////////////////////////

const DefualtCategory: Omit<CreateCategory, 'name'> = {
    deleted: false,
}

///////////////////////////////////////////////////////
/// Filters                                         ///
///////////////////////////////////////////////////////

const CategoryIsListable: WhereExpressionFactory<DatabaseSchema, 'categories'> = (expressionBuilder) => {
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
        .filterWhere(CategoryIsListable)
        .as('total')
    )
    .executeTakeFirstOrThrow();

    return result.total;
}

async function selects(offset: number, limit:number, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectCategory[]> {
    let results = await database 
    .selectFrom('categories')
    .selectAll()
    .where(CategoryIsListable)
    .offset(offset)
    .limit(limit)
    .execute();

    return results;
}

async function select(categoryId: SelectCategory['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<SelectCategory> {
    let result = await database
    .selectFrom('categories')
    .selectAll()
    .where('id', '=', categoryId)
    .executeTakeFirstOrThrow();

    return result;
}

async function insert(name: CreateCategory['name'], description: CreateCategory['description'], database: Kysely<DatabaseSchema>  | Transaction<DatabaseSchema> = Database): Promise<InsertResult> {
    let result = await database
    .insertInto('categories')
    .values({...DefualtCategory, name, description})
    .executeTakeFirstOrThrow();

    return result;
}

async function update(categoryId: SelectCategory['id'], UpdateCategoryData: UpdateCategory, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await database
    .updateTable('categories')
    .where('id', '=', categoryId)
    .set(UpdateCategoryData)
    .executeTakeFirstOrThrow();

    return result;
}

async function Delete(categoryId: SelectCategory['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<DeleteResult> {
    let result = await database
    .deleteFrom('categories')
    .where('id', '=', categoryId)
    .executeTakeFirstOrThrow();

    return result;
}

async function markAsDeleted(categoryId: SelectCategory['id'], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<UpdateResult> {
    let result = await update(categoryId, {deleted: true, deleted_at: DatabaseDateString(new Date())}, database);
    return result;
}

///////////////////////////////////////////////////////
/// Category Filter Functions                       ///
///////////////////////////////////////////////////////

async function filterCategories(as: SelectUser['id'], categories: SelectCategory[], database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Category[]> {
    let results = await database.transaction().execute(async (transaction) => {
        let filtered: Category[] = [];

        for (let category of categories) filtered.push(await filterCategory(as, category, transaction));

        return filtered;
    })

    return results;
}
async function filterCategory(as: SelectUser['id'], category: SelectCategory, database: Kysely<DatabaseSchema> | Transaction<DatabaseSchema> = Database): Promise<Category> {
    let id = Minify.encode(category.id);

    return {
        ...category,
        id,
    }
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
    filters: {
        categories: filterCategories,
        category: filterCategory,
    }
}