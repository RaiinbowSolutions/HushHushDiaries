import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomValidators } from 'src/app/custom.validators';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.page.html',
  styleUrls: ['./user-create.page.css']
})
export class UserCreatePage {
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
  ) {
    this.form = this.formBuilder.group({
      email: ['', Validators.required, Validators.email],
      password: ['', Validators.required],
      retype_password: ['', Validators.required],
    },{
      validators: [CustomValidators.MatchValidator('password', 'retype_password')]
    });
  }

  ngOnInit() {
    this.userService.userCreated.subscribe((state) => {
      this.router.navigateByUrl('/login');
    });
  }

  create() {
    const data = this.form.value;
    if (data.email && data.password) {
      this.userService.create(data.email, data.password);
    }
  }
}
