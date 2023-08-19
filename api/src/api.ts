import 'dotenv/config';
import { APIGatewayEvent, Context } from 'aws-lambda';
import lambda, { Request, Response } from 'lambda-api';

const api = lambda({
    base: '.netlify/functions/api'
});

api.options('/*', (request: Request, response: Response) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'GET, PATCH, POST, DELETE, OPTIONS');
    response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    return response.status(200).send({});
});

api.get('/', (request: Request, response: Response) => {
    let message = `Welcome to Hush Hush Diaries API.`;
    return response.status(200).json({
        message
    });
})

api.finally(async () => {});

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return await api.run(event, context);
};