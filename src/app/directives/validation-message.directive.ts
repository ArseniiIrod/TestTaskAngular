import {
  Directive,
  ElementRef,
  Renderer2,
  inject,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { NgControl, ValidationErrors } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[appValidationMessage]',
  standalone: true,
})
export class ValidationMessageDirective implements OnInit {
  private readonly invalidClass = 'is-invalid';
  private readonly invalidFeedbackClass = 'invalid-feedback';
  private readonly control: NgControl = inject(NgControl);
  private readonly elementRef: ElementRef = inject(ElementRef);
  private readonly renderer: Renderer2 = inject(Renderer2);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.control.statusChanges
      ?.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateValidationMessage();
      });
  }

  private updateValidationMessage(): void {
    this.removeValidationMessage();

    if (this.control.invalid && (this.control.dirty || this.control.touched)) {
      const errorMessage = this.getErrorMessage();

      this.showValidationMessage(errorMessage);
      this.markInputAsInvalid();
    } else {
      this.removeValidationMessage();
      this.markInputAsValid();
    }
  }

  private getErrorMessage(): string {
    const errors: ValidationErrors | null = this.control.errors;

    if (errors?.['invalidCountry']) {
      return 'Please provide a correct Country';
    } else if (errors?.['invalidUsername']) {
      return 'Please provide a correct Username';
    } else if (errors?.['invalidBirthday']) {
      return 'Please provide a valid Birthday';
    }

    return '';
  }

  private showValidationMessage(message: string): void {
    const errorMsg: HTMLElement = this.renderer.createElement('div');
    const text: HTMLElement = this.renderer.createText(message);
    this.renderer.appendChild(errorMsg, text);
    this.renderer.addClass(errorMsg, this.invalidFeedbackClass);
    this.renderer.appendChild(
      this.elementRef.nativeElement.parentNode,
      errorMsg,
    );
  }

  private removeValidationMessage(): void {
    const parent: HTMLElement = this.elementRef.nativeElement.parentNode;
    const message: HTMLElement | null = parent.querySelector(
      `.${this.invalidFeedbackClass}`,
    );

    if (message) {
      this.renderer.removeChild(parent, message);
    }
  }

  private markInputAsInvalid(): void {
    this.renderer.addClass(this.elementRef.nativeElement, this.invalidClass);
  }

  private markInputAsValid(): void {
    this.renderer.removeClass(this.elementRef.nativeElement, this.invalidClass);
  }
}
