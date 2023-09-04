'use client'
import { FormEvent } from "react";

export async function CreateBlog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let data = new FormData(event.currentTarget);
    let body = {
        title: data.get('title')?.valueOf(),
        keywords: data.get('keywords')?.valueOf(),
        description: data.get('description')?.valueOf(),
        content: data.get('content')?.valueOf(),
        categoryid: data.get('category_id')?.valueOf(),
        authorid: data.get('author_id')?.valueOf(),
    };
    let response = await fetch('/.netlify/functions/api/blogs', {
        body: JSON.stringify(body),
        method: 'POST'
    });

    let blogs = await response.json();
    console.log(blogs);
}