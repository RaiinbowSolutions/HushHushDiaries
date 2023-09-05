import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

type Auth = {
  token: string;
  type: string;
}

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
    private http: HttpClient,
  ) {
    this.form = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login() {
    const data = this.form.value;
    if (data.email && data.password) {
      this.getToken(data.email, data.password).subscribe((auth) => {
        this.authService.authenticate(auth.token, auth.type);
        this.router.navigateByUrl('/');
      });
    }
  }

  getToken(email: string, password: string) {
    return this.http.post<Auth>('/.netlify/functions/api/token', {email, password})
  }
}
