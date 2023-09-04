'use client'
import { CategoryObject } from "./models/category";

export async function GetCategories(): Promise<CategoryObject[]> {
    let response = await fetch('/.netlify/functions/api/categories', {
        method: 'GET',
    });
    let result: CategoryObject[] = await response.json();

    return result;
}