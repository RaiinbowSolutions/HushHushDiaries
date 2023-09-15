import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-information',
  templateUrl: './information.page.html',
  styleUrls: ['./information.page.css']
})
export class InformationPage {
  
  constructor(
    private authService: AuthenticationService,
  ) {}

  isFullview(): boolean {
    return !this.authService.isAuthenticated();
  }
  
}
