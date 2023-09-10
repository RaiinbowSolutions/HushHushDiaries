import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Pagination } from "../models/pagination.model";
import { Category } from "../models/category.model";

@Injectable({
    providedIn: 'root'
})

export class CategoryService {

    private path = '/.netlify/functions/api/categories';
    private options = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        }
    }
    
    categoriesFetchFailed = new EventEmitter(true);

    categoriesFetched = new EventEmitter(true);

    constructor(
        private http: HttpClient,
    ) { }

    getCategories() {
        let result = this.http.get<Pagination<Category>>(this.path, this.options);

        return result;
    }
}