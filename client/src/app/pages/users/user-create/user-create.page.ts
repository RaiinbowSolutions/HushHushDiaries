import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomValidators } from 'src/app/custom.validators';
import { DialogService } from 'src/app/services/dialog.service';
import { UserService } from 'src/app/services/user.service';

type ShowState = 'inputs' | 'tos' | 'puzzle';
type PuzzleState = 'first' | 'second' | 'third';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.page.html',
  styleUrls: ['./user-create.page.css']
})
export class UserCreatePage {
  form: FormGroup;
  email = new FormControl('', [Validators.required, Validators.email], [CustomValidators.emailNotTaken(this.http)]);
  password = new FormControl('', [Validators.required]);
  retype_password = new FormControl('', [Validators.required]);

  puzzle_form: FormGroup;
  puzzle_radio = new FormControl('', [Validators.required]);

  state: ShowState = 'inputs';
  tosRead: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private dialogService: DialogService,
    private http: HttpClient,
  ) {
    this.form = this.formBuilder.group({
      email: this.email,
      password: this.password,
      retype_password: this.retype_password,
    }, { updateOn: 'blur' });

    this.form.addValidators([CustomValidators.match('password', 'retype_password')]);

    this.puzzle_form = this.formBuilder.group({
      puzzle_radio: this.puzzle_radio,
    }, { updateOn: 'blur' });
  }

  ngOnInit() {
    this.userService.userCreated.subscribe((state) => {
      this.router.navigateByUrl('/login');
    });
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any) {
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 1) {
      this.tosRead = true;
    }
  }

  inputs() {
    this.state = 'inputs';
  }

  tos() {
    if (!this.form.valid) return;
    this.state = 'tos';
  }

  puzzle() {
    if (!this.form.valid) return;
    if (!this.tosRead) return;
    this.state = 'puzzle';
  }

  create() {
    const data = this.form.value;
    if (data.email && data.password) {
      this.userService.create(data);
    }
  }
}
