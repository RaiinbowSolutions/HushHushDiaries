import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Pagination } from "../models/pagination.model";
import { Category } from "../models/category.model";
import { AuthenticationService } from "./authentication.service";

@Injectable({
    providedIn: 'root'
})

export class CategoryService {

    private path = '/.netlify/functions/api/categories';
    private options = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': this.authService.getAuthenticationHeader(),
        }
    }
    
    categoriesFetchFailed = new EventEmitter(true);
    categoryFetchFailed = new EventEmitter(true);

    categoriesFetched = new EventEmitter(true);
    categoryFetch = new EventEmitter(true);

    constructor(
        private http: HttpClient,
        private authService: AuthenticationService,
    ) { }

    getCategories() {
        let result = this.http.get<Pagination<Category>>(this.path, this.options);
        result.subscribe({
            next: () => this.categoriesFetched.emit(true), 
            error: () => this.categoriesFetchFailed.emit(true),
        });

        return result;
    }

    getCategory(id: string) {
        let result = this.http.get<Category>(this.path + `/${id}}`, this.options);
        
        result.subscribe({
            next: () => this.categoryFetch.emit(true),
            error: () => this.categoryFetchFailed.emit(true),
        });

        return result;
    }
}