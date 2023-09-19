import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Category } from 'src/app/models/category.model';
import { Pagination } from 'src/app/models/pagination.model';
import { BlogService } from 'src/app/services/blog.service';
import { CategoryService } from 'src/app/services/category.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blog-create',
  templateUrl: './blog-create.page.html',
  styleUrls: ['./blog-create.page.css']
})
export class BlogCreatePage {
  form: FormGroup;
  categories: Pagination<Category> = {
    page: 0,
    length: 0,
    data: [],
    next: '',
    previus: ''};
  
  categoriesSubscription: Subscription | null = null;
  createBlogSubscription: Subscription | null = null;
  createBlogFailedSubscription: Subscription | null = null;

  title = new FormControl('', [Validators.required]);
  keywords = new FormControl('');
  description = new FormControl('');
  content = new FormControl('', [Validators.required]);
  category_id = new FormControl('', [Validators.required]);
  author_id: string | null;

  constructor(
    private formBuilder: FormBuilder,
    private blogService: BlogService,
    private route: Router,
    private categoryService: CategoryService,
    private auth: AuthenticationService,
  ) { 
    this.form = this.formBuilder.group({
      title: this.title,
      keywords: this.keywords,
      description: this.description,
      content: this.content,
      category_id: this.category_id,
    })
    this.author_id = this.auth.getUserId();
  }

  create() {
    const data = this.form.value; 
    if (this.form.valid && this.author_id) {
      this.blogService.create({...data, author_id: this.author_id});
      this.createBlogSubscription = this.blogService.blogCreated.subscribe({
        next:() => {
          this.route.navigateByUrl('/blogs');
        }
      })
    }
  }

  ngOnInit() {
    this.categoriesSubscription = this.categoryService.getCategories().subscribe({
      next:(categories) => {
        this.categories = categories
      },
    });
  }

  ngDestory() {
    this.categoriesSubscription?.unsubscribe();
    this.createBlogSubscription?.unsubscribe();
    this.createBlogFailedSubscription?.unsubscribe();
  }
}
