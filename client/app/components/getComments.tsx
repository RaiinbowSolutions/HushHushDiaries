'use client'
import { CommentObject } from "./models/comment";

export async function GetComments(): Promise<CommentObject[]> {
    let response = await fetch('/.netlify/functions/api/comments', {
        method: 'GET',
    });
    let result: CommentObject[] = await response.json();

    return result;
}