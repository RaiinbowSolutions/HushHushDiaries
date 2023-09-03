'use client'
import { FormEvent } from "react";

export async function CreateBlog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let data = new FormData(event.currentTarget);
    let body = {
        
    }
}