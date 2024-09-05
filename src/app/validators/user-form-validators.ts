import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { catchError, debounceTime, map, Observable, of, take } from 'rxjs';

import { UserService } from '../services';
import { CheckUserResponseData } from '../interfaces';

export const countryValidator = (countries: string[]): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const controlValue: string = control.value;

    if (!controlValue) return null;

    return countries?.includes(controlValue) ? null : { invalidCountry: true };
  };
};

export const usernameValidator = (
  userService: UserService,
): AsyncValidatorFn => {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const controlValue: string = control.value;

    if (!controlValue) {
      return of(null);
    }

    return userService.checkUniqueUserName$(controlValue).pipe(
      debounceTime(500),
      take(1),
      map((response: CheckUserResponseData) =>
        response.isAvailable ? null : { invalidUsername: true },
      ),
      catchError(() => of(null)),
    );
  };
};

export const birthdayValidator = (
  control: AbstractControl,
): ValidationErrors | null => {
  const controlValue: string = control.value;

  if (!controlValue) return null;

  const selectedDate: Date = new Date(controlValue);
  const today: Date = new Date();

  return selectedDate > today ? { invalidBirthday: true } : null;
};
