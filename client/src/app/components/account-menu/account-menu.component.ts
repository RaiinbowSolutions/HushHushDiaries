import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-account-menu',
  templateUrl: './account-menu.component.html',
  styleUrls: ['./account-menu.component.css']
})
export class AccountMenuComponent {

  constructor(
    private dialogService: DialogService,
    private router: Router,
  ) {}

  logout() {
    this.dialogService.open('Are you sure you want to logout?', 'warning', [{ text: 'Yes', fn: () => this.yes() }, { text: 'No', fn: undefined }], null);
  }

  yes() {
    this.router.navigateByUrl('/logout');
  }

}
