import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.css']
})
export class NewsPage {
  
  constructor(
    private authService: AuthenticationService,
  ) {}

  isFullview(): boolean {
    return !this.authService.isAuthenticated();
  }
  
}
