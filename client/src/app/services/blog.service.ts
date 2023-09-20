import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Pagination } from "../models/pagination.model";
import { Blog, BlogCreateData, BlogCreated, BlogUpdateData } from "../models/blog.model";
import { AuthenticationService } from "./authentication.service";

@Injectable({
    providedIn: 'root'
})

export class BlogService {
    private path = '/.netlify/functions/api/blogs';
    private options = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': this.authService.getAuthenticationHeader(),
        }
    };

    blogCreateFailed: EventEmitter<boolean> = new EventEmitter<boolean>();
    blogUpdateFailed: EventEmitter<boolean> = new EventEmitter<boolean>();
    blogDeleteFailed: EventEmitter<boolean> = new EventEmitter<boolean>();
    blogDeactivateFailed: EventEmitter<boolean> = new EventEmitter<boolean>();
    blogApproveFailed: EventEmitter<boolean> = new EventEmitter<boolean>();
    blogReviewFailed: EventEmitter<boolean> = new EventEmitter<boolean>();
    blogPublishFailed: EventEmitter<boolean> = new EventEmitter<boolean>();
    blogUnpublishFailed: EventEmitter<boolean> = new EventEmitter<boolean>();
    blogOwnedFailed: EventEmitter<boolean> = new EventEmitter<boolean>();

    blogCreated: EventEmitter<boolean> = new EventEmitter<boolean>();
    blogUpdated: EventEmitter<boolean> = new EventEmitter<boolean>();
    blogDeleted: EventEmitter<boolean> = new EventEmitter<boolean>();
    blogDeactivated: EventEmitter<boolean> = new EventEmitter<boolean>();
    blogApproved: EventEmitter<boolean> = new EventEmitter<boolean>();
    blogReviewed: EventEmitter<boolean> = new EventEmitter<boolean>();
    blogPublished: EventEmitter<boolean> = new EventEmitter<boolean>();
    blogUnpublished: EventEmitter<boolean> = new EventEmitter<boolean>();
    blogOwned: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(
        private http: HttpClient,
        private authService: AuthenticationService,
    ) { }

    getBlogs(page: number = 1) {
        let result = this.http.get<Pagination<Blog>>(this.path + `?page=${page}`, this.options);

        return result;
    }

    getBlog(id: string) {
        let result = this.http.get<Blog>(this.path + `/${id}`, this.options);

        return result;
    }

    getOwned(page: number = 1) {
        let id = this.authService.getUserId() as string;
        let result = this.http.get<Pagination<Blog>>(this.path + `/${id}/owned?page=${page}`, this.options);

        return result;
    }

    create(createData: BlogCreateData) {
        let result = this.http.post<BlogCreated>(this.path, createData, this.options);
        result.subscribe({
            next: () => this.blogCreated.emit(true),
            error: () => this.blogCreateFailed.emit(true),
        });

        return result;
    }

    update(id: string, updateData: BlogUpdateData) {
        let result = this.http.patch<void>(this.path + `/${id}`, updateData, this.options);
        result.subscribe({
            next: () => this.blogUpdated.emit(true),
            error: () => this.blogUpdateFailed.emit(true),
        });

        return result;
    }   

    delete(id: string) {
        let result = this.http.delete<void>(this.path + `/${id}`, this.options);
        result.subscribe({
            next: () => this.blogDeleted.emit(true),
            error: () => this.blogDeleteFailed.emit(true),
        });

        return result;
    }

    deactivate(id: string) {
        let result = this.http.post<void>(this.path + `/${id}/deactivate`, {}, this.options);
        result.subscribe({
            next: () => this.blogDeactivated.emit(true), 
            error: () => this.blogDeactivateFailed.emit(true),
        });

        return result;
    }

    approve(id: string) {
        let result = this.http.post<void>(this.path + `/${id}/approve`, {}, this.options);
        result.subscribe({
            next: () => this.blogApproved.emit(true), 
            error: () => this.blogApproveFailed.emit(true),
        });

        return result;
    }

    review(id: string) {
        let result = this.http.post<void>(this.path + `/${id}/review`, {}, this.options);
        result.subscribe({
            next: () => this.blogReviewed.emit(true),
            error: () => this.blogReviewFailed.emit(true),
        });

        return result;
    }

    publish(id: string) {
        let result = this.http.post<void>(this.path + `/${id}/publish`, {}, this.options);
        result.subscribe({
            next: () => this.blogPublished.emit(true),
            error: () => this.blogPublishFailed.emit(true),
        });

        return result;
    }

    unpublish(id: string) {
        let result = this.http.post<void>(this.path + `/${id}/publish`, {}, this.options);
        result.subscribe({
            next: () => this.blogUnpublished.emit(true), 
            error: () => this.blogUnpublishFailed.emit(true),
        });

        return result;
    }   
}