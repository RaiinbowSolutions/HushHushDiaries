'use client'
import { FormEvent } from "react";

export async function Login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let data = new FormData(event.currentTarget);
    let body = {
        email: data.get('email')?.valueOf(),
        password: data.get('password')?.valueOf(),
    };
    let response = await fetch('/.netlify/functions/api/token', {
        body: JSON.stringify(body),
        method: 'POST'
    });

    let token = await response.json();
    console.log(token);
}