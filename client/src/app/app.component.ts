import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'hush-hush-diaries';
  
  constructor(
    private location: Location,
  ) {}

  isFullview(): boolean {
    let path = this.location.path();
    
    if (path === '/login') return true;
    if (path === '/users/create') return true;

    return false;
  }
}
