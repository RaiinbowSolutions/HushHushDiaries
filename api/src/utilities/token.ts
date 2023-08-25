import 'dotenv/config';
import JWT, { JwtPayload } from 'jsonwebtoken';

const JsonWebTokenSecret = process.env.JSON_WEB_TOKEN_SECRET || '823aa5983cb0e574bdf87d2f4477a431e2542c16ec99594d0463d5aa37022b0a';
const JsonWebTokenIssuer = process.env.JSON_WEB_TOKEN_ISSUER || 'DEVELOPMENT';

export type TokenData = {
    id: bigint,
}

function decode(token: string): TokenData {
    let payload = JWT.verify(token, JsonWebTokenSecret, {
        ignoreExpiration: false,
        ignoreNotBefore: false,
        issuer: JsonWebTokenIssuer
    }) as JwtPayload;

    return {
        id: payload.id,
    }
}

function encode(payload: TokenData) {
    return JWT.sign(payload, JsonWebTokenSecret, {
        expiresIn: '10m',
        notBefore: 0,
        issuer: JsonWebTokenIssuer,
    })
}

export const Token = {
    encode,
    decode,
}