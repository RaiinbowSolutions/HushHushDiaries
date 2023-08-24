import { API, RegisterOptions, Request, Response } from "lambda-api";
import { AuthenticatedMiddleware as Authenticated } from '../middleware/authenticated.middleware';
import { BlogService } from "../services/blog.service";
import { Authentication } from "../middleware/authentication.middleware";
import { Validation } from "../utilities/validation";
import { CreateDataResponse, CreatePaginationDataResponse } from "../utilities/responses";

export const BlogRoute = (api: API, options: RegisterOptions | undefined) => {
    const Prefix = options?.prefix;
    const BaseURI = '/blogs';

    api.get(Prefix + BaseURI + '/counts', 
        Authenticated(), 
        async (request: Request, response: Response) => {
            let counts = await BlogService.counts();
            return response.status(200).json({type: 'blog', counts});
        }
    );

    api.get(Prefix + BaseURI, 
        Authenticated(), 
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;
            let {limit, offset} = Validation.pagination(request);
            let total = await BlogService.counts();
            let blogs = await BlogService.selects(offset, limit);
            let filteredBlogs = await BlogService.filters.blogs(authentication.id, blogs);
            return CreatePaginationDataResponse(request, response, filteredBlogs, total);
        }
    );

    api.get(Prefix + BaseURI + '/[id]',
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;
            let id = Validation.id(request);
            let blog = await BlogService.select(id);
            let filteredBlog = await BlogService.filters.blog(authentication.id, blog);
            return CreateDataResponse(request, response, filteredBlog);
        }
    );
}