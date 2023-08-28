import { Middleware } from "lambda-api";
import { BadRequestError } from "./error.middleware";

type SupportedType = 'string' | 'number' | 'bigint' | 'boolean' | 'date' | 'undefined' | 'null';
type SpecifiedType = {
    type: SupportedType,
    required: boolean,
}

export interface ValidateSchema {
    [key: string]: SupportedType | SpecifiedType;
}

function valueConvertable(from: any, to: SupportedType) {
    let convertable = true;

    switch(to) {
        case 'string': convertable = typeof String(from) === 'string'; break;
        case 'number': convertable = !Number.isNaN(Number(from)); break;
        case 'bigint': convertable = !Number.isNaN(Number(from)); break;
        case 'boolean': convertable = from === false || from === true || from === 0 || from === 1 || from === 'false' || from === 'true'; break;
        case 'date': convertable = !isNaN((new Date(from)).getTime()); break;
        case 'null': convertable = from === 'null'; break;
        case "undefined": convertable = from === undefined || from === 'undefined' ? true : false;
    }

    return convertable;
}

function getKeyProperties(value: SupportedType | SpecifiedType) {
    let result: SpecifiedType = {
        type: 'string',
        required: true,
    }

    if (typeof value === 'string') result.type = value;
    else {
        result.type = value.type;
        result.required = value.required;
    }

    return result;
}

export const ValidateMiddleware = (on: 'body' | 'params' | 'query', schema: ValidateSchema): Middleware => {
    return async (request, response, next) => {
        let logged: {key: string, value: unknown}[] = [];
        let data = request.body;
        let keys = Object.keys(schema);
        let failed = false;

        if (on === 'params') data = request.params;
        if (on === 'query') data = request.query;

        for (let key of keys) {
            let value = data !== undefined ? data[key] : undefined;
            let {type, required} = getKeyProperties(schema[key]);

            if (value === undefined && required) failed = true;
            if (!valueConvertable(value, type) && value !== undefined) failed = true;
            logged.push({key, value});

            if (failed) break;
        }

        console.info(`${on}:`, logged);
        if (failed) throw new BadRequestError(`Given ${on} failed validation requirements`);
        return next();
    }
};