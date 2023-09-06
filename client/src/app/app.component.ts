import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { AuthenticationService } from './services/authentication.service';
import { DialogService } from './services/dialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'hush-hush-diaries';
  tokenExpireSoon: Subscription | null = null;
  refreshFailed: Subscription | null = null;
  
  constructor(
    private location: Location,
    private authService: AuthenticationService,
    private dialogService: DialogService,
  ) {}

  ngOnInit() {
    this.tokenExpireSoon = this.authService.tokenExpireSoon.subscribe(() => {
      this.dialogService.open(`Loggin out of system soon!`, 'warning', [{ text: 'Refresh', fn: () => this.refreshToken()}], 10);
    });

    this.refreshFailed = this.authService.refreshFailed.subscribe(() => {
      this.dialogService.open(`Refresh failed!`, 'error');
    });
  }

  ngOnDestroy() {
    this.tokenExpireSoon?.unsubscribe();
  }

  refreshToken() {
    this.authService.refresh();
  }

  isFullview(): boolean {
    let path = this.location.path();
    
    if (path === '/login') return true;
    if (path === '/users/create') return true;

    return false;
  }
}
