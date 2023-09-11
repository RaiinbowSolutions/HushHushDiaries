import { Component } from '@angular/core';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.css']
})
export class CategoriesPage {
  constructor(
    private categoryService: CategoryService,
  ) { }

  fetch() {
    this.categoryService.categoriesFetched.emit(true);
  }
}
