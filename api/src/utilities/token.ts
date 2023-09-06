import 'dotenv/config';
import JWT, { JwtPayload } from 'jsonwebtoken';
import { Minify } from './minify';

const JsonWebTokenSecret = process.env.JSON_WEB_TOKEN_SECRET || '823aa5983cb0e574bdf87d2f4477a431e2542c16ec99594d0463d5aa37022b0a';
const JsonWebTokenIssuer = process.env.JSON_WEB_TOKEN_ISSUER || 'DEVELOPMENT';

export type TokenData = {
    id: bigint,
    email: string,
    username: string,
}

export type RefreshTokenData = {
    id: bigint,
}

function decode(token: string): TokenData {
    let payload = JWT.verify(token, JsonWebTokenSecret, {
        ignoreExpiration: false,
        ignoreNotBefore: false,
        issuer: JsonWebTokenIssuer
    }) as JwtPayload;

    return {
        id: Minify.decode('users', payload.id),
        email: payload.email,
        username: payload.username,
    }
}

function encode(payload: TokenData) {
    let data = {
        ...payload, 
        id: Minify.encode('users', payload.id),
    }

    return JWT.sign(data, JsonWebTokenSecret, {
        expiresIn: '10m',
        notBefore: 0,
        issuer: JsonWebTokenIssuer,
    })
}

function encodeRefresh(id: bigint) {
    return JWT.sign({ id: Minify.encode('users', id) }, JsonWebTokenSecret, {
        expiresIn: '10m',
        notBefore: '5m',
        issuer: JsonWebTokenIssuer,
    })
}

function decodeRefresh(token: string): RefreshTokenData {
    let payload = JWT.verify(token, JsonWebTokenSecret, {
        ignoreExpiration: false,
        ignoreNotBefore: false,
        issuer: JsonWebTokenIssuer
    }) as JwtPayload;

    return {
        id: Minify.decode('users', payload.id),
    }
}

export const Token = {
    encode,
    decode,
    encodeRefresh,
    decodeRefresh,
}