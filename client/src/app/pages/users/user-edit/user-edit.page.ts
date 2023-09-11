import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { CustomValidators } from 'src/app/custom.validators';
import { GenderOptions } from 'src/app/models/user.model';
import { DialogService } from 'src/app/services/dialog.service';
import { UserService } from 'src/app/services/user.service';

type ShowState = 'login' | 'detail' | 'option';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.page.html',
  styleUrls: ['./user-edit.page.css']
})
export class UserEditPage {
  id: string = '';
  genders = GenderOptions;
  state: ShowState = 'login';
  
  form_email: FormGroup;
  form_username: FormGroup;
  form_password: FormGroup;
  email = new FormControl('', [Validators.required, Validators.email], [CustomValidators.emailNotTaken(this.http)]);
  username = new FormControl('');
  anonym = new FormControl('');
  password = new FormControl('', [Validators.required]);
  retype_password = new FormControl('', [Validators.required]);

  private params: Subscription | null = null;
  private user: Subscription | null = null; 
  private option: Subscription | null = null; 
  private detail: Subscription | null = null; 

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService,
    private dialogService: DialogService,
    private http: HttpClient,
  ) {
    this.form_email = this.formBuilder.group({
      email: this.email,
    }, { updateOn: 'blur' });

    this.form_username = this.formBuilder.group({
      username: this.username,
      anonym: this.anonym,
    }, { updateOn: 'blur' });

    this.form_password = this.formBuilder.group({
      password: this.password,
      retype_password: this.retype_password,
    }, { updateOn: 'blur' });

    this.form_password.addValidators([CustomValidators.match('password', 'retype_password')]);
  }

  ngOnInit() {
    this.params = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.user = this.userService.getUser(this.id).subscribe();
      this.detail = this.userService.getUserDetail(this.id).subscribe();
      this.option = this.userService.getUserOption(this.id).subscribe();
    });
  }

  ngDestroy() {
    this.params?.unsubscribe();
    this.user?.unsubscribe();
    this.detail?.unsubscribe();
    this.option?.unsubscribe();
  }

  openUserEdit() {
    this.state = 'login';
  }

  openUserDetailEdit() {
    this.state = 'detail';
  }

  openUserOptionEdit() {
    this.state = 'option';
  }

}
