'use client'
import { BlogObject } from "./models/blog";

export async function GetBlogs(): Promise<BlogObject[]> {
    let response = await fetch('/.netlify/functions/api/blogs', {
        method: 'GET',
    });
    let result: BlogObject[] = await response.json();

    return result;
}