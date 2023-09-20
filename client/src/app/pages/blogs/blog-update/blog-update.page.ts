import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { Pagination } from 'src/app/models/pagination.model';
import { Category } from 'src/app/models/category.model';
import { Subscription } from 'rxjs';
import { BlogService } from 'src/app/services/blog.service';
import { CategoryService } from 'src/app/services/category.service';
import { UserService } from 'src/app/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { DialogService } from 'src/app/services/dialog.service';

type ShowState = 'edit' | 'deactivate';

@Component({
  selector: 'app-blog-update',
  templateUrl: './blog-update.page.html',
  styleUrls: ['./blog-update.page.css']
})
export class BlogUpdatePage {
  id: string = '';
  state: ShowState = 'edit';

  form: FormGroup;
  form_deactivate: FormGroup;
  categories: Pagination<Category> = {
    page: 0,
    length: 0,
    data: [],
    next: '',
    previus: ''};
  users: Pagination<User> = {
    page: 0,
    length: 0,
    data: [],
    next: '',
    previus: ''};
  
  categoriesSubscription: Subscription | null = null;
  updateBlogSubscription: Subscription | null = null;
  usersSubscription: Subscription | null = null;
  deactivateBlogSubscription: Subscription | null = null;

  private getParamsSubscription: Subscription | null = null;
  private getBlogSubscription: Subscription | null = null;

  title = new FormControl('', [Validators.required]);
  keywords = new FormControl('');
  description = new FormControl('');
  content = new FormControl('', [Validators.required]);
  category_id = new FormControl('', [Validators.required]);
  author_id = new FormControl('', [Validators.required]);

  constructor(
    private formBuilder: FormBuilder,
    private blogService: BlogService,
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private user: UserService, 
    private dialogService: DialogService,

  ) {
    this.form = this.formBuilder.group({
      title: this.title,
      keywords: this.keywords,
      description: this.description,
      content: this.content,
      category_id: this.category_id,
      author_id: this.author_id,
    });
    this.form_deactivate = this.formBuilder.group({

    });
  }

  ngOnInit() {
    this.getParamsSubscription = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.getBlogSubscription = this.blogService.getBlog(this.id).subscribe({
        next: (blog) => {
          this.title.setValue(blog.title);
          this.keywords.setValue(blog.keywords);
          this.description.setValue(blog.description);
          this.content.setValue(blog.content);
          this.category_id.setValue(blog.category_id);
          this.author_id.setValue(blog.author_id);
        }
      });
    })
    this.categoriesSubscription = this.categoryService.getCategories().subscribe({
      next:(categories) => {
        this.categories = categories
      },
    });
    this.usersSubscription = this.user.getUsers().subscribe({
      next:(user) => {
        this.users = user
      }
    })
  }

  openBlogEdit() {
    this.state = 'edit';
  }

  openDeactivateBlog() {
    this.state = 'deactivate';
  }

  update() {
    let data = this.form.value;
    if(this.form.valid && this.id) {
      this.blogService.update(this.id, data);
      this.updateBlogSubscription = this.blogService.blogUpdated.subscribe({
        next:() => {
          this.router.navigateByUrl('/blogs/owned');
        }
      })
    }
  }

  deactivate() {
    if (this.form_deactivate.invalid) return;

    this.dialogService.open(`Are you sure you want to deactivate this blog?`, 'warning', [{ text: 'Yes', fn: () => this.performDeactivate()}, { text: 'No', fn: undefined}], null);
  }

  performDeactivate() {
    this.blogService.deactivate(this.id);
    this.deactivateBlogSubscription = this.blogService.blogDeactivated.subscribe({
      next:() => {
        this.router.navigateByUrl('/blogs/owned');
      }
    })
  }

  ngDestroy() {
    this.getParamsSubscription?.unsubscribe();
    this.updateBlogSubscription?.unsubscribe();
    this.deactivateBlogSubscription?.unsubscribe();
    this.categoriesSubscription?.unsubscribe();
    this.usersSubscription?.unsubscribe();
    this.getBlogSubscription?.unsubscribe();
  }
}
