import { API, RegisterOptions, Request, Response } from "lambda-api";
import { AuthenticatedMiddleware as Authenticated } from "../middleware/authenticated.middleware";
import { CategoryService } from "../services/category.service";
import { Validation } from "../utilities/validation";
import { CreateDataResponse, CreatePaginationDataResponse } from "../utilities/responses";
import { Authentication } from '../middleware/authentication.middleware';

export const CategoryRoute = (api: API, options: RegisterOptions | undefined) => {
    const Prefix = options?.prefix;
    const BaseURI = '/categories';

    api.get(Prefix + BaseURI + '/counts',
        Authenticated(), 
        async (request: Request, response: Response) => {
            let counts = await CategoryService.counts();
            return response.status(200).json({type: 'category', counts});
        }
    );

    api.get(Prefix + BaseURI,
        Authenticated(),
        async (request: Request, response: Response) => {
            let authentication: Authentication = request.authentication;
            let {limit, offset} = Validation.pagination(request);
            let total = await CategoryService.counts();
            let categories = await CategoryService.selects(offset, limit);
            let filteredCategories = await CategoryService.filters.categories(authentication.id, categories);
            return CreatePaginationDataResponse(request, response, filteredCategories, total);
        }
    );

    api.get(Prefix + BaseURI + '/[id]', 
        Authenticated(), 
        async (request: Request, response: Response) => {
            let authentication = request.authentication; 
            let id = Validation.id(request);
            let category = await CategoryService.select(id);
            let filteredCategory = await CategoryService.filters.category(authentication.id, category);
            return CreateDataResponse(request, response, filteredCategory);
        }
    );

    
}