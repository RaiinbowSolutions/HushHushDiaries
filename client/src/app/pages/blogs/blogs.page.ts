import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Blog } from 'src/app/models/blog.model';
import { BlogService } from 'src/app/services/blog.service';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.page.html',
  styleUrls: ['./blogs.page.css']
})
export class BlogsPage {
  private params: Subscription | null = null;
  private pagination: Subscription | null = null;
  blogs: Blog[] = [];
  page: number = 1;
  previus: number | null = null;
  next: number | null = null;
  
  constructor(
    private blogService: BlogService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.params = this.route.queryParams.subscribe(params => {
      this.page = params['page'] ?? 1;
      this.pagination = this.blogService.getBlogs(this.page).subscribe({
        next: (pagination) => {
          this.blogs = pagination.data;
          this.previus = pagination.previus ? pagination.page - 1 : null;
          this.next = pagination.next ? pagination.page + 1 : null;
        },
      });
    });
  }

  ngDestroy() {
    this.params?.unsubscribe();
    this.pagination?.unsubscribe();
  }
}
