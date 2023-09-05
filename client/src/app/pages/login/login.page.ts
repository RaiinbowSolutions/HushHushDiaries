import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css']
})
export class LoginPage {
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder, 
    private authService: AuthenticationService, 
    private router: Router,
  ) {
    this.form = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.authService.authenticated.subscribe((state) => {
      this.router.navigateByUrl('/');
    })
  }

  login() {
    const data = this.form.value;
    if (data.email && data.password) {
      this.authService.login(data.email, data.password);
    }
  }
}
