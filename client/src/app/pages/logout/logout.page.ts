import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.page.html',
  styleUrls: ['./logout.page.css']
})
export class LogoutPage {

  constructor(
    private authService: AuthenticationService,
  ) {}

  ngOnInit() {
    this.authService.logout();
  }
}
