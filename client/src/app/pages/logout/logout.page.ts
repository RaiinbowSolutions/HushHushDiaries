import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.page.html',
  styleUrls: ['./logout.page.css']
})
export class LogoutPage {
  hasLogout: Subscription | null = null;

  constructor(
    private authService: AuthenticationService, 
    private dialogService: DialogService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.hasLogout = this.authService.hasLogout.subscribe(() => {
      this.dialogService.open('You are now logout', 'information');
      this.router.navigateByUrl('/login');
    });

    this.authService.logout();
  }

  ngOnDestroy() {
    this.hasLogout?.unsubscribe();
  }
}
