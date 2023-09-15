import { HttpClient } from '@angular/common/http';
import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, map, switchMap, timer } from 'rxjs';

export class CustomValidators {
  static match(source: string, target: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const sourceCtrl = control.get(source);
      const targetCtrl = control.get(target);

      return sourceCtrl && targetCtrl && sourceCtrl.value !== targetCtrl.value
        ? { notMatching: true }
        : null;
    };
  }
  static emailNotTaken(http: HttpClient): AsyncValidatorFn {
    return (control: AbstractControl) => {
        let email: string = control.value;
        let result = http.post<{ id: string | null }>(`/.netlify/functions/api/users/email`, {email});

        return timer(500).pipe(
        switchMap(() => result.pipe(map((value) => value.id !== null ? { emailTaken: true } : null)))
      );
    };
  }
}