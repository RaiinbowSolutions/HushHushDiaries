import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-licence',
  templateUrl: './licence.page.html',
  styleUrls: ['./licence.page.css']
})
export class LicencePage {
  
  constructor(
    private authService: AuthenticationService,
  ) {}

  isFullview(): boolean {
    return !this.authService.isAuthenticated();
  }
  
}
