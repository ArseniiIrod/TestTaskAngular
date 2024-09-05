import { Component, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { first, interval, Subscription, take, tap } from 'rxjs';

import { Country } from './enums';
import { UserService } from './services';
import { FormComponent } from './components';
import { TimeFormatterPipe } from './pipes';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    CommonModule,
    FormComponent,
    ReactiveFormsModule,
    TimeFormatterPipe,
  ],
})
export class AppComponent {
  timer: number = 0;
  formGroup!: FormGroup;
  formSubmitted: boolean = false;
  timerSubscription: Subscription = new Subscription();

  readonly maxForms = 10;
  readonly countries: string[] = Object.keys(Country);

  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly userService: UserService = inject(UserService);

  get formCards(): FormArray {
    return this.formGroup.get('formCards') as FormArray;
  }

  get invalidFormsCount(): number {
    return this.formCards.controls.filter((c) => c.invalid).length;
  }

  constructor() {
    this.initializeFormGroup();
  }

  onAddNewForm(): void {
    const control = this.fb.control({
      country: null,
      username: null,
      birthday: null,
    });

    this.formCards.push(control);
  }

  onDeleteForm(index: number): void {
    this.formCards.removeAt(index);
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.formGroup.disable();
    this.timer = 5;

    this.timerSubscription = interval(1000)
      .pipe(
        take(5),
        tap(() => this.timer--),
      )
      .subscribe(() => {
        if (this.timer === 0) {
          this.submitForms();
        }
      });
  }

  onCancel(): void {
    this.timerSubscription.unsubscribe();
    this.formGroup.enable();
    this.formSubmitted = false;
  }

  private initializeFormGroup(): void {
    this.formGroup = this.fb.group({
      formCards: this.fb.array([], Validators.required),
    });

    this.onAddNewForm();
  }

  private submitForms(): void {
    this.userService
      .submitForms$(this.formCards.value)
      .pipe(first())
      .subscribe(() => {
        this.clearForms();
      });
  }

  private clearForms(): void {
    this.formCards.clear();
    this.onAddNewForm();
    this.formSubmitted = false;
  }
}
