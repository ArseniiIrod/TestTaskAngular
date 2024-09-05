import {
  Component,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  AsyncValidator,
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_ASYNC_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, first, map, Observable, of } from 'rxjs';

import { UserService } from '../../services';
import { IUserForm } from '../../interfaces';
import { ValidationMessageDirective } from '../../directives';
import {
  birthdayValidator,
  countryValidator,
  usernameValidator,
} from '../../validators';

@Component({
  selector: 'app-form',
  standalone: true,
  templateUrl: './form.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormComponent),
      multi: true,
    },
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => FormComponent),
      multi: true,
    },
  ],
  imports: [ReactiveFormsModule, ValidationMessageDirective],
})
export class FormComponent
  implements OnInit, ControlValueAccessor, AsyncValidator
{
  @Input({ required: true }) countries!: string[];

  @Output() deleteClick: EventEmitter<void> = new EventEmitter<void>();

  formGroup!: FormGroup;

  readonly maxDateLimit: string = new Date().toISOString().split('T')[0];

  private onChange!: (value: IUserForm) => void;
  private onTouched!: () => void;
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly userService: UserService = inject(UserService);

  constructor() {
    this.initializeFormGroup();
  }

  ngOnInit(): void {
    this.setControlsValidators();
  }

  onDeleteClick(): void {
    this.deleteClick.emit();
  }

  writeValue(value: IUserForm): void {
    if (value) this.formGroup.patchValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: IUserForm) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.formGroup.disable();
    } else {
      this.formGroup.enable();
    }
  }

  validate(): Observable<ValidationErrors | null> {
    if (this.formGroup.pending) {
      return this.formGroup.statusChanges.pipe(
        filter((status) => status !== 'PENDING'),
        first(),
        map(() => (this.formGroup.invalid ? { invalidForm: true } : null)),
      );
    }

    return of(this.formGroup.invalid ? { invalidForm: true } : null);
  }

  private initializeFormGroup(): void {
    this.formGroup = this.fb.group({
      country: this.fb.control(null),
      username: this.fb.control(null),
      birthday: this.fb.control(null),
    });

    this.formGroup.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => {
        if (this.onChange) this.onChange(value);
      });
  }

  private setControlsValidators(): void {
    this.formGroup.controls['country'].setValidators(
      countryValidator.call(this, this.countries),
    );
    this.formGroup.controls['username'].setAsyncValidators(
      usernameValidator.call(this, this.userService),
    );
    this.formGroup.controls['birthday'].setValidators(
      birthdayValidator.bind(this),
    );

    this.formGroup.controls['country'].updateValueAndValidity();
    this.formGroup.controls['username'].updateValueAndValidity();
    this.formGroup.controls['birthday'].updateValueAndValidity();
  }
}
