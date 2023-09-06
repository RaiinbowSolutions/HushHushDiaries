import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, last } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DialogService } from 'src/app/services/dialog.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css']
})
export class LoginPage {
  form: FormGroup;
  hasLogin: Subscription | null = null;
  loginFailed: Subscription | null = null;

  constructor(
    private formBuilder: FormBuilder, 
    private authService: AuthenticationService,
    private dialogService: DialogService,
    private router: Router,
  ) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.hasLogin = this.authService.hasLogin.subscribe(() => {
      let username = this.authService.getUsername() || 'Anonym#********';
      this.dialogService.open(`Successful logget in as ${username}`, 'information');
      this.router.navigateByUrl('/');
    });

    this.loginFailed = this.authService.loginFailed.subscribe(() => {
      this.dialogService.open('Unsuccessful login', 'error');
    });
  }

  ngOnDestroy() {
    this.hasLogin?.unsubscribe();
    this.loginFailed?.unsubscribe();
  }

  login() {
    if (this.form.invalid) return;

    const data = this.form.value;
    this.authService.login(data.email, data.password);
  }
}
