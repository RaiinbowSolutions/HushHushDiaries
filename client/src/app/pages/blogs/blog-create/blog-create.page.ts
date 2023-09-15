import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { BlogService } from 'src/app/services/blog.service';

@Component({
  selector: 'app-blog-create',
  templateUrl: './blog-create.page.html',
  styleUrls: ['./blog-create.page.css']
})
export class BlogCreatePage {
  form: FormGroup;

  title = new FormControl('');
  keywords = new FormControl('');
  description = new FormControl('');
  content = new FormControl('');
  categoryid = new FormControl('');
  authorid = new FormControl('');

  constructor(
    private formBuilder: FormBuilder,
    private blogService: BlogService,
    private http: HttpClient,
  ) { 
    this.form = this.formBuilder.group({
      title: this.title,
      keywords: this.keywords,
      description: this.description,
      content: this.content,
      categoryid: this.categoryid,
      authorid: this.authorid,
    })
  }

  create() {
    const data = this.form.value; 
    if (data.title && data.keywords && data.description && data.content && data.categoryid && data.authorid) {
      this.blogService.create(data);
    }
  }
}
