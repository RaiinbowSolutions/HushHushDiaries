import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.page.html',
  styleUrls: ['./logout.page.css']
})
export class LogoutPage {
  constructor(
    private authService: AuthenticationService, 
    private router: Router,
  ) {}

  ngOnInit() {
    this.authService.deauthenticated.subscribe((state) => {
      this.router.navigateByUrl('/login');
    });
    
    this.authService.logout();
  }
}
