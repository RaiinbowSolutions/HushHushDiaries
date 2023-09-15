import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-account-menu',
  templateUrl: './account-menu.component.html',
  styleUrls: ['./account-menu.component.css']
})
export class AccountMenuComponent {
  userId: string | null = null;

  constructor(
    private authService: AuthenticationService,
    private dialogService: DialogService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.userId = this.authService.getUserId();
  }

  logout() {
    this.dialogService.open('Are you sure you want to logout?', 'warning', [{ text: 'Yes', fn: () => this.yes() }, { text: 'No', fn: undefined }], null);
  }

  yes() {
    this.router.navigateByUrl('/logout');
  }

}
