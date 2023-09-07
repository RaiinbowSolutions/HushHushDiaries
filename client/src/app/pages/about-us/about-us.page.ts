import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.page.html',
  styleUrls: ['./about-us.page.css']
})
export class AboutUsPage {
  
  constructor(
    private authService: AuthenticationService,
  ) {}

  isFullview(): boolean {
    return !this.authService.isAuthenticated();
  }
  
}
