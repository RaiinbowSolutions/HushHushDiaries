import Link from "next/link";
import { FormEvent } from "react";

export default function CategoriesPage() {
    return (
        <>
            <h1>Categories</h1>
            
        </>
    )
}

export async function GetCategories(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let data = new FormData(event.currentTarget);
    let body = {
        name: data.getAll('name')?.values()
    };
    let response = await fetch('/.netlify/functions/api/category', {
        body: JSON.stringify(body),
        method: 'POST'
    });

    let categoriesName = await response.json();
    console.log(categoriesName);
}