import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CustomValidators } from 'src/app/custom.validators';
import { GenderOptions } from 'src/app/models/user.model';
import { DialogService } from 'src/app/services/dialog.service';
import { UserService } from 'src/app/services/user.service';

type ShowState = 'login' | 'detail' | 'option' | 'deactivate';

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
  form_detail: FormGroup;
  form_option: FormGroup;
  form_deactivate: FormGroup;

  email = new FormControl('', [Validators.required, Validators.email], [CustomValidators.emailNotTaken(this.http)]);
  username = new FormControl('');
  anonym = new FormControl(true);
  password = new FormControl('', [Validators.required]);
  retype_password = new FormControl('', [Validators.required]);
  firstname = new FormControl('');
  lastname = new FormControl('');
  birthday = new FormControl('');
  gender = new FormControl('');
  pronouns = new FormControl('');
  profile_description = new FormControl('');
  font_size = new FormControl('');
  design_tempature = new FormControl('');
  email_show_state = new FormControl('');
  username_show_state = new FormControl('');
  firstname_show_state = new FormControl('');
  lastname_show_state = new FormControl('');
  birthday_show_state = new FormControl('');
  gender_show_state = new FormControl('');
  pronouns_show_state = new FormControl('');
  profile_description_show_state = new FormControl('');

  userUpdateFailed: Subscription | null = null;
  userOptionUpdateFailed: Subscription | null = null;
  userDetailUpdateFailed: Subscription | null = null;
  userCredentialUpdateFailed: Subscription | null = null;
  userUpdated: Subscription | null = null;
  userOptionUpdated: Subscription | null = null;
  userDetailUpdated: Subscription | null = null;
  userCredentialUpdated: Subscription | null = null;

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

    this.form_detail = this.formBuilder.group({
      firstname: this.firstname,
      lastname: this.lastname,
      birthday: this.birthday,
      gender: this.gender,
      pronouns: this.pronouns,
      profile_description: this.profile_description,
    }, { updateOn: 'blur' });

    this.form_option = this.formBuilder.group({
      font_size: this.font_size,
      design_tempature: this.design_tempature,
      email_show_state: this.email_show_state,
      username_show_state: this.username_show_state,
      firstname_show_state: this.firstname_show_state,
      lastname_show_state: this.lastname_show_state,
      birthday_show_state: this.birthday_show_state,
      gender_show_state: this.gender_show_state,
      pronouns_show_state: this.pronouns_show_state,
      profile_description_show_state: this.profile_description_show_state,
    }, { updateOn: 'blur' });

    this.form_deactivate = this.formBuilder.group({}, { updateOn: 'blur' });
  }

  ngOnInit() {
    this.params = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.user = this.userService.getUser(this.id).subscribe({
        next: (user) => {
          this.email.setValue(user.email);
          this.username.setValue(user.username);
          this.anonym.setValue(user.anonym);
        }
      });
      this.detail = this.userService.getUserDetail(this.id).subscribe({
        next: (detail) => {
          this.firstname.setValue(detail.firstname);
          this.lastname.setValue(detail.lastname);
          this.birthday.setValue(detail.birthday !== 'hidden' && detail.birthday ? new Date(detail.birthday).toISOString().slice(0, -14) : null);
          this.gender.setValue(detail.gender);
          this.pronouns.setValue(detail.pronouns);
          this.profile_description.setValue(detail.profile_description);
        }
      });
      this.option = this.userService.getUserOption(this.id).subscribe({
        next: (option) => {
          this.font_size.setValue(option.font_size);
          this.design_tempature.setValue(option.design_tempature);
          this.email_show_state.setValue(option.email_show_state);
          this.username_show_state.setValue(option.username_show_state);
          this.firstname_show_state.setValue(option.firstname_show_state);
          this.lastname_show_state.setValue(option.lastname_show_state);
          this.birthday_show_state.setValue(option.birthday_show_state);
          this.gender_show_state.setValue(option.gender_show_state);
          this.pronouns_show_state.setValue(option.pronouns_show_state);
          this.profile_description_show_state.setValue(option.profile_description_show_state);
        }
      });
    });

    this.userUpdateFailed = this.userService.userUpdateFailed.subscribe(() => {
      this.dialogService.open(`Update Failed!`, 'error');
    });
    this.userOptionUpdateFailed = this.userService.userOptionUpdateFailed.subscribe(() => {
      this.dialogService.open(`Update Failed!`, 'error');
    });
    this.userDetailUpdateFailed = this.userService.userDetailUpdateFailed.subscribe(() => {
      this.dialogService.open(`Update Failed!`, 'error');
    });
    this.userCredentialUpdateFailed = this.userService.userCredentialUpdateFailed.subscribe(() => {
      this.dialogService.open(`Update Failed!`, 'error');
    });
    this.userUpdated = this.userService.userUpdated.subscribe(() => {
      this.dialogService.open(`Update Confirmed!`, 'information');
      location.reload();
    });
    this.userOptionUpdated = this.userService.userOptionUpdated.subscribe(() => {
      this.dialogService.open(`Update Confirmed!`, 'information');
      location.reload();
    });
    this.userDetailUpdated = this.userService.userDetailUpdated.subscribe(() => {
      this.dialogService.open(`Update Confirmed!`, 'information');
      location.reload();
    });
    this.userCredentialUpdated = this.userService.userCredentialUpdated.subscribe(() => {
      this.dialogService.open(`Update Confirmed!`, 'information');
      location.reload();
    });
  }

  ngDestroy() {
    this.params?.unsubscribe();
    this.user?.unsubscribe();
    this.detail?.unsubscribe();
    this.option?.unsubscribe();

    this.userUpdateFailed?.unsubscribe();
    this.userOptionUpdateFailed?.unsubscribe();
    this.userDetailUpdateFailed?.unsubscribe();
    this.userCredentialUpdateFailed?.unsubscribe();
    this.userUpdated?.unsubscribe();
    this.userOptionUpdated?.unsubscribe();
    this.userDetailUpdated?.unsubscribe();
    this.userCredentialUpdated?.unsubscribe();
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

  openUserDeactivate() {
    this.state = 'deactivate';
  }

  updateEmail() {
    if (this.form_email.invalid) return;
    
    let data = this.form_email.value;
    this.userService.update(this.id, data);
  }

  updateUsername() {
    if (this.form_username.invalid) return;
    
    let data = this.form_username.value;
    this.userService.update(this.id, data);
  }

  updatePassword() {
    if (this.form_password.invalid) return;
    
    let data = this.form_password.value;
    this.userService.credentialUpdate(this.id, data);
  }

  updateDetail() {
    if (this.form_detail.invalid) return;
    
    let data = this.form_detail.value;
    this.userService.detailUpdate(this.id, data);
  }

  updateOption() {
    if (this.form_option.invalid) return;
    
    let data = this.form_option.value;
    this.userService.optionUpdate(this.id, data);
  }

  deactivate() {
    if (this.form_deactivate.invalid) return;

    this.dialogService.open(`Are you sure you want to deactivate this account?`, 'warning', [{ text: 'Yes', fn: () => this.performDeactivate()}, { text: 'No', fn: undefined}], null);
  }

  performDeactivate() {
    this.userService.deactivate(this.id);
  }

}
