import 'dotenv/config';
import { APIGatewayEvent, Context } from 'aws-lambda';
import lambda, { Request, Response } from 'lambda-api';
import { UserRoute } from './routes/user.route';
import { AuthenticationMiddleware } from './middleware/authentication.middleware';
import { ErrorMiddleware } from './middleware/error.middleware';
import { RequestRoute } from './routes/request.route';
import { BlogRoute } from './routes/blog.route';
import { CategoryRoute } from './routes/category.route';
import { CommentRoute } from './routes/comment.route';
import { MessageRoute } from './routes/message.route';
import { PermissionRoute } from './routes/permission.route';
import { TokenRoute } from './routes/token.route';

const api = lambda({
    base: '.netlify/functions/api',
    logger: false,
    errorHeaderWhitelist: [
		'Access-Control-Allow-Origin',
		'Access-Control-Allow-Methods',
		'Access-Control-Allow-Headers',
	],
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
});

api.use(AuthenticationMiddleware());
api.use(ErrorMiddleware());

api.register(BlogRoute);
api.register(CategoryRoute);
api.register(CommentRoute);
api.register(MessageRoute);
api.register(PermissionRoute);
api.register(RequestRoute);
api.register(TokenRoute);
api.register(UserRoute);

api.finally(async () => {});

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return await api.run(event, context);
};