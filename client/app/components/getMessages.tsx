'use client'
import { MessageObject } from "./models/message";

export async function GetMessages(): Promise<MessageObject[]> {
    let response = await fetch('/.netlify/functions/api/messages', {
        method: 'GET',
    });
    let result: MessageObject[] = await response.json();

    return result;
}