import { Component } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { DialogService } from './services/dialog.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'hush-hush-diaries';

  tokenExpireSoon: Subscription | null = null;
  tokenExpired: Subscription | null = null;
  hasLogin: Subscription | null = null;
  hasLogout: Subscription | null = null;

  refreshFailed: Subscription | null = null;
  loginFailed: Subscription | null = null;
  
  constructor(
    private authService: AuthenticationService,
    private dialogService: DialogService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.tokenExpireSoon = this.authService.tokenExpireSoon.subscribe(() => {
      this.dialogService.open(`Session expire soon!`, 'warning', [{ text: 'Refresh', fn: () => this.authService.refresh()}, { text: 'cancel', fn: undefined }], 10);
    });

    this.tokenExpired = this.authService.tokenExpired.subscribe(() => {
      this.dialogService.open(`Session expired!`, 'warning', [{ text: 'Ok', fn: undefined}], null);
      this.router.navigateByUrl('/login');
    });

    this.hasLogin = this.authService.hasLogin.subscribe(() => {
      let username = this.authService.getUsername() || 'Anonym#********';
      this.dialogService.open(`Successful logget in as ${username}`, 'information');
      this.router.navigateByUrl('/');
    });

    this.hasLogout = this.authService.hasLogout.subscribe(() => {
      this.dialogService.open('You are now logout', 'information');
      this.router.navigateByUrl('/login');
    });

    this.loginFailed = this.authService.loginFailed.subscribe(() => {
      this.dialogService.open('Unsuccessful login', 'error');
    });

    this.refreshFailed = this.authService.refreshFailed.subscribe(() => {
      this.dialogService.open(`Refresh failed!`, 'error');
    });
  }

  ngOnDestroy() {
    this.tokenExpireSoon?.unsubscribe();
    this.tokenExpired?.unsubscribe();
    this.hasLogin?.unsubscribe();
    this.hasLogout?.unsubscribe();

    this.refreshFailed?.unsubscribe();
    this.loginFailed?.unsubscribe();
  }

  isFullview(): boolean {
    return !this.authService.isAuthenticated();
  }
}
